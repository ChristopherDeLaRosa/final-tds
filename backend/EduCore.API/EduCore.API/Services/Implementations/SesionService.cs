using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class SesionService : ISesionService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<SesionService> _logger;

        public SesionService(EduCoreDbContext context, ILogger<SesionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<SesionDto>> GetAllAsync()
        {
            var sesiones = await _context.Sesiones
                .Include(s => s.Seccion)
                    .ThenInclude(sec => sec.Curso)
                .OrderByDescending(s => s.Fecha)
                .ToListAsync();

            return sesiones.Select(s => MapToDto(s));
        }

        public async Task<SesionDto?> GetByIdAsync(int id)
        {
            var sesion = await _context.Sesiones
                .Include(s => s.Seccion)
                    .ThenInclude(sec => sec.Curso)
                .FirstOrDefaultAsync(s => s.Id == id);

            return sesion != null ? MapToDto(sesion) : null;
        }

        public async Task<IEnumerable<SesionDto>> GetBySeccionAsync(int seccionId)
        {
            var sesiones = await _context.Sesiones
                .Include(s => s.Seccion)
                    .ThenInclude(sec => sec.Curso)
                .Where(s => s.SeccionId == seccionId)
                .OrderBy(s => s.Fecha)
                .ThenBy(s => s.HoraInicio)
                .ToListAsync();

            return sesiones.Select(s => MapToDto(s));
        }

        public async Task<IEnumerable<SesionDto>> GetBySeccionYFechaAsync(int seccionId, DateTime fechaInicio, DateTime fechaFin)
        {
            var sesiones = await _context.Sesiones
                .Include(s => s.Seccion)
                    .ThenInclude(sec => sec.Curso)
                .Where(s => s.SeccionId == seccionId && s.Fecha >= fechaInicio && s.Fecha <= fechaFin)
                .OrderBy(s => s.Fecha)
                .ThenBy(s => s.HoraInicio)
                .ToListAsync();

            return sesiones.Select(s => MapToDto(s));
        }

        public async Task<SesionDto> CreateAsync(CreateSesionDto createDto)
        {
            var sesion = new Sesion
            {
                SeccionId = createDto.SeccionId,
                Fecha = createDto.Fecha,
                HoraInicio = createDto.HoraInicio,
                HoraFin = createDto.HoraFin,
                Tema = createDto.Tema,
                Observaciones = createDto.Observaciones,
                Realizada = false
            };

            _context.Sesiones.Add(sesion);
            await _context.SaveChangesAsync();

            // Recargar con relaciones
            await _context.Entry(sesion)
                .Reference(s => s.Seccion)
                .LoadAsync();
            await _context.Entry(sesion.Seccion)
                .Reference(sec => sec.Curso)
                .LoadAsync();

            _logger.LogInformation("Sesión creada: Sección {SeccionId}, Fecha {Fecha}",
                sesion.SeccionId, sesion.Fecha.ToShortDateString());

            return MapToDto(sesion);
        }

        public async Task<SesionDto?> UpdateAsync(int id, UpdateSesionDto updateDto)
        {
            var sesion = await _context.Sesiones
                .Include(s => s.Seccion)
                    .ThenInclude(sec => sec.Curso)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sesion == null)
                return null;

            sesion.Fecha = updateDto.Fecha;
            sesion.HoraInicio = updateDto.HoraInicio;
            sesion.HoraFin = updateDto.HoraFin;
            sesion.Tema = updateDto.Tema;
            sesion.Observaciones = updateDto.Observaciones;
            sesion.Realizada = updateDto.Realizada;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Sesión actualizada: {Id}", id);

            return MapToDto(sesion);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sesion = await _context.Sesiones.FindAsync(id);

            if (sesion == null)
                return false;

            _context.Sesiones.Remove(sesion);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Sesión eliminada: {Id}", id);

            return true;
        }

        public async Task<bool> MarcarComoRealizadaAsync(int id)
        {
            var sesion = await _context.Sesiones.FindAsync(id);

            if (sesion == null)
                return false;

            sesion.Realizada = true;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Sesión marcada como realizada: {Id}", id);

            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Sesiones.AnyAsync(s => s.Id == id);
        }

        private SesionDto MapToDto(Sesion sesion)
        {
            return new SesionDto
            {
                Id = sesion.Id,
                SeccionId = sesion.SeccionId,
                CodigoSeccion = sesion.Seccion.Codigo,
                NombreCurso = sesion.Seccion.Curso.Nombre,
                Fecha = sesion.Fecha,
                HoraInicio = sesion.HoraInicio,
                HoraFin = sesion.HoraFin,
                Tema = sesion.Tema,
                Observaciones = sesion.Observaciones,
                Realizada = sesion.Realizada
            };
        }
    }
}
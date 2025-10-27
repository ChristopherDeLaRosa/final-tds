using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class DocenteService : IDocenteService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<DocenteService> _logger;

        public DocenteService(EduCoreDbContext context, ILogger<DocenteService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<DocenteDto>> GetAllAsync()
        {
            var docentes = await _context.Docentes
                .Where(d => d.Activo)
                .OrderBy(d => d.Apellidos)
                .ThenBy(d => d.Nombres)
                .ToListAsync();

            return docentes.Select(d => MapToDto(d));
        }

        public async Task<DocenteDto?> GetByIdAsync(int id)
        {
            var docente = await _context.Docentes
                .FirstOrDefaultAsync(d => d.Id == id);

            return docente != null ? MapToDto(docente) : null;
        }

        public async Task<DocenteDto?> GetByCodigoAsync(string codigo)
        {
            var docente = await _context.Docentes
                .FirstOrDefaultAsync(d => d.Codigo == codigo);

            return docente != null ? MapToDto(docente) : null;
        }

        public async Task<DocenteDto> CreateAsync(CreateDocenteDto createDto)
        {
            var docente = new Docente
            {
                Codigo = createDto.Codigo,
                Nombres = createDto.Nombres,
                Apellidos = createDto.Apellidos,
                Email = createDto.Email,
                Telefono = createDto.Telefono,
                Especialidad = createDto.Especialidad,
                FechaContratacion = DateTime.UtcNow,
                Activo = true
            };

            _context.Docentes.Add(docente);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Docente creado: {Codigo} - {Nombres} {Apellidos}",
                docente.Codigo, docente.Nombres, docente.Apellidos);

            return MapToDto(docente);
        }

        public async Task<DocenteDto?> UpdateAsync(int id, UpdateDocenteDto updateDto)
        {
            var docente = await _context.Docentes.FindAsync(id);

            if (docente == null)
                return null;

            docente.Nombres = updateDto.Nombres;
            docente.Apellidos = updateDto.Apellidos;
            docente.Email = updateDto.Email;
            docente.Telefono = updateDto.Telefono;
            docente.Especialidad = updateDto.Especialidad;
            docente.Activo = updateDto.Activo;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Docente actualizado: {Id} - {Codigo}", id, docente.Codigo);

            return MapToDto(docente);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var docente = await _context.Docentes.FindAsync(id);

            if (docente == null)
                return false;

            // Soft delete
            docente.Activo = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Docente eliminado (soft delete): {Id} - {Codigo}", id, docente.Codigo);

            return true;
        }

        public async Task<DocenteCargaAcademicaDto?> GetCargaAcademicaAsync(int id, string? periodo = null)
        {
            var docente = await _context.Docentes
                .Include(d => d.Secciones)
                    .ThenInclude(s => s.Curso)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (docente == null)
                return null;

            var secciones = docente.Secciones.AsQueryable();

            // Filtrar por periodo si se proporciona
            if (!string.IsNullOrEmpty(periodo))
            {
                secciones = secciones.Where(s => s.Periodo == periodo);
            }

            var seccionesActivas = secciones.Where(s => s.Activo).ToList();

            var seccionesDto = seccionesActivas.Select(s => new SeccionDocenteDto
            {
                SeccionId = s.Id,
                CodigoSeccion = s.Codigo,
                CodigoCurso = s.Curso.Codigo,
                NombreCurso = s.Curso.Nombre,
                Periodo = s.Periodo,
                Aula = s.Aula,
                Horario = s.Horario,
                Inscritos = s.Inscritos,
                Capacidad = s.Capacidad
            }).ToList();

            var totalHorasSemana = seccionesActivas.Sum(s => s.Curso.HorasSemana);

            return new DocenteCargaAcademicaDto
            {
                DocenteId = docente.Id,
                Codigo = docente.Codigo,
                NombreCompleto = $"{docente.Nombres} {docente.Apellidos}",
                Especialidad = docente.Especialidad,
                Secciones = seccionesDto,
                TotalHorasSemana = totalHorasSemana,
                TotalSecciones = seccionesDto.Count
            };
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Docentes.AnyAsync(d => d.Id == id);
        }

        public async Task<bool> CodigoExistsAsync(string codigo)
        {
            return await _context.Docentes.AnyAsync(d => d.Codigo == codigo);
        }

        private DocenteDto MapToDto(Docente docente)
        {
            return new DocenteDto
            {
                Id = docente.Id,
                Codigo = docente.Codigo,
                Nombres = docente.Nombres,
                Apellidos = docente.Apellidos,
                Email = docente.Email,
                Telefono = docente.Telefono,
                Especialidad = docente.Especialidad,
                FechaContratacion = docente.FechaContratacion,
                Activo = docente.Activo
            };
        }
    }
}
using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class SeccionService : ISeccionService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<SeccionService> _logger;

        public SeccionService(EduCoreDbContext context, ILogger<SeccionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<SeccionDto>> GetAllAsync()
        {
            var secciones = await _context.Secciones
                .Include(s => s.Curso)
                .Include(s => s.Docente)
                .Where(s => s.Activo)
                .OrderBy(s => s.Periodo)
                .ThenBy(s => s.Codigo)
                .ToListAsync();

            return secciones.Select(s => MapToDto(s));
        }

        public async Task<SeccionDto?> GetByIdAsync(int id)
        {
            var seccion = await _context.Secciones
                .Include(s => s.Curso)
                .Include(s => s.Docente)
                .FirstOrDefaultAsync(s => s.Id == id);

            return seccion != null ? MapToDto(seccion) : null;
        }

        public async Task<SeccionDetalleDto?> GetDetalleByIdAsync(int id)
        {
            var seccion = await _context.Secciones
                .Include(s => s.Curso)
                .Include(s => s.Docente)
                .Include(s => s.Inscripciones)
                    .ThenInclude(i => i.Estudiante)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (seccion == null)
                return null;

            return new SeccionDetalleDto
            {
                Id = seccion.Id,
                Codigo = seccion.Codigo,
                Curso = new CursoDto
                {
                    Id = seccion.Curso.Id,
                    Codigo = seccion.Curso.Codigo,
                    Nombre = seccion.Curso.Nombre,
                    Descripcion = seccion.Curso.Descripcion,
                    Creditos = seccion.Curso.Creditos,
                    HorasSemana = seccion.Curso.HorasSemana,
                    Activo = seccion.Curso.Activo
                },
                Docente = new DocenteDto
                {
                    Id = seccion.Docente.Id,
                    Codigo = seccion.Docente.Codigo,
                    Nombres = seccion.Docente.Nombres,
                    Apellidos = seccion.Docente.Apellidos,
                    Email = seccion.Docente.Email,
                    Telefono = seccion.Docente.Telefono,
                    Especialidad = seccion.Docente.Especialidad,
                    FechaContratacion = seccion.Docente.FechaContratacion,
                    Activo = seccion.Docente.Activo
                },
                Periodo = seccion.Periodo,
                Aula = seccion.Aula,
                Horario = seccion.Horario,
                Capacidad = seccion.Capacidad,
                Inscritos = seccion.Inscritos,
                Activo = seccion.Activo,
                Estudiantes = seccion.Inscripciones
                    .Where(i => i.Activo)
                    .Select(i => new EstudianteInscritoDto
                    {
                        EstudianteId = i.Estudiante.Id,
                        Matricula = i.Estudiante.Matricula,
                        NombreCompleto = $"{i.Estudiante.Nombres} {i.Estudiante.Apellidos}",
                        Email = i.Estudiante.Email,
                        FechaInscripcion = i.FechaInscripcion,
                        Estado = i.Estado
                    }).ToList()
            };
        }

        public async Task<IEnumerable<SeccionDto>> GetByPeriodoAsync(string periodo)
        {
            var secciones = await _context.Secciones
                .Include(s => s.Curso)
                .Include(s => s.Docente)
                .Where(s => s.Periodo == periodo && s.Activo)
                .OrderBy(s => s.Codigo)
                .ToListAsync();

            return secciones.Select(s => MapToDto(s));
        }

        public async Task<IEnumerable<SeccionDto>> GetByCursoAsync(int cursoId)
        {
            var secciones = await _context.Secciones
                .Include(s => s.Curso)
                .Include(s => s.Docente)
                .Where(s => s.CursoId == cursoId && s.Activo)
                .OrderBy(s => s.Periodo)
                .ThenBy(s => s.Codigo)
                .ToListAsync();

            return secciones.Select(s => MapToDto(s));
        }

        public async Task<IEnumerable<SeccionDto>> GetByDocenteAsync(int docenteId)
        {
            var secciones = await _context.Secciones
                .Include(s => s.Curso)
                .Include(s => s.Docente)
                .Where(s => s.DocenteId == docenteId && s.Activo)
                .OrderBy(s => s.Periodo)
                .ThenBy(s => s.Codigo)
                .ToListAsync();

            return secciones.Select(s => MapToDto(s));
        }

        public async Task<SeccionDto> CreateAsync(CreateSeccionDto createDto)
        {
            var seccion = new Seccion
            {
                Codigo = createDto.Codigo,
                CursoId = createDto.CursoId,
                DocenteId = createDto.DocenteId,
                Periodo = createDto.Periodo,
                Aula = createDto.Aula,
                Horario = createDto.Horario,
                Capacidad = createDto.Capacidad,
                Inscritos = 0,
                Activo = true
            };

            _context.Secciones.Add(seccion);
            await _context.SaveChangesAsync();

            // Recargar con las relaciones
            await _context.Entry(seccion)
                .Reference(s => s.Curso)
                .LoadAsync();
            await _context.Entry(seccion)
                .Reference(s => s.Docente)
                .LoadAsync();

            _logger.LogInformation("Sección creada: {Codigo} - Curso: {Curso}, Periodo: {Periodo}",
                seccion.Codigo, seccion.Curso.Nombre, seccion.Periodo);

            return MapToDto(seccion);
        }

        public async Task<SeccionDto?> UpdateAsync(int id, UpdateSeccionDto updateDto)
        {
            var seccion = await _context.Secciones
                .Include(s => s.Curso)
                .Include(s => s.Docente)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (seccion == null)
                return null;

            seccion.DocenteId = updateDto.DocenteId;
            seccion.Aula = updateDto.Aula;
            seccion.Horario = updateDto.Horario;
            seccion.Capacidad = updateDto.Capacidad;
            seccion.Activo = updateDto.Activo;

            await _context.SaveChangesAsync();

            // Recargar docente si cambió
            await _context.Entry(seccion)
                .Reference(s => s.Docente)
                .LoadAsync();

            _logger.LogInformation("Sección actualizada: {Id} - {Codigo}", id, seccion.Codigo);

            return MapToDto(seccion);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var seccion = await _context.Secciones.FindAsync(id);

            if (seccion == null)
                return false;

            // Soft delete
            seccion.Activo = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Sección eliminada (soft delete): {Id} - {Codigo}", id, seccion.Codigo);

            return true;
        }

        public async Task<HorarioDto?> GetHorarioByPeriodoAsync(string periodo)
        {
            var secciones = await _context.Secciones
                .Include(s => s.Curso)
                .Include(s => s.Docente)
                .Where(s => s.Periodo == periodo && s.Activo)
                .OrderBy(s => s.Horario)
                .ThenBy(s => s.Codigo)
                .ToListAsync();

            if (!secciones.Any())
                return null;

            return new HorarioDto
            {
                Periodo = periodo,
                Secciones = secciones.Select(s => new SeccionHorarioDto
                {
                    SeccionId = s.Id,
                    CodigoSeccion = s.Codigo,
                    CodigoCurso = s.Curso.Codigo,
                    NombreCurso = s.Curso.Nombre,
                    Docente = $"{s.Docente.Nombres} {s.Docente.Apellidos}",
                    Aula = s.Aula,
                    Horario = s.Horario
                }).ToList()
            };
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Secciones.AnyAsync(s => s.Id == id);
        }

        public async Task<bool> CodigoExistsAsync(string codigo)
        {
            return await _context.Secciones.AnyAsync(s => s.Codigo == codigo);
        }

        private SeccionDto MapToDto(Seccion seccion)
        {
            return new SeccionDto
            {
                Id = seccion.Id,
                Codigo = seccion.Codigo,
                CursoId = seccion.CursoId,
                CodigoCurso = seccion.Curso.Codigo,
                NombreCurso = seccion.Curso.Nombre,
                DocenteId = seccion.DocenteId,
                CodigoDocente = seccion.Docente.Codigo,
                NombreDocente = $"{seccion.Docente.Nombres} {seccion.Docente.Apellidos}",
                Periodo = seccion.Periodo,
                Aula = seccion.Aula,
                Horario = seccion.Horario,
                Capacidad = seccion.Capacidad,
                Inscritos = seccion.Inscritos,
                Activo = seccion.Activo
            };
        }
    }
}

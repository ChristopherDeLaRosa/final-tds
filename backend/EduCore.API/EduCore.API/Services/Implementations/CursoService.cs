using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class CursoService : ICursoService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<CursoService> _logger;

        public CursoService(EduCoreDbContext context, ILogger<CursoService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<CursoDto>> GetAllAsync()
        {
            var cursos = await _context.Cursos
                .Where(c => c.Activo)
                .OrderBy(c => c.Codigo)
                .ToListAsync();

            return cursos.Select(c => MapToDto(c));
        }

        public async Task<CursoDto?> GetByIdAsync(int id)
        {
            var curso = await _context.Cursos
                .FirstOrDefaultAsync(c => c.Id == id);

            return curso != null ? MapToDto(curso) : null;
        }

        public async Task<CursoDto?> GetByCodigoAsync(string codigo)
        {
            var curso = await _context.Cursos
                .FirstOrDefaultAsync(c => c.Codigo == codigo);

            return curso != null ? MapToDto(curso) : null;
        }

        public async Task<CursoDto> CreateAsync(CreateCursoDto createDto)
        {
            var curso = new Curso
            {
                Codigo = createDto.Codigo,
                Nombre = createDto.Nombre,
                Descripcion = createDto.Descripcion,
                Creditos = createDto.Creditos,
                HorasSemana = createDto.HorasSemana,
                Activo = true
            };

            _context.Cursos.Add(curso);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Curso creado: {Codigo} - {Nombre}", curso.Codigo, curso.Nombre);

            return MapToDto(curso);
        }

        public async Task<CursoDto?> UpdateAsync(int id, UpdateCursoDto updateDto)
        {
            var curso = await _context.Cursos.FindAsync(id);

            if (curso == null)
                return null;

            curso.Nombre = updateDto.Nombre;
            curso.Descripcion = updateDto.Descripcion;
            curso.Creditos = updateDto.Creditos;
            curso.HorasSemana = updateDto.HorasSemana;
            curso.Activo = updateDto.Activo;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Curso actualizado: {Id} - {Codigo}", id, curso.Codigo);

            return MapToDto(curso);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var curso = await _context.Cursos.FindAsync(id);

            if (curso == null)
                return false;

            // Soft delete
            curso.Activo = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Curso eliminado (soft delete): {Id} - {Codigo}", id, curso.Codigo);

            return true;
        }

        public async Task<IEnumerable<CursoCatalogoDto>> GetCatalogoAsync(string? periodo = null)
        {
            var query = _context.Cursos
                .Include(c => c.Secciones)
                    .ThenInclude(s => s.Docente)
                .Where(c => c.Activo)
                .AsQueryable();

            var cursos = await query.ToListAsync();

            var catalogo = cursos.Select(c =>
            {
                var secciones = c.Secciones.AsQueryable();

                // Filtrar secciones por periodo si se proporciona
                if (!string.IsNullOrEmpty(periodo))
                {
                    secciones = secciones.Where(s => s.Periodo == periodo);
                }

                var seccionesActivas = secciones.Where(s => s.Activo).ToList();

                return new CursoCatalogoDto
                {
                    Id = c.Id,
                    Codigo = c.Codigo,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion,
                    Creditos = c.Creditos,
                    HorasSemana = c.HorasSemana,
                    SeccionesDisponibles = seccionesActivas.Count(s => s.Inscritos < s.Capacidad),
                    Secciones = seccionesActivas.Select(s => new SeccionSimpleDto
                    {
                        Id = s.Id,
                        Codigo = s.Codigo,
                        Periodo = s.Periodo,
                        Aula = s.Aula,
                        Horario = s.Horario,
                        Docente = $"{s.Docente.Nombres} {s.Docente.Apellidos}",
                        Inscritos = s.Inscritos,
                        Capacidad = s.Capacidad
                    }).ToList()
                };
            }).ToList();

            return catalogo;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Cursos.AnyAsync(c => c.Id == id);
        }

        public async Task<bool> CodigoExistsAsync(string codigo)
        {
            return await _context.Cursos.AnyAsync(c => c.Codigo == codigo);
        }

        private CursoDto MapToDto(Curso curso)
        {
            return new CursoDto
            {
                Id = curso.Id,
                Codigo = curso.Codigo,
                Nombre = curso.Nombre,
                Descripcion = curso.Descripcion,
                Creditos = curso.Creditos,
                HorasSemana = curso.HorasSemana,
                Activo = curso.Activo
            };
        }
    }
}
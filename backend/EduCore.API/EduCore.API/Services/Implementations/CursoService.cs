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
                .OrderBy(c => c.NivelGrado)
                .ThenBy(c => c.Orden)
                .ThenBy(c => c.Nombre)
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

        public async Task<IEnumerable<CursoDto>> GetByGradoAsync(int grado)
        {
            var cursos = await _context.Cursos
                .Where(c => c.Activo && c.NivelGrado == grado)
                .OrderBy(c => c.Orden)
                .ThenBy(c => c.Nombre)
                .ToListAsync();

            return cursos.Select(c => MapToDto(c));
        }

        public async Task<IEnumerable<CursoDto>> GetByNivelAsync(string nivel)
        {
            var cursos = await _context.Cursos
                .Where(c => c.Activo && c.Nivel == nivel)
                .OrderBy(c => c.NivelGrado)
                .ThenBy(c => c.Orden)
                .ThenBy(c => c.Nombre)
                .ToListAsync();

            return cursos.Select(c => MapToDto(c));
        }

        public async Task<IEnumerable<CursoDto>> GetByAreaAsync(string area)
        {
            var cursos = await _context.Cursos
                .Where(c => c.Activo && c.AreaConocimiento == area)
                .OrderBy(c => c.NivelGrado)
                .ThenBy(c => c.Nombre)
                .ToListAsync();

            return cursos.Select(c => MapToDto(c));
        }

        public async Task<CursoDto> CreateAsync(CreateCursoDto createDto)
        {
            var curso = new Curso
            {
                Codigo = createDto.Codigo,
                Nombre = createDto.Nombre,
                Descripcion = createDto.Descripcion,
                NivelGrado = createDto.NivelGrado,
                Nivel = createDto.Nivel,
                AreaConocimiento = createDto.AreaConocimiento,
                HorasSemana = createDto.HorasSemana,
                EsObligatoria = createDto.EsObligatoria,
                Orden = createDto.Orden,
                Activo = true
            };

            _context.Cursos.Add(curso);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Curso creado: {Codigo} - {Nombre} - Grado: {Grado}",
                curso.Codigo, curso.Nombre, curso.NivelGrado
            );

            return MapToDto(curso);
        }

        public async Task<CursoDto?> UpdateAsync(int id, UpdateCursoDto updateDto)
        {
            var curso = await _context.Cursos.FindAsync(id);

            if (curso == null)
                return null;

            curso.Nombre = updateDto.Nombre;
            curso.Descripcion = updateDto.Descripcion;
            curso.AreaConocimiento = updateDto.AreaConocimiento;
            curso.HorasSemana = updateDto.HorasSemana;
            curso.EsObligatoria = updateDto.EsObligatoria;
            curso.Orden = updateDto.Orden;
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

            // Verificar si tiene grupos asociados activos
            var tieneGruposActivos = await _context.GruposCursos
                .AnyAsync(g => g.CursoId == id && g.Activo);

            if (tieneGruposActivos)
            {
                _logger.LogWarning(
                    "No se puede eliminar el curso {Id} porque tiene grupos activos",
                    id
                );
                return false;
            }

            // Soft delete
            curso.Activo = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Curso eliminado (soft delete): {Id} - {Codigo}", id, curso.Codigo);

            return true;
        }

        public async Task<IEnumerable<CursoPorGradoDto>> GetCursosPorGradoAsync(
            int grado,
            string periodo)
        {
            var cursos = await _context.Cursos
                .Include(c => c.GruposCursos.Where(g => g.Activo && g.Grado == grado && g.Periodo == periodo))
                    .ThenInclude(g => g.Docente)
                .Include(c => c.GruposCursos.Where(g => g.Activo && g.Grado == grado && g.Periodo == periodo))
                    .ThenInclude(g => g.Aula)
                .Where(c => c.Activo && c.NivelGrado == grado)
                .OrderBy(c => c.Orden)
                .ThenBy(c => c.Nombre)
                .ToListAsync();

            return cursos.Select(c =>
            {
                var grupos = c.GruposCursos.ToList();

                return new CursoPorGradoDto
                {
                    Id = c.Id,
                    Codigo = c.Codigo,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion,
                    AreaConocimiento = c.AreaConocimiento,
                    EsObligatoria = c.EsObligatoria,
                    HorasSemana = c.HorasSemana,
                    GruposDisponibles = grupos.Count(g => g.CantidadEstudiantes < g.CapacidadMaxima),
                    Grupos = grupos.Select(g => new GrupoSimpleDto
                    {
                        Id = g.Id,
                        Codigo = g.Codigo,
                        Seccion = g.Seccion,
                        Horario = g.Horario ?? string.Empty,
                        Aula = g.Aula?.AulaFisica,
                        Docente = $"{g.Docente.Nombres} {g.Docente.Apellidos}",
                        CantidadEstudiantes = g.CantidadEstudiantes,
                        CapacidadMaxima = g.CapacidadMaxima,
                        DisponibleParaInscripcion = g.CantidadEstudiantes < g.CapacidadMaxima
                    }).ToList()
                };
            }).ToList();
        }

        public async Task<Dictionary<string, List<CursoDto>>> GetCursosPorAreaAsync(int grado)
        {
            var cursos = await _context.Cursos
                .Where(c => c.Activo && c.NivelGrado == grado)
                .OrderBy(c => c.AreaConocimiento)
                .ThenBy(c => c.Orden)
                .ThenBy(c => c.Nombre)
                .ToListAsync();

            return cursos
                .GroupBy(c => c.AreaConocimiento)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(c => MapToDto(c)).ToList()
                );
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
                NivelGrado = curso.NivelGrado,
                Nivel = curso.Nivel,
                AreaConocimiento = curso.AreaConocimiento,
                HorasSemana = curso.HorasSemana,
                EsObligatoria = curso.EsObligatoria,
                Orden = curso.Orden,
                Activo = curso.Activo
            };
        }
    }
}
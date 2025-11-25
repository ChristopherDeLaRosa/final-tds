using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class GrupoCursoService : IGrupoCursoService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<GrupoCursoService> _logger;

        public GrupoCursoService(EduCoreDbContext context, ILogger<GrupoCursoService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<GrupoCursoDto>> GetAllAsync()
        {
            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Where(g => g.Activo)
                .OrderBy(g => g.Grado)
                .ThenBy(g => g.Seccion)
                .ThenBy(g => g.Curso.Nombre)
                .ToListAsync();

            return grupos.Select(g => MapToDto(g));
        }

        public async Task<GrupoCursoDto?> GetByIdAsync(int id)
        {
            var grupo = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .FirstOrDefaultAsync(g => g.Id == id);

            return grupo != null ? MapToDto(grupo) : null;
        }

        public async Task<GrupoCursoDetalleDto?> GetDetalleByIdAsync(int id)
        {
            var grupo = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Include(g => g.Inscripciones)
                    .ThenInclude(i => i.Estudiante)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (grupo == null)
                return null;

            return new GrupoCursoDetalleDto
            {
                Id = grupo.Id,
                Codigo = grupo.Codigo,
                Curso = new CursoDto
                {
                    Id = grupo.Curso.Id,
                    Codigo = grupo.Curso.Codigo,
                    Nombre = grupo.Curso.Nombre,
                    Descripcion = grupo.Curso.Descripcion,
                    NivelGrado = grupo.Curso.NivelGrado,
                    Nivel = grupo.Curso.Nivel,
                    AreaConocimiento = grupo.Curso.AreaConocimiento,
                    HorasSemana = grupo.Curso.HorasSemana,
                    EsObligatoria = grupo.Curso.EsObligatoria,
                    Orden = grupo.Curso.Orden,
                    Activo = grupo.Curso.Activo
                },
                Docente = new DocenteDto
                {
                    Id = grupo.Docente.Id,
                    Codigo = grupo.Docente.Codigo,
                    Nombres = grupo.Docente.Nombres,
                    Apellidos = grupo.Docente.Apellidos,
                    Email = grupo.Docente.Email,
                    Telefono = grupo.Docente.Telefono,
                    Especialidad = grupo.Docente.Especialidad,
                    FechaContratacion = grupo.Docente.FechaContratacion,
                    Activo = grupo.Docente.Activo
                },
                Grado = grupo.Grado,
                Seccion = grupo.Seccion,
                Anio = grupo.Anio,
                Periodo = grupo.Periodo,
                Aula = grupo.Aula,
                Horario = grupo.Horario,
                CapacidadMaxima = grupo.CapacidadMaxima,
                CantidadEstudiantes = grupo.CantidadEstudiantes,
                Activo = grupo.Activo,
                Estudiantes = grupo.Inscripciones
                    .Where(i => i.Activo)
                    .Select(i => new EstudianteGrupoDto
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

        public async Task<IEnumerable<GrupoCursoDto>> GetByPeriodoAsync(string periodo)
        {
            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Where(g => g.Periodo == periodo && g.Activo)
                .OrderBy(g => g.Grado)
                .ThenBy(g => g.Seccion)
                .ThenBy(g => g.Curso.Nombre)
                .ToListAsync();

            return grupos.Select(g => MapToDto(g));
        }

        public async Task<IEnumerable<GrupoCursoDto>> GetByGradoSeccionAsync(int grado, string seccion, string periodo)
        {
            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Where(g => g.Grado == grado && g.Seccion == seccion && g.Periodo == periodo && g.Activo)
                .OrderBy(g => g.Curso.Orden)
                .ThenBy(g => g.Curso.Nombre)
                .ToListAsync();

            return grupos.Select(g => MapToDto(g));
        }

        public async Task<IEnumerable<GrupoCursoDto>> GetByCursoAsync(int cursoId)
        {
            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Where(g => g.CursoId == cursoId && g.Activo)
                .OrderBy(g => g.Grado)
                .ThenBy(g => g.Seccion)
                .ToListAsync();

            return grupos.Select(g => MapToDto(g));
        }

        public async Task<IEnumerable<GrupoCursoDto>> GetByDocenteAsync(int docenteId)
        {
            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Where(g => g.DocenteId == docenteId && g.Activo)
                .OrderBy(g => g.Grado)
                .ThenBy(g => g.Seccion)
                .ThenBy(g => g.Curso.Nombre)
                .ToListAsync();

            return grupos.Select(g => MapToDto(g));
        }

        public async Task<GrupoCursoDto> CreateAsync(CreateGrupoCursoDto createDto)
        {
            var grupo = new GrupoCurso
            {
                Codigo = createDto.Codigo,
                CursoId = createDto.CursoId,
                DocenteId = createDto.DocenteId,
                Grado = createDto.Grado,
                Seccion = createDto.Seccion,
                Anio = createDto.Anio,
                Periodo = createDto.Periodo,
                Aula = createDto.Aula,
                Horario = createDto.Horario,
                CapacidadMaxima = createDto.CapacidadMaxima,
                CantidadEstudiantes = 0,
                Activo = true
            };

            _context.GruposCursos.Add(grupo);
            await _context.SaveChangesAsync();

            // Recargar con las relaciones
            await _context.Entry(grupo)
                .Reference(g => g.Curso)
                .LoadAsync();
            await _context.Entry(grupo)
                .Reference(g => g.Docente)
                .LoadAsync();

            _logger.LogInformation(
                "Grupo creado: {Codigo} - Curso: {Curso}, Grado: {Grado}, Seccion: {Seccion}",
                grupo.Codigo, grupo.Curso.Nombre, grupo.Grado, grupo.Seccion
            );

            return MapToDto(grupo);
        }

        public async Task<GrupoCursoDto?> UpdateAsync(int id, UpdateGrupoCursoDto updateDto)
        {
            var grupo = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (grupo == null)
                return null;

            grupo.DocenteId = updateDto.DocenteId;
            grupo.Aula = updateDto.Aula;
            grupo.Horario = updateDto.Horario;
            grupo.CapacidadMaxima = updateDto.CapacidadMaxima;
            grupo.Activo = updateDto.Activo;

            await _context.SaveChangesAsync();

            // Recargar docente si cambió
            await _context.Entry(grupo)
                .Reference(g => g.Docente)
                .LoadAsync();

            _logger.LogInformation("Grupo actualizado: {Id} - {Codigo}", id, grupo.Codigo);

            return MapToDto(grupo);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var grupo = await _context.GruposCursos.FindAsync(id);

            if (grupo == null)
                return false;

            // Verificar si tiene estudiantes inscritos
            var tieneEstudiantes = await _context.Inscripciones
                .AnyAsync(i => i.GrupoCursoId == id && i.Activo);

            if (tieneEstudiantes)
            {
                _logger.LogWarning(
                    "No se puede eliminar el grupo {Id} porque tiene estudiantes inscritos",
                    id
                );
                return false;
            }

            // Soft delete
            grupo.Activo = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Grupo eliminado (soft delete): {Id} - {Codigo}", id, grupo.Codigo);

            return true;
        }

        public async Task<HorarioGradoDto?> GetHorarioByGradoSeccionAsync(
            int grado,
            string seccion,
            string periodo)
        {
            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Where(g => g.Grado == grado && g.Seccion == seccion && g.Periodo == periodo && g.Activo)
                .OrderBy(g => g.Curso.Orden)
                .ThenBy(g => g.Horario)
                .ToListAsync();

            if (!grupos.Any())
                return null;

            return new HorarioGradoDto
            {
                Periodo = periodo,
                Grado = grado,
                Seccion = seccion,
                Grupos = grupos.Select(g => new GrupoCursoHorarioDto
                {
                    GrupoId = g.Id,
                    CodigoGrupo = g.Codigo,
                    CodigoCurso = g.Curso.Codigo,
                    NombreCurso = g.Curso.Nombre,
                    AreaConocimiento = g.Curso.AreaConocimiento,
                    Docente = $"{g.Docente.Nombres} {g.Docente.Apellidos}",
                    Aula = g.Aula,
                    Horario = g.Horario
                }).ToList()
            };
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.GruposCursos.AnyAsync(g => g.Id == id);
        }

        public async Task<bool> CodigoExistsAsync(string codigo)
        {
            return await _context.GruposCursos.AnyAsync(g => g.Codigo == codigo);
        }

        private GrupoCursoDto MapToDto(GrupoCurso grupo)
        {
            return new GrupoCursoDto
            {
                Id = grupo.Id,
                Codigo = grupo.Codigo,
                CursoId = grupo.CursoId,
                CodigoCurso = grupo.Curso.Codigo,
                NombreCurso = grupo.Curso.Nombre,
                DocenteId = grupo.DocenteId,
                CodigoDocente = grupo.Docente.Codigo,
                NombreDocente = $"{grupo.Docente.Nombres} {grupo.Docente.Apellidos}",
                Grado = grupo.Grado,
                Seccion = grupo.Seccion,
                Anio = grupo.Anio,
                Periodo = grupo.Periodo,
                Aula = grupo.Aula,
                Horario = grupo.Horario,
                CapacidadMaxima = grupo.CapacidadMaxima,
                CantidadEstudiantes = grupo.CantidadEstudiantes,
                Activo = grupo.Activo
            };
        }
    }
}
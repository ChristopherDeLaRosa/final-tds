using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class AsistenciaService : IAsistenciaService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<AsistenciaService> _logger;

        public AsistenciaService(EduCoreDbContext context, ILogger<AsistenciaService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<AsistenciaDto?> GetByIdAsync(int id)
        {
            var asistencia = await _context.Asistencias
                .Include(a => a.Sesion)
                .Include(a => a.Estudiante)
                .FirstOrDefaultAsync(a => a.Id == id);

            return asistencia != null ? MapToDto(asistencia) : null;
        }

        public async Task<IEnumerable<AsistenciaDto>> GetBySesionAsync(int sesionId)
        {
            var asistencias = await _context.Asistencias
                .Include(a => a.Sesion)
                .Include(a => a.Estudiante)
                .Where(a => a.SesionId == sesionId)
                .OrderBy(a => a.Estudiante.Apellidos)
                .ThenBy(a => a.Estudiante.Nombres)
                .ToListAsync();

            return asistencias.Select(a => MapToDto(a));
        }

        public async Task<IEnumerable<AsistenciaDto>> GetByEstudianteAsync(int estudianteId)
        {
            var asistencias = await _context.Asistencias
                .Include(a => a.Sesion)
                    .ThenInclude(s => s.GrupoCurso)
                        .ThenInclude(g => g.Curso)
                .Include(a => a.Estudiante)
                .Where(a => a.EstudianteId == estudianteId)
                .OrderByDescending(a => a.Sesion.Fecha)
                .ToListAsync();

            return asistencias.Select(a => MapToDto(a));
        }

        public async Task<IEnumerable<AsistenciaDto>> GetByEstudianteGrupoCursoAsync(
            int estudianteId,
            int grupoCursoId)
        {
            var asistencias = await _context.Asistencias
                .Include(a => a.Sesion)
                    .ThenInclude(s => s.GrupoCurso)
                        .ThenInclude(g => g.Curso)
                .Include(a => a.Estudiante)
                .Where(a => a.EstudianteId == estudianteId &&
                           a.Sesion.GrupoCursoId == grupoCursoId)
                .OrderByDescending(a => a.Sesion.Fecha)
                .ToListAsync();

            return asistencias.Select(a => MapToDto(a));
        }

        public async Task<AsistenciaDto> CreateAsync(CreateAsistenciaDto createDto)
        {
            // Verificar si ya existe registro
            var yaRegistrada = await YaRegistradaAsync(createDto.SesionId, createDto.EstudianteId);
            if (yaRegistrada)
            {
                throw new InvalidOperationException(
                    "Ya existe un registro de asistencia para este estudiante en esta sesión"
                );
            }

            var asistencia = new Asistencia
            {
                SesionId = createDto.SesionId,
                EstudianteId = createDto.EstudianteId,
                Estado = createDto.Estado,
                Observaciones = createDto.Observaciones,
                FechaRegistro = DateTime.UtcNow,
                NotificacionEnviada = false
            };

            _context.Asistencias.Add(asistencia);
            await _context.SaveChangesAsync();

            // Recargar con relaciones
            await _context.Entry(asistencia)
                .Reference(a => a.Sesion)
                .LoadAsync();
            await _context.Entry(asistencia)
                .Reference(a => a.Estudiante)
                .LoadAsync();

            _logger.LogInformation(
                "Asistencia registrada: Estudiante {EstudianteId} - Sesión {SesionId} - Estado: {Estado}",
                asistencia.EstudianteId, asistencia.SesionId, asistencia.Estado
            );

            return MapToDto(asistencia);
        }

        public async Task<AsistenciaDto?> UpdateAsync(int id, UpdateAsistenciaDto updateDto)
        {
            var asistencia = await _context.Asistencias
                .Include(a => a.Sesion)
                .Include(a => a.Estudiante)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (asistencia == null)
                return null;

            asistencia.Estado = updateDto.Estado;
            asistencia.Observaciones = updateDto.Observaciones;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Asistencia actualizada: {Id}", id);

            return MapToDto(asistencia);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var asistencia = await _context.Asistencias.FindAsync(id);

            if (asistencia == null)
                return false;

            _context.Asistencias.Remove(asistencia);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Asistencia eliminada: {Id}", id);

            return true;
        }

        public async Task<List<AsistenciaDto>> RegistrarAsistenciaGrupoAsync(
            RegistrarAsistenciaGrupoDto registroDto)
        {
            var asistenciasCreadas = new List<Asistencia>();

            foreach (var asistenciaDto in registroDto.Asistencias)
            {
                // Verificar si ya existe
                var yaRegistrada = await YaRegistradaAsync(
                    registroDto.SesionId,
                    asistenciaDto.EstudianteId
                );

                if (yaRegistrada)
                {
                    _logger.LogWarning(
                        "Asistencia ya registrada para estudiante {EstudianteId} en sesión {SesionId}",
                        asistenciaDto.EstudianteId, registroDto.SesionId
                    );
                    continue;
                }

                var asistencia = new Asistencia
                {
                    SesionId = registroDto.SesionId,
                    EstudianteId = asistenciaDto.EstudianteId,
                    Estado = asistenciaDto.Estado,
                    Observaciones = asistenciaDto.Observaciones,
                    FechaRegistro = DateTime.UtcNow,
                    NotificacionEnviada = false
                };

                _context.Asistencias.Add(asistencia);
                asistenciasCreadas.Add(asistencia);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Asistencia grupal registrada: {Cantidad} estudiantes en sesión {SesionId}",
                asistenciasCreadas.Count, registroDto.SesionId
            );

            // Recargar con relaciones
            foreach (var asistencia in asistenciasCreadas)
            {
                await _context.Entry(asistencia)
                    .Reference(a => a.Sesion)
                    .LoadAsync();
                await _context.Entry(asistencia)
                    .Reference(a => a.Estudiante)
                    .LoadAsync();
            }

            return asistenciasCreadas.Select(a => MapToDto(a)).ToList();
        }

        public async Task<ReporteAsistenciaEstudianteDto?> GetReporteEstudianteAsync(
            int estudianteId,
            int? grupoCursoId = null)
        {
            var estudiante = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.Id == estudianteId);

            if (estudiante == null)
                return null;

            // Query base de asistencias
            var query = _context.Asistencias
                .Include(a => a.Sesion)
                .Where(a => a.EstudianteId == estudianteId);

            // Filtrar por grupo si se especifica
            if (grupoCursoId.HasValue)
            {
                query = query.Where(a => a.Sesion.GrupoCursoId == grupoCursoId.Value);
            }

            var asistencias = await query.ToListAsync();

            // Calcular estadísticas
            var totalSesiones = asistencias.Count;
            var presentes = asistencias.Count(a => a.Estado == "Presente");
            var ausentes = asistencias.Count(a => a.Estado == "Ausente");
            var tardanzas = asistencias.Count(a => a.Estado == "Tardanza");
            var justificados = asistencias.Count(a => a.Estado == "Justificado");

            var porcentajeAsistencia = totalSesiones > 0
                ? (decimal)presentes / totalSesiones * 100
                : 0;

            return new ReporteAsistenciaEstudianteDto
            {
                EstudianteId = estudiante.Id,
                Matricula = estudiante.Matricula,
                NombreCompleto = $"{estudiante.Nombres} {estudiante.Apellidos}",
                GradoActual = estudiante.GradoActual,
                SeccionActual = estudiante.SeccionActual,
                TotalSesiones = totalSesiones,
                Presentes = presentes,
                Ausentes = ausentes,
                Tardanzas = tardanzas,
                Justificados = justificados,
                PorcentajeAsistencia = Math.Round(porcentajeAsistencia, 2)
            };
        }

        public async Task<ReporteAsistenciaGrupoCursoDto?> GetReporteGrupoCursoAsync(
            int grupoCursoId,
            string? periodo = null)
        {
            var grupoCurso = await _context.GruposCursos
                .Include(g => g.Curso)
                .FirstOrDefaultAsync(g => g.Id == grupoCursoId);

            if (grupoCurso == null)
                return null;

            // Obtener todas las sesiones del grupo
            var sesionesQuery = _context.Sesiones
                .Where(s => s.GrupoCursoId == grupoCursoId && s.Realizada);

            var totalSesiones = await sesionesQuery.CountAsync();

            // Obtener estudiantes inscritos
            var estudiantes = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Where(i => i.GrupoCursoId == grupoCursoId && i.Activo)
                .Select(i => i.Estudiante)
                .ToListAsync();

            var estudiantesResumen = new List<AsistenciaEstudianteResumenDto>();

            foreach (var estudiante in estudiantes)
            {
                var asistencias = await _context.Asistencias
                    .Include(a => a.Sesion)
                    .Where(a => a.EstudianteId == estudiante.Id &&
                               a.Sesion.GrupoCursoId == grupoCursoId)
                    .ToListAsync();

                var presentes = asistencias.Count(a => a.Estado == "Presente");
                var ausentes = asistencias.Count(a => a.Estado == "Ausente");
                var tardanzas = asistencias.Count(a => a.Estado == "Tardanza");

                var porcentaje = totalSesiones > 0
                    ? (decimal)presentes / totalSesiones * 100
                    : 0;

                estudiantesResumen.Add(new AsistenciaEstudianteResumenDto
                {
                    EstudianteId = estudiante.Id,
                    Matricula = estudiante.Matricula,
                    NombreCompleto = $"{estudiante.Nombres} {estudiante.Apellidos}",
                    Presentes = presentes,
                    Ausentes = ausentes,
                    Tardanzas = tardanzas,
                    PorcentajeAsistencia = Math.Round(porcentaje, 2)
                });
            }

            var porcentajePromedio = estudiantesResumen.Any()
                ? estudiantesResumen.Average(e => e.PorcentajeAsistencia)
                : 0;

            return new ReporteAsistenciaGrupoCursoDto
            {
                GrupoCursoId = grupoCurso.Id,
                CodigoGrupo = grupoCurso.Codigo,
                NombreCurso = grupoCurso.Curso.Nombre,
                Grado = grupoCurso.Grado,
                Seccion = grupoCurso.Seccion,
                Periodo = grupoCurso.Periodo?.Nombre ?? string.Empty,
                TotalSesiones = totalSesiones,
                PorcentajeAsistenciaPromedio = Math.Round(porcentajePromedio, 2),
                Estudiantes = estudiantesResumen.OrderBy(e => e.NombreCompleto).ToList()
            };
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Asistencias.AnyAsync(a => a.Id == id);
        }

        public async Task<bool> YaRegistradaAsync(int sesionId, int estudianteId)
        {
            return await _context.Asistencias
                .AnyAsync(a => a.SesionId == sesionId && a.EstudianteId == estudianteId);
        }

        private AsistenciaDto MapToDto(Asistencia asistencia)
        {
            return new AsistenciaDto
            {
                Id = asistencia.Id,
                SesionId = asistencia.SesionId,
                FechaSesion = asistencia.Sesion.Fecha,
                TemaSesion = asistencia.Sesion.Tema ?? string.Empty,
                EstudianteId = asistencia.EstudianteId,
                MatriculaEstudiante = asistencia.Estudiante.Matricula,
                NombreEstudiante = $"{asistencia.Estudiante.Nombres} {asistencia.Estudiante.Apellidos}",
                Estado = asistencia.Estado,
                Observaciones = asistencia.Observaciones,
                FechaRegistro = asistencia.FechaRegistro,
                NotificacionEnviada = asistencia.NotificacionEnviada
            };
        }
    }
}


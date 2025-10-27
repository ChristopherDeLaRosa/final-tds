using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class ReporteService : IReporteService
    {
        private readonly EduCoreDbContext _context;
        private readonly ICalificacionService _calificacionService;
        private readonly IAsistenciaService _asistenciaService;
        private readonly ILogger<ReporteService> _logger;

        public ReporteService(
            EduCoreDbContext context,
            ICalificacionService calificacionService,
            IAsistenciaService asistenciaService,
            ILogger<ReporteService> logger)
        {
            _context = context;
            _calificacionService = calificacionService;
            _asistenciaService = asistenciaService;
            _logger = logger;
        }

        public async Task<ReporteNotasSeccionDto?> GenerarReporteNotasSeccionAsync(int seccionId)
        {
            var seccion = await _context.Secciones
                .Include(s => s.Curso)
                .Include(s => s.Docente)
                .Include(s => s.Inscripciones)
                    .ThenInclude(i => i.Estudiante)
                .FirstOrDefaultAsync(s => s.Id == seccionId);

            if (seccion == null)
                return null;

            var estudiantes = new List<EstudianteNotaDto>();

            foreach (var inscripcion in seccion.Inscripciones.Where(i => i.Activo))
            {
                var promedio = await _calificacionService.GetPromedioEstudianteAsync(seccionId, inscripcion.EstudianteId);
                if (promedio != null)
                {
                    estudiantes.Add(new EstudianteNotaDto
                    {
                        Matricula = promedio.Matricula,
                        NombreCompleto = promedio.NombreCompleto,
                        PromedioFinal = promedio.PromedioFinal,
                        Estado = promedio.Estado
                    });
                }
            }

            var promedioGeneral = estudiantes.Any() ? estudiantes.Average(e => e.PromedioFinal) : 0;
            var totalAprobados = estudiantes.Count(e => e.PromedioFinal >= 70);
            var totalReprobados = estudiantes.Count(e => e.PromedioFinal < 70 && e.PromedioFinal > 0);
            var porcentajeAprobacion = estudiantes.Any() ? (decimal)totalAprobados / estudiantes.Count * 100 : 0;

            return new ReporteNotasSeccionDto
            {
                SeccionId = seccion.Id,
                CodigoSeccion = seccion.Codigo,
                CodigoCurso = seccion.Curso.Codigo,
                NombreCurso = seccion.Curso.Nombre,
                Periodo = seccion.Periodo,
                Docente = $"{seccion.Docente.Nombres} {seccion.Docente.Apellidos}",
                FechaGeneracion = DateTime.UtcNow,
                Estudiantes = estudiantes.OrderByDescending(e => e.PromedioFinal).ToList(),
                PromedioGeneral = Math.Round(promedioGeneral, 2),
                TotalAprobados = totalAprobados,
                TotalReprobados = totalReprobados,
                PorcentajeAprobacion = Math.Round(porcentajeAprobacion, 2)
            };
        }

        public async Task<ReporteAsistenciaSeccionDto?> GenerarReporteAsistenciaSeccionAsync(int seccionId)
        {
            var resumen = await _asistenciaService.GetResumenAsistenciaSeccionAsync(seccionId);

            if (resumen == null)
                return null;

            var estudiantes = resumen.Estudiantes.Select(e => new EstudianteAsistenciaReporteDto
            {
                Matricula = e.Matricula,
                NombreCompleto = e.NombreCompleto,
                Presentes = e.TotalPresente,
                Ausentes = e.TotalAusente,
                Tardanzas = e.TotalTardanza,
                PorcentajeAsistencia = e.PorcentajeAsistencia,
                Estado = e.EstadoAsistencia
            }).OrderByDescending(e => e.PorcentajeAsistencia).ToList();

            var promedioGeneral = estudiantes.Any() ? estudiantes.Average(e => e.PorcentajeAsistencia) : 0;

            return new ReporteAsistenciaSeccionDto
            {
                SeccionId = resumen.SeccionId,
                CodigoSeccion = resumen.CodigoSeccion,
                NombreCurso = resumen.NombreCurso,
                Periodo = resumen.Periodo,
                FechaGeneracion = DateTime.UtcNow,
                TotalSesiones = resumen.SesionesRealizadas,
                Estudiantes = estudiantes,
                PromedioAsistenciaGeneral = Math.Round(promedioGeneral, 2)
            };
        }

        public async Task<ReporteRendimientoEstudianteDto?> GenerarReporteRendimientoEstudianteAsync(int estudianteId)
        {
            var estudiante = await _context.Estudiantes.FindAsync(estudianteId);
            if (estudiante == null)
                return null;

            var historial = await _context.Inscripciones
                .Include(i => i.Seccion)
                    .ThenInclude(s => s.Curso)
                .Where(i => i.EstudianteId == estudianteId)
                .ToListAsync();

            var cursos = new List<CursoRendimientoDto>();

            foreach (var inscripcion in historial)
            {
                var promedio = await _calificacionService.GetPromedioEstudianteAsync(inscripcion.SeccionId, estudianteId);
                var asistenciaResumen = await _asistenciaService.GetResumenAsistenciaEstudianteAsync(estudianteId);

                var seccionAsistencia = asistenciaResumen?.Secciones
                    .FirstOrDefault(s => s.SeccionId == inscripcion.SeccionId);

                cursos.Add(new CursoRendimientoDto
                {
                    CodigoCurso = inscripcion.Seccion.Curso.Codigo,
                    NombreCurso = inscripcion.Seccion.Curso.Nombre,
                    Periodo = inscripcion.Seccion.Periodo,
                    PromedioFinal = promedio?.PromedioFinal ?? 0,
                    PorcentajeAsistencia = seccionAsistencia?.PorcentajeAsistencia ?? 0,
                    EstadoCurso = inscripcion.Estado
                });
            }

            var promedioGeneral = cursos.Any(c => c.PromedioFinal > 0)
                ? cursos.Where(c => c.PromedioFinal > 0).Average(c => c.PromedioFinal)
                : 0;

            var porcentajeAsistenciaGeneral = cursos.Any()
                ? cursos.Average(c => c.PorcentajeAsistencia)
                : 0;

            return new ReporteRendimientoEstudianteDto
            {
                EstudianteId = estudiante.Id,
                Matricula = estudiante.Matricula,
                NombreCompleto = $"{estudiante.Nombres} {estudiante.Apellidos}",
                Email = estudiante.Email,
                FechaGeneracion = DateTime.UtcNow,
                Cursos = cursos,
                PromedioGeneral = Math.Round(promedioGeneral, 2),
                PorcentajeAsistenciaGeneral = Math.Round(porcentajeAsistenciaGeneral, 2),
                TotalCursosAprobados = cursos.Count(c => c.PromedioFinal >= 70),
                TotalCursosReprobados = cursos.Count(c => c.PromedioFinal < 70 && c.PromedioFinal > 0)
            };
        }

        public async Task<ReporteEstadisticasGeneralesDto> GenerarEstadisticasGeneralesAsync(string? periodo = null)
        {
            // Estadísticas de estudiantes
            var totalEstudiantesActivos = await _context.Estudiantes.CountAsync(e => e.Activo);
            var totalEstudiantesInactivos = await _context.Estudiantes.CountAsync(e => !e.Activo);

            var inscripciones = await _context.Inscripciones
                .Include(i => i.Seccion)
                .Where(i => periodo == null || i.Seccion.Periodo == periodo)
                .ToListAsync();

            var promediosEstudiantes = inscripciones
                .Where(i => i.PromedioFinal.HasValue)
                .Select(i => i.PromedioFinal!.Value);

            var promedioGeneralEstudiantes = promediosEstudiantes.Any()
                ? promediosEstudiantes.Average()
                : 0;

            // Estadísticas de docentes
            var totalDocentesActivos = await _context.Docentes.CountAsync(d => d.Activo);
            var totalDocentesInactivos = await _context.Docentes.CountAsync(d => !d.Activo);

            var seccionesQuery = _context.Secciones
                .Include(s => s.Curso)
                .Where(s => s.Activo && (periodo == null || s.Periodo == periodo));

            var horasPorDocente = await seccionesQuery
                .GroupBy(s => s.DocenteId)
                .Select(g => g.Sum(s => s.Curso.HorasSemana))
                .ToListAsync();

            var promedioHorasSemanales = horasPorDocente.Any()
                ? horasPorDocente.Average()
                : 0;

            // Estadísticas de cursos
            var totalCursosActivos = await _context.Cursos.CountAsync(c => c.Activo);
            var totalCursosInactivos = await _context.Cursos.CountAsync(c => !c.Activo);
            var promedioCreditosPorCurso = await _context.Cursos
                .Where(c => c.Activo)
                .AverageAsync(c => (decimal)c.Creditos);

            // Estadísticas de secciones
            var secciones = await seccionesQuery.ToListAsync();
            var totalSeccionesActivas = secciones.Count;
            var totalSeccionesInactivas = await _context.Secciones
                .CountAsync(s => !s.Activo && (periodo == null || s.Periodo == periodo));

            var promedioEstudiantesPorSeccion = secciones.Any()
                ? secciones.Average(s => (decimal)s.Inscritos)
                : 0;

            var capacidadTotal = secciones.Sum(s => s.Capacidad);
            var inscritosTotal = secciones.Sum(s => s.Inscritos);
            var porcentajeOcupacion = capacidadTotal > 0
                ? (decimal)inscritosTotal / capacidadTotal * 100
                : 0;

            return new ReporteEstadisticasGeneralesDto
            {
                FechaGeneracion = DateTime.UtcNow,
                Periodo = periodo ?? "Todos",
                Estudiantes = new EstadisticasEstudiantesDto
                {
                    TotalActivos = totalEstudiantesActivos,
                    TotalInactivos = totalEstudiantesInactivos,
                    PromedioGeneralEstudiantes = Math.Round(promedioGeneralEstudiantes, 2)
                },
                Docentes = new EstadisticasDocentesDto
                {
                    TotalActivos = totalDocentesActivos,
                    TotalInactivos = totalDocentesInactivos,
                    PromedioHorasSemanales = (decimal)Math.Round(promedioHorasSemanales, 2)
                },
                Cursos = new EstadisticasCursosDto
                {
                    TotalActivos = totalCursosActivos,
                    TotalInactivos = totalCursosInactivos,
                    PromedioCreditosPorCurso = Math.Round(promedioCreditosPorCurso, 2)
                },
                Secciones = new EstadisticasSeccionesDto
                {
                    TotalActivas = totalSeccionesActivas,
                    TotalInactivas = totalSeccionesInactivas,
                    PromedioEstudiantesPorSeccion = Math.Round(promedioEstudiantesPorSeccion, 2),
                    PorcentajeOcupacion = Math.Round(porcentajeOcupacion, 2)
                }
            };
        }

        public async Task<ReporteRankingEstudiantesDto> GenerarRankingEstudiantesAsync(string periodo)
        {
            var inscripciones = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Include(i => i.Seccion)
                .Where(i => i.Seccion.Periodo == periodo && i.Activo)
                .GroupBy(i => i.EstudianteId)
                .Select(g => new
                {
                    EstudianteId = g.Key,
                    Estudiante = g.First().Estudiante,
                    PromedioGeneral = g.Where(i => i.PromedioFinal.HasValue).Average(i => i.PromedioFinal),
                    TotalCursos = g.Count()
                })
                .OrderByDescending(x => x.PromedioGeneral)
                .ToListAsync();

            var ranking = new List<EstudianteRankingDto>();
            int posicion = 1;

            foreach (var item in inscripciones)
            {
                var resumenAsistencia = await _asistenciaService.GetResumenAsistenciaEstudianteAsync(item.EstudianteId);
                var porcentajeAsistencia = resumenAsistencia?.Secciones
                    .Where(s => s.Periodo == periodo)
                    .Average(s => s.PorcentajeAsistencia) ?? 0;

                ranking.Add(new EstudianteRankingDto
                {
                    Posicion = posicion++,
                    Matricula = item.Estudiante.Matricula,
                    NombreCompleto = $"{item.Estudiante.Nombres} {item.Estudiante.Apellidos}",
                    PromedioGeneral = Math.Round(item.PromedioGeneral ?? 0, 2),
                    PorcentajeAsistencia = Math.Round(porcentajeAsistencia, 2),
                    TotalCursosActuales = item.TotalCursos
                });
            }

            return new ReporteRankingEstudiantesDto
            {
                Periodo = periodo,
                FechaGeneracion = DateTime.UtcNow,
                Ranking = ranking
            };
        }
    }
}

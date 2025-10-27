using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportesController : ControllerBase
    {
        private readonly IReporteService _reporteService;
        private readonly ILogger<ReportesController> _logger;

        public ReportesController(IReporteService reporteService, ILogger<ReportesController> logger)
        {
            _reporteService = reporteService;
            _logger = logger;
        }

        /// <summary>
        /// Generar reporte de notas de una sección
        /// </summary>
        /// <param name="seccionId">ID de la sección</param>
        /// <returns>Reporte completo de notas</returns>
        [HttpGet("notas/seccion/{seccionId}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<ReporteNotasSeccionDto>> ReporteNotasSeccion(int seccionId)
        {
            try
            {
                var reporte = await _reporteService.GenerarReporteNotasSeccionAsync(seccionId);

                if (reporte == null)
                    return NotFound(new { message = "Sección no encontrada" });

                return Ok(reporte);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar reporte de notas de la sección {SeccionId}", seccionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Generar reporte de asistencia de una sección
        /// </summary>
        /// <param name="seccionId">ID de la sección</param>
        /// <returns>Reporte completo de asistencia</returns>
        [HttpGet("asistencia/seccion/{seccionId}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<ReporteAsistenciaSeccionDto>> ReporteAsistenciaSeccion(int seccionId)
        {
            try
            {
                var reporte = await _reporteService.GenerarReporteAsistenciaSeccionAsync(seccionId);

                if (reporte == null)
                    return NotFound(new { message = "Sección no encontrada" });

                return Ok(reporte);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar reporte de asistencia de la sección {SeccionId}", seccionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Generar reporte de rendimiento de un estudiante
        /// </summary>
        /// <param name="estudianteId">ID del estudiante</param>
        /// <returns>Reporte completo de rendimiento</returns>
        [HttpGet("rendimiento/estudiante/{estudianteId}")]
        public async Task<ActionResult<ReporteRendimientoEstudianteDto>> ReporteRendimientoEstudiante(int estudianteId)
        {
            try
            {
                var reporte = await _reporteService.GenerarReporteRendimientoEstudianteAsync(estudianteId);

                if (reporte == null)
                    return NotFound(new { message = "Estudiante no encontrado" });

                return Ok(reporte);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar reporte de rendimiento del estudiante {EstudianteId}", estudianteId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Generar estadísticas generales del sistema
        /// </summary>
        /// <param name="periodo">Periodo académico (opcional)</param>
        /// <returns>Estadísticas generales</returns>
        [HttpGet("estadisticas-generales")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ReporteEstadisticasGeneralesDto>> EstadisticasGenerales([FromQuery] string? periodo = null)
        {
            try
            {
                var reporte = await _reporteService.GenerarEstadisticasGeneralesAsync(periodo);
                return Ok(reporte);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar estadísticas generales");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Generar ranking de estudiantes por periodo
        /// </summary>
        /// <param name="periodo">Periodo académico</param>
        /// <returns>Ranking de estudiantes</returns>
        [HttpGet("ranking/{periodo}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<ReporteRankingEstudiantesDto>> RankingEstudiantes(string periodo)
        {
            try
            {
                var reporte = await _reporteService.GenerarRankingEstudiantesAsync(periodo);
                return Ok(reporte);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar ranking de estudiantes del periodo {Periodo}", periodo);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}

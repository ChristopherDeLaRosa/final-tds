using EduCore.API.Services.Interfaces;
using EduCore.API.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IEstudianteService _estudianteService;
        private readonly IAsistenciaService _asistenciaService;
        private readonly ICalificacionService _calificacionService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(
            IEstudianteService estudianteService,
            IAsistenciaService asistenciaService,
            ICalificacionService calificacionService,
            ILogger<DashboardController> logger)
        {
            _estudianteService = estudianteService;
            _asistenciaService = asistenciaService;
            _calificacionService = calificacionService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<DashboardDto>> GetDashboard()
        {
            try
            {
                var totalEstudiantes = await _estudianteService.GetTotalAsync();
                var asistenciaHoy = await _asistenciaService.GetAsistenciaGlobalHoyAsync();
                var rendimiento = await _calificacionService.GetEstadisticasGeneralesAsync();

                var dashboard = new DashboardDto
                {
                    TotalEstudiantes = totalEstudiantes,
                    Asistencia = asistenciaHoy,
                    Rendimiento = rendimiento
                };

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cargando el dashboard");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}

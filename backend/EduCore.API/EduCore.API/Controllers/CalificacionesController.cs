using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Win32;
using System.Text.RegularExpressions;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CalificacionesController : ControllerBase
    {
        private readonly ICalificacionService _calificacionService;
        private readonly ILogger<CalificacionesController> _logger;

        public CalificacionesController(
            ICalificacionService calificacionService,
            ILogger<CalificacionesController> logger)
        {
            _calificacionService = calificacionService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener calificación por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<CalificacionDto>> GetById(int id)
        {
            try
            {
                var calificacion = await _calificacionService.GetByIdAsync(id);

                if (calificacion == null)
                    return NotFound(new { message = "Calificación no encontrada" });

                return Ok(calificacion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener calificación {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener calificaciones de un estudiante
        /// </summary>
        [HttpGet("estudiante/{estudianteId}")]
        public async Task<ActionResult<IEnumerable<CalificacionDto>>> GetByEstudiante(int estudianteId)
        {
            try
            {
                var calificaciones = await _calificacionService.GetByEstudianteAsync(estudianteId);
                return Ok(calificaciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener calificaciones del estudiante {EstudianteId}", estudianteId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener calificaciones de un estudiante en un grupo específico
        /// </summary>
        [HttpGet("estudiante/{estudianteId}/grupo/{grupoCursoId}")]
        public async Task<ActionResult<IEnumerable<CalificacionDto>>> GetByEstudianteGrupoCurso(
            int estudianteId,
            int grupoCursoId)
        {
            try
            {
                var calificaciones = await _calificacionService.GetByEstudianteGrupoCursoAsync(
                    estudianteId,
                    grupoCursoId
                );
                return Ok(calificaciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener calificaciones");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener calificaciones de un rubro (todas las notas de ese componente)
        /// </summary>
        [HttpGet("rubro/{rubroId}")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<IEnumerable<CalificacionDto>>> GetByRubro(int rubroId)
        {
            try
            {
                var calificaciones = await _calificacionService.GetByRubroAsync(rubroId);
                return Ok(calificaciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener calificaciones del rubro {RubroId}", rubroId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener todas las calificaciones de un grupo-curso (libro de notas)
        /// </summary>
        [HttpGet("grupo/{grupoCursoId}")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<CalificacionesGrupoCursoDto>> GetCalificacionesGrupoCurso(int grupoCursoId)
        {
            try
            {
                var calificaciones = await _calificacionService.GetCalificacionesGrupoCursoAsync(grupoCursoId);

                if (calificaciones == null)
                    return NotFound(new { message = "Grupo no encontrado" });

                return Ok(calificaciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener calificaciones del grupo {GrupoCursoId}", grupoCursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Registrar calificación individual
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<CalificacionDto>> Create([FromBody] CreateCalificacionDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var calificacion = await _calificacionService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = calificacion.Id }, calificacion);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear calificación");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Registrar calificaciones para todo un grupo (libro de notas masivo)
        /// </summary>
        [HttpPost("grupo")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<List<CalificacionDto>>> RegistrarGrupo(
            [FromBody] RegistrarCalificacionesGrupoDto registroDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var calificaciones = await _calificacionService.RegistrarCalificacionesGrupoAsync(registroDto);
                return Ok(new
                {
                    message = $"{calificaciones.Count} calificaciones registradas exitosamente",
                    calificaciones
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar calificaciones grupales");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar calificación
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<CalificacionDto>> Update(
            int id,
            [FromBody] UpdateCalificacionDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var calificacion = await _calificacionService.UpdateAsync(id, updateDto);

                if (calificacion == null)
                    return NotFound(new { message = "Calificación no encontrada" });

                return Ok(calificacion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar calificación {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar calificación
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _calificacionService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Calificación no encontrada" });

                return Ok(new { message = "Calificación eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar calificación {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener boletín de calificaciones de un estudiante (reporte completo)
        /// </summary>
        [HttpGet("boletin/estudiante/{estudianteId}")]
        public async Task<ActionResult<BoletinEstudianteDto>> GetBoletinEstudiante(
            int estudianteId,
            [FromQuery] string periodo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(periodo))
                    return BadRequest(new { message = "El periodo es requerido" });

                var boletin = await _calificacionService.GetBoletinEstudianteAsync(estudianteId, periodo);

                if (boletin == null)
                    return NotFound(new { message = "Estudiante no encontrado" });

                return Ok(boletin);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar boletín del estudiante {EstudianteId}", estudianteId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener estadísticas de calificaciones de un grupo-curso
        /// </summary>
        [HttpGet("estadisticas/grupo/{grupoCursoId}")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<EstadisticasCalificacionesDto>> GetEstadisticasGrupoCurso(int grupoCursoId)
        {
            try
            {
                var estadisticas = await _calificacionService.GetEstadisticasGrupoCursoAsync(grupoCursoId);

                if (estadisticas == null)
                    return NotFound(new { message = "Grupo no encontrado" });

                return Ok(estadisticas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar estadísticas del grupo {GrupoCursoId}", grupoCursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Calcular promedio de un estudiante en un grupo-curso específico
        /// </summary>
        [HttpGet("promedio/estudiante/{estudianteId}/grupo/{grupoCursoId}")]
        public async Task<ActionResult<object>> GetPromedioEstudianteGrupoCurso(
            int estudianteId,
            int grupoCursoId)
        {
            try
            {
                var promedio = await _calificacionService.CalcularPromedioGrupoCursoAsync(
                    estudianteId,
                    grupoCursoId
                );

                if (!promedio.HasValue)
                    return Ok(new { message = "No hay calificaciones registradas", promedio = (decimal?)null });

                return Ok(new
                {
                    estudianteId,
                    grupoCursoId,
                    promedio = promedio.Value,
                    estado = promedio.Value >= 70 ? "Aprobado" : "Reprobado"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al calcular promedio");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar promedios de inscripción (recalcular después de cambios)
        /// </summary>
        [HttpPost("actualizar-promedios/estudiante/{estudianteId}/grupo/{grupoCursoId}")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult> ActualizarPromedios(int estudianteId, int grupoCursoId)
        {
            try
            {
                await _calificacionService.ActualizarPromediosInscripcionAsync(estudianteId, grupoCursoId);

                var promedio = await _calificacionService.CalcularPromedioGrupoCursoAsync(
                    estudianteId,
                    grupoCursoId
                );

                return Ok(new
                {
                    message = "Promedios actualizados exitosamente",
                    promedioFinal = promedio
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar promedios");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}

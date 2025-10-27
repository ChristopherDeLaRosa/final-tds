using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CalificacionesController : ControllerBase
    {
        private readonly ICalificacionService _calificacionService;
        private readonly ILogger<CalificacionesController> _logger;

        public CalificacionesController(ICalificacionService calificacionService, ILogger<CalificacionesController> logger)
        {
            _calificacionService = calificacionService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todas las calificaciones
        /// </summary>
        /// <returns>Lista de calificaciones</returns>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<CalificacionDto>>> GetAll()
        {
            try
            {
                var calificaciones = await _calificacionService.GetAllAsync();
                return Ok(calificaciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener calificaciones");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener calificación por ID
        /// </summary>
        /// <param name="id">ID de la calificación</param>
        /// <returns>Datos de la calificación</returns>
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
        /// Obtener calificaciones por estudiante
        /// </summary>
        /// <param name="estudianteId">ID del estudiante</param>
        /// <returns>Lista de calificaciones del estudiante</returns>
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
        /// Obtener calificaciones por rubro
        /// </summary>
        /// <param name="rubroId">ID del rubro</param>
        /// <returns>Lista de calificaciones del rubro</returns>
        [HttpGet("rubro/{rubroId}")]
        [Authorize(Roles = "Admin,Docente")]
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
        /// Obtener calificaciones por sección
        /// </summary>
        /// <param name="seccionId">ID de la sección</param>
        /// <returns>Lista de calificaciones de la sección</returns>
        [HttpGet("seccion/{seccionId}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<IEnumerable<CalificacionDto>>> GetBySeccion(int seccionId)
        {
            try
            {
                var calificaciones = await _calificacionService.GetBySeccionAsync(seccionId);
                return Ok(calificaciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener calificaciones de la sección {SeccionId}", seccionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear nueva calificación
        /// </summary>
        /// <param name="createDto">Datos de la nueva calificación</param>
        /// <returns>Calificación creada</returns>
        [HttpPost]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<CalificacionDto>> Create([FromBody] CreateCalificacionDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var calificacion = await _calificacionService.CreateAsync(createDto, usuarioId);

                return CreatedAtAction(nameof(GetById), new { id = calificacion.Id }, calificacion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear calificación");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar calificación existente
        /// </summary>
        /// <param name="id">ID de la calificación</param>
        /// <param name="updateDto">Datos actualizados</param>
        /// <returns>Calificación actualizada</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<CalificacionDto>> Update(int id, [FromBody] UpdateCalificacionDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var calificacion = await _calificacionService.UpdateAsync(id, updateDto, usuarioId);

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
        /// <param name="id">ID de la calificación</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Docente")]
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
        /// Carga masiva de calificaciones para un rubro
        /// </summary>
        /// <param name="rubroId">ID del rubro</param>
        /// <param name="cargaDto">Lista de calificaciones a cargar</param>
        /// <returns>Confirmación de carga</returns>
        [HttpPost("carga-masiva/{rubroId}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<IActionResult> CargaMasiva(int rubroId, [FromBody] CargaCalificacionesDto cargaDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _calificacionService.CargaMasivaAsync(rubroId, cargaDto, usuarioId);

                if (!result)
                    return BadRequest(new { message = "Error en la carga masiva de calificaciones" });

                return Ok(new { message = "Calificaciones cargadas exitosamente", total = cargaDto.Calificaciones.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en carga masiva de calificaciones para rubro {RubroId}", rubroId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener promedio de un estudiante en una sección
        /// </summary>
        /// <param name="seccionId">ID de la sección</param>
        /// <param name="estudianteId">ID del estudiante</param>
        /// <returns>Promedio con detalle por rubro</returns>
        [HttpGet("promedio/seccion/{seccionId}/estudiante/{estudianteId}")]
        public async Task<ActionResult<PromedioEstudianteDto>> GetPromedio(int seccionId, int estudianteId)
        {
            try
            {
                var promedio = await _calificacionService.GetPromedioEstudianteAsync(seccionId, estudianteId);

                if (promedio == null)
                    return NotFound(new { message = "No se encontraron datos" });

                return Ok(promedio);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener promedio del estudiante {EstudianteId} en sección {SeccionId}",
                    estudianteId, seccionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Generar acta de calificaciones de una sección
        /// </summary>
        /// <param name="seccionId">ID de la sección</param>
        /// <returns>Acta completa con todas las calificaciones</returns>
        [HttpGet("acta/{seccionId}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<ActaCalificacionesDto>> GenerarActa(int seccionId)
        {
            try
            {
                var acta = await _calificacionService.GenerarActaAsync(seccionId);

                if (acta == null)
                    return NotFound(new { message = "Sección no encontrada" });

                return Ok(acta);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar acta de la sección {SeccionId}", seccionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}



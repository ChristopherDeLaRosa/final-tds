using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SesionesController : ControllerBase
    {
        private readonly ISesionService _sesionService;
        private readonly ILogger<SesionesController> _logger;

        public SesionesController(ISesionService sesionService, ILogger<SesionesController> logger)
        {
            _sesionService = sesionService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todas las sesiones
        /// </summary>
        /// <returns>Lista de sesiones</returns>
        [HttpGet]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<IEnumerable<SesionDto>>> GetAll()
        {
            try
            {
                var sesiones = await _sesionService.GetAllAsync();
                return Ok(sesiones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener sesiones");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener sesión por ID
        /// </summary>
        /// <param name="id">ID de la sesión</param>
        /// <returns>Datos de la sesión</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<SesionDto>> GetById(int id)
        {
            try
            {
                var sesion = await _sesionService.GetByIdAsync(id);

                if (sesion == null)
                    return NotFound(new { message = "Sesión no encontrada" });

                return Ok(sesion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener sesión {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener sesiones por sección
        /// </summary>
        /// <param name="seccionId">ID de la sección</param>
        /// <returns>Lista de sesiones de la sección</returns>
        [HttpGet("seccion/{seccionId}")]
        public async Task<ActionResult<IEnumerable<SesionDto>>> GetBySeccion(int seccionId)
        {
            try
            {
                var sesiones = await _sesionService.GetBySeccionAsync(seccionId);
                return Ok(sesiones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener sesiones de la sección {SeccionId}", seccionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener sesiones por sección y rango de fechas
        /// </summary>
        /// <param name="seccionId">ID de la sección</param>
        /// <param name="fechaInicio">Fecha de inicio</param>
        /// <param name="fechaFin">Fecha de fin</param>
        /// <returns>Lista de sesiones en el rango de fechas</returns>
        [HttpGet("seccion/{seccionId}/rango")]
        public async Task<ActionResult<IEnumerable<SesionDto>>> GetBySeccionYFecha(
            int seccionId,
            [FromQuery] DateTime fechaInicio,
            [FromQuery] DateTime fechaFin)
        {
            try
            {
                var sesiones = await _sesionService.GetBySeccionYFechaAsync(seccionId, fechaInicio, fechaFin);
                return Ok(sesiones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener sesiones de la sección {SeccionId} por rango de fechas", seccionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear nueva sesión
        /// </summary>
        /// <param name="createDto">Datos de la nueva sesión</param>
        /// <returns>Sesión creada</returns>
        [HttpPost]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<SesionDto>> Create([FromBody] CreateSesionDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var sesion = await _sesionService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = sesion.Id }, sesion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear sesión");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar sesión existente
        /// </summary>
        /// <param name="id">ID de la sesión</param>
        /// <param name="updateDto">Datos actualizados</param>
        /// <returns>Sesión actualizada</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<SesionDto>> Update(int id, [FromBody] UpdateSesionDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var sesion = await _sesionService.UpdateAsync(id, updateDto);

                if (sesion == null)
                    return NotFound(new { message = "Sesión no encontrada" });

                return Ok(sesion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar sesión {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar sesión
        /// </summary>
        /// <param name="id">ID de la sesión</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _sesionService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Sesión no encontrada" });

                return Ok(new { message = "Sesión eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar sesión {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Marcar sesión como realizada
        /// </summary>
        /// <param name="id">ID de la sesión</param>
        /// <returns>Confirmación</returns>
        [HttpPatch("{id}/marcar-realizada")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<IActionResult> MarcarRealizada(int id)
        {
            try
            {
                var result = await _sesionService.MarcarComoRealizadaAsync(id);

                if (!result)
                    return NotFound(new { message = "Sesión no encontrada" });

                return Ok(new { message = "Sesión marcada como realizada" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al marcar sesión {Id} como realizada", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}
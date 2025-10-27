using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SeccionesController : ControllerBase
    {
        private readonly ISeccionService _seccionService;
        private readonly ILogger<SeccionesController> _logger;

        public SeccionesController(ISeccionService seccionService, ILogger<SeccionesController> logger)
        {
            _seccionService = seccionService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todas las secciones activas
        /// </summary>
        /// <returns>Lista de secciones</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SeccionDto>>> GetAll()
        {
            try
            {
                var secciones = await _seccionService.GetAllAsync();
                return Ok(secciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener secciones");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener sección por ID
        /// </summary>
        /// <param name="id">ID de la sección</param>
        /// <returns>Datos de la sección</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<SeccionDto>> GetById(int id)
        {
            try
            {
                var seccion = await _seccionService.GetByIdAsync(id);

                if (seccion == null)
                    return NotFound(new { message = "Sección no encontrada" });

                return Ok(seccion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener sección {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener detalle completo de sección con estudiantes inscritos
        /// </summary>
        /// <param name="id">ID de la sección</param>
        /// <returns>Detalle completo de la sección</returns>
        [HttpGet("{id}/detalle")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<SeccionDetalleDto>> GetDetalle(int id)
        {
            try
            {
                var detalle = await _seccionService.GetDetalleByIdAsync(id);

                if (detalle == null)
                    return NotFound(new { message = "Sección no encontrada" });

                return Ok(detalle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener detalle de sección {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener secciones por periodo
        /// </summary>
        /// <param name="periodo">Periodo académico</param>
        /// <returns>Lista de secciones del periodo</returns>
        [HttpGet("periodo/{periodo}")]
        public async Task<ActionResult<IEnumerable<SeccionDto>>> GetByPeriodo(string periodo)
        {
            try
            {
                var secciones = await _seccionService.GetByPeriodoAsync(periodo);
                return Ok(secciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener secciones del periodo {Periodo}", periodo);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener secciones por curso
        /// </summary>
        /// <param name="cursoId">ID del curso</param>
        /// <returns>Lista de secciones del curso</returns>
        [HttpGet("curso/{cursoId}")]
        public async Task<ActionResult<IEnumerable<SeccionDto>>> GetByCurso(int cursoId)
        {
            try
            {
                var secciones = await _seccionService.GetByCursoAsync(cursoId);
                return Ok(secciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener secciones del curso {CursoId}", cursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener secciones por docente
        /// </summary>
        /// <param name="docenteId">ID del docente</param>
        /// <returns>Lista de secciones del docente</returns>
        [HttpGet("docente/{docenteId}")]
        public async Task<ActionResult<IEnumerable<SeccionDto>>> GetByDocente(int docenteId)
        {
            try
            {
                var secciones = await _seccionService.GetByDocenteAsync(docenteId);
                return Ok(secciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener secciones del docente {DocenteId}", docenteId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener horario de un periodo
        /// </summary>
        /// <param name="periodo">Periodo académico</param>
        /// <returns>Horario completo del periodo</returns>
        [HttpGet("horario/{periodo}")]
        public async Task<ActionResult<HorarioDto>> GetHorario(string periodo)
        {
            try
            {
                var horario = await _seccionService.GetHorarioByPeriodoAsync(periodo);

                if (horario == null)
                    return NotFound(new { message = "No se encontraron secciones para el periodo especificado" });

                return Ok(horario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener horario del periodo {Periodo}", periodo);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear nueva sección
        /// </summary>
        /// <param name="createDto">Datos de la nueva sección</param>
        /// <returns>Sección creada</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SeccionDto>> Create([FromBody] CreateSeccionDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Verificar si el código ya existe
                if (await _seccionService.CodigoExistsAsync(createDto.Codigo))
                {
                    return BadRequest(new { message = "El código ya está registrado" });
                }

                var seccion = await _seccionService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = seccion.Id }, seccion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear sección");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar sección existente
        /// </summary>
        /// <param name="id">ID de la sección</param>
        /// <param name="updateDto">Datos actualizados</param>
        /// <returns>Sección actualizada</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SeccionDto>> Update(int id, [FromBody] UpdateSeccionDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var seccion = await _seccionService.UpdateAsync(id, updateDto);

                if (seccion == null)
                    return NotFound(new { message = "Sección no encontrada" });

                return Ok(seccion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar sección {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar sección (soft delete)
        /// </summary>
        /// <param name="id">ID de la sección</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _seccionService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Sección no encontrada" });

                return Ok(new { message = "Sección eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar sección {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}

using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RubrosController : ControllerBase
    {
        private readonly IRubroService _rubroService;
        private readonly ILogger<RubrosController> _logger;

        public RubrosController(IRubroService rubroService, ILogger<RubrosController> logger)
        {
            _rubroService = rubroService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los rubros activos
        /// </summary>
        /// <returns>Lista de rubros</returns>
        [HttpGet]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<IEnumerable<RubroDto>>> GetAll()
        {
            try
            {
                var rubros = await _rubroService.GetAllAsync();
                return Ok(rubros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener rubros");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener rubro por ID
        /// </summary>
        /// <param name="id">ID del rubro</param>
        /// <returns>Datos del rubro</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<RubroDto>> GetById(int id)
        {
            try
            {
                var rubro = await _rubroService.GetByIdAsync(id);

                if (rubro == null)
                    return NotFound(new { message = "Rubro no encontrado" });

                return Ok(rubro);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener rubro {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener rubros por sección
        /// </summary>
        /// <param name="seccionId">ID de la sección</param>
        /// <returns>Lista de rubros de la sección</returns>
        [HttpGet("seccion/{seccionId}")]
        public async Task<ActionResult<IEnumerable<RubroDto>>> GetBySeccion(int seccionId)
        {
            try
            {
                var rubros = await _rubroService.GetBySeccionAsync(seccionId);
                return Ok(rubros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener rubros de la sección {SeccionId}", seccionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear nuevo rubro
        /// </summary>
        /// <param name="createDto">Datos del nuevo rubro</param>
        /// <returns>Rubro creado</returns>
        [HttpPost]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<RubroDto>> Create([FromBody] CreateRubroDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Verificar que el porcentaje total no exceda 100%
                var totalActual = await _rubroService.GetTotalPorcentajeBySeccionAsync(createDto.SeccionId);
                if (totalActual + createDto.Porcentaje > 100)
                {
                    return BadRequest(new { message = $"El porcentaje total excedería el 100%. Actual: {totalActual}%" });
                }

                var rubro = await _rubroService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = rubro.Id }, rubro);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear rubro");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar rubro existente
        /// </summary>
        /// <param name="id">ID del rubro</param>
        /// <param name="updateDto">Datos actualizados</param>
        /// <returns>Rubro actualizado</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<RubroDto>> Update(int id, [FromBody] UpdateRubroDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var rubroActual = await _rubroService.GetByIdAsync(id);
                if (rubroActual == null)
                    return NotFound(new { message = "Rubro no encontrado" });

                // Verificar porcentaje total
                var totalActual = await _rubroService.GetTotalPorcentajeBySeccionAsync(rubroActual.SeccionId);
                var diferencia = updateDto.Porcentaje - rubroActual.Porcentaje;
                if (totalActual + diferencia > 100)
                {
                    return BadRequest(new { message = $"El porcentaje total excedería el 100%. Actual: {totalActual}%" });
                }

                var rubro = await _rubroService.UpdateAsync(id, updateDto);
                return Ok(rubro);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar rubro {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar rubro (soft delete)
        /// </summary>
        /// <param name="id">ID del rubro</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _rubroService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Rubro no encontrado" });

                return Ok(new { message = "Rubro eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar rubro {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}



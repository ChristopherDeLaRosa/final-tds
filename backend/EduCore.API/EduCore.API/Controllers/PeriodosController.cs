using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PeriodosController : ControllerBase
    {
        private readonly IPeriodoService _periodoService;
        private readonly ILogger<PeriodosController> _logger;

        public PeriodosController(
            IPeriodoService periodoService,
            ILogger<PeriodosController> logger)
        {
            _periodoService = periodoService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los períodos
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PeriodoDto>>> GetAll()
        {
            try
            {
                var periodos = await _periodoService.GetAllAsync();
                return Ok(periodos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener períodos");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener período por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PeriodoDto>> GetById(int id)
        {
            try
            {
                var periodo = await _periodoService.GetByIdAsync(id);

                if (periodo == null)
                    return NotFound(new { message = "Período no encontrado" });

                return Ok(periodo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener período {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener el período actual
        /// </summary>
        [HttpGet("actual")]
        public async Task<ActionResult<PeriodoDto>> GetPeriodoActual()
        {
            try
            {
                var periodo = await _periodoService.GetPeriodoActualAsync();

                if (periodo == null)
                    return NotFound(new { message = "No hay período actual definido" });

                return Ok(periodo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener período actual");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener períodos por año escolar
        /// </summary>
        [HttpGet("anio/{anioEscolar}")]
        public async Task<ActionResult<IEnumerable<PeriodoDto>>> GetByAnioEscolar(string anioEscolar)
        {
            try
            {
                var periodos = await _periodoService.GetByAnioEscolarAsync(anioEscolar);
                return Ok(periodos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener períodos del año {AnioEscolar}", anioEscolar);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener período por fecha
        /// </summary>
        [HttpGet("fecha")]
        public async Task<ActionResult<PeriodoDto>> GetByFecha([FromQuery] DateTime fecha)
        {
            try
            {
                var periodo = await _periodoService.GetPeriodoByFechaAsync(fecha);

                if (periodo == null)
                    return NotFound(new { message = "No se encontró período para la fecha especificada" });

                return Ok(periodo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener período por fecha");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear período
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<PeriodoDto>> Create([FromBody] CreatePeriodoDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var periodo = await _periodoService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = periodo.Id }, periodo);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear período");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar período
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<PeriodoDto>> Update(
            int id,
            [FromBody] UpdatePeriodoDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var periodo = await _periodoService.UpdateAsync(id, updateDto);

                if (periodo == null)
                    return NotFound(new { message = "Período no encontrado" });

                return Ok(periodo);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar período {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar período
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _periodoService.DeleteAsync(id);

                if (!result)
                    return BadRequest(new { message = "No se puede eliminar el período porque tiene grupos asociados" });

                return Ok(new { message = "Período eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar período {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Establecer período como actual
        /// </summary>
        [HttpPost("{id}/establecer-actual")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<IActionResult> SetPeriodoActual(int id)
        {
            try
            {
                var result = await _periodoService.SetPeriodoActualAsync(id);

                if (!result)
                    return NotFound(new { message = "Período no encontrado" });

                return Ok(new { message = "Período establecido como actual exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al establecer período actual {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Cerrar período
        /// </summary>
        [HttpPost("{id}/cerrar")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<IActionResult> CerrarPeriodo(int id)
        {
            try
            {
                var result = await _periodoService.CerrarPeriodoAsync(id);

                if (!result)
                    return NotFound(new { message = "Período no encontrado" });

                return Ok(new { message = "Período cerrado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cerrar período {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Abrir período
        /// </summary>
        [HttpPost("{id}/abrir")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<IActionResult> AbrirPeriodo(int id)
        {
            try
            {
                var result = await _periodoService.AbrirPeriodoAsync(id);

                if (!result)
                    return NotFound(new { message = "Período no encontrado" });

                return Ok(new { message = "Período abierto exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al abrir período {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener resumen del período con estadísticas
        /// </summary>
        [HttpGet("{id}/resumen")]
        public async Task<ActionResult<ResumenPeriodoDto>> GetResumen(int id)
        {
            try
            {
                var resumen = await _periodoService.GetResumenPeriodoAsync(id);

                if (resumen == null)
                    return NotFound(new { message = "Período no encontrado" });

                return Ok(resumen);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener resumen del período {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener comparación entre trimestres de un año escolar
        /// </summary>
        [HttpGet("comparacion/{anioEscolar}")]
        [Authorize(Roles = "Admin,Coordinador,Docente")]
        public async Task<ActionResult<List<ComparacionTrimestreDto>>> GetComparacionTrimestres(string anioEscolar)
        {
            try
            {
                var comparacion = await _periodoService.GetComparacionTrimestresPorAnioAsync(anioEscolar);
                return Ok(comparacion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener comparación de trimestres");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Verificar solapamiento de fechas
        /// </summary>
        [HttpPost("verificar-solapamiento")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<object>> VerificarSolapamiento(
            [FromQuery] DateTime fechaInicio,
            [FromQuery] DateTime fechaFin,
            [FromQuery] int? periodoIdExcluir = null)
        {
            try
            {
                var tieneSolapamiento = await _periodoService.TieneSolapamientoAsync(
                    fechaInicio,
                    fechaFin,
                    periodoIdExcluir
                );

                return Ok(new
                {
                    tieneSolapamiento,
                    message = tieneSolapamiento
                        ? "Las fechas se solapan con otro período existente"
                        : "Las fechas están disponibles"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar solapamiento");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}
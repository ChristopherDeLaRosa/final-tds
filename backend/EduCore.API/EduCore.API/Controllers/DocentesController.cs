using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DocentesController : ControllerBase
    {
        private readonly IDocenteService _docenteService;
        private readonly ILogger<DocentesController> _logger;

        public DocentesController(IDocenteService docenteService, ILogger<DocentesController> logger)
        {
            _docenteService = docenteService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los docentes activos
        /// </summary>
        /// <returns>Lista de docentes</returns>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<DocenteDto>>> GetAll()
        {
            try
            {
                var docentes = await _docenteService.GetAllAsync();
                return Ok(docentes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener docentes");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener docente por ID
        /// </summary>
        /// <param name="id">ID del docente</param>
        /// <returns>Datos del docente</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<DocenteDto>> GetById(int id)
        {
            try
            {
                var docente = await _docenteService.GetByIdAsync(id);

                if (docente == null)
                    return NotFound(new { message = "Docente no encontrado" });

                return Ok(docente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener docente {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener docente por código
        /// </summary>
        /// <param name="codigo">Código del docente</param>
        /// <returns>Datos del docente</returns>
        [HttpGet("codigo/{codigo}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DocenteDto>> GetByCodigo(string codigo)
        {
            try
            {
                var docente = await _docenteService.GetByCodigoAsync(codigo);

                if (docente == null)
                    return NotFound(new { message = "Docente no encontrado" });

                return Ok(docente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener docente con código {Codigo}", codigo);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear nuevo docente
        /// </summary>
        /// <param name="createDto">Datos del nuevo docente</param>
        /// <returns>Docente creado</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DocenteDto>> Create([FromBody] CreateDocenteDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Verificar si el código ya existe
                if (await _docenteService.CodigoExistsAsync(createDto.Codigo))
                {
                    return BadRequest(new { message = "El código ya está registrado" });
                }

                var docente = await _docenteService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = docente.Id }, docente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear docente");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar docente existente
        /// </summary>
        /// <param name="id">ID del docente</param>
        /// <param name="updateDto">Datos actualizados</param>
        /// <returns>Docente actualizado</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DocenteDto>> Update(int id, [FromBody] UpdateDocenteDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var docente = await _docenteService.UpdateAsync(id, updateDto);

                if (docente == null)
                    return NotFound(new { message = "Docente no encontrado" });

                return Ok(docente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar docente {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar docente (soft delete)
        /// </summary>
        /// <param name="id">ID del docente</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _docenteService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Docente no encontrado" });

                return Ok(new { message = "Docente eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar docente {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener carga académica del docente
        /// </summary>
        /// <param name="id">ID del docente</param>
        /// <param name="periodo">Periodo académico (opcional)</param>
        /// <returns>Carga académica con secciones asignadas</returns>
        [HttpGet("{id}/carga-academica")]
        public async Task<ActionResult<DocenteCargaAcademicaDto>> GetCargaAcademica(int id, [FromQuery] string? periodo = null)
        {
            try
            {
                var carga = await _docenteService.GetCargaAcademicaAsync(id, periodo);

                if (carga == null)
                    return NotFound(new { message = "Docente no encontrado" });

                return Ok(carga);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener carga académica del docente {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}
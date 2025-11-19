using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using System.ComponentModel.DataAnnotations;
using System.Numerics;
using System.Text.RegularExpressions;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RubrosController : ControllerBase
    {
        private readonly IRubroService _rubroService;
        private readonly ILogger<RubrosController> _logger;

        public RubrosController(
            IRubroService rubroService,
            ILogger<RubrosController> logger)
        {
            _rubroService = rubroService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los rubros activos
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
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
        [HttpGet("{id}")]
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
        /// Obtener rubros de un grupo-curso
        /// </summary>
        [HttpGet("grupo/{grupoCursoId}")]
        public async Task<ActionResult<IEnumerable<RubroDto>>> GetByGrupoCurso(int grupoCursoId)
        {
            try
            {
                var rubros = await _rubroService.GetByGrupoCursoAsync(grupoCursoId);
                return Ok(rubros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener rubros del grupo {GrupoCursoId}", grupoCursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener rubros de un grupo con estadísticas detalladas
        /// </summary>
        [HttpGet("grupo/{grupoCursoId}/detalle")]
        public async Task<ActionResult<RubrosGrupoCursoDto>> GetRubrosGrupoCursoDetalle(int grupoCursoId)
        {
            try
            {
                var rubros = await _rubroService.GetRubrosGrupoCursoDetalleAsync(grupoCursoId);

                if (rubros == null)
                    return NotFound(new { message = "Grupo no encontrado" });

                return Ok(rubros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener detalle de rubros del grupo {GrupoCursoId}", grupoCursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear nuevo rubro
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<RubroDto>> Create([FromBody] CreateRubroDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var rubro = await _rubroService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = rubro.Id }, rubro);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear rubro");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear múltiples rubros desde plantilla (ej: configuración inicial del grupo)
        /// </summary>
        [HttpPost("plantilla")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<List<RubroDto>>> CrearPlantilla(
            [FromBody] CrearRubrosPlantillaDto plantillaDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var rubros = await _rubroService.CrearRubrosPlantillaAsync(plantillaDto);

                return Ok(new
                {
                    message = $"{rubros.Count} rubros creados exitosamente",
                    rubros
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear plantilla de rubros");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar rubro
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<RubroDto>> Update(int id, [FromBody] UpdateRubroDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var rubro = await _rubroService.UpdateAsync(id, updateDto);

                if (rubro == null)
                    return NotFound(new { message = "Rubro no encontrado" });

                return Ok(rubro);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar rubro {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar rubro (solo si no tiene calificaciones)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _rubroService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Rubro no encontrado o tiene calificaciones registradas" });

                return Ok(new { message = "Rubro eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar rubro {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Validar que los porcentajes de rubros de un grupo sumen 100%
        /// </summary>
        [HttpGet("grupo/{grupoCursoId}/validar-porcentajes")]
        public async Task<ActionResult<ValidacionRubrosDto>> ValidarPorcentajes(int grupoCursoId)
        {
            try
            {
                var validacion = await _rubroService.ValidarPorcentajesAsync(grupoCursoId);
                return Ok(validacion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al validar porcentajes del grupo {GrupoCursoId}", grupoCursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Reordenar rubros de un grupo
        /// </summary>
        [HttpPut("grupo/{grupoCursoId}/reordenar")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult> ReordenarRubros(
            int grupoCursoId,
            [FromBody] Dictionary<int, int> ordenamiento)
        {
            try
            {
                if (ordenamiento == null || !ordenamiento.Any())
                    return BadRequest(new { message = "Debe proporcionar el ordenamiento de los rubros" });

                var result = await _rubroService.ReordenarRubrosAsync(grupoCursoId, ordenamiento);

                if (!result)
                    return NotFound(new { message = "No se pudieron reordenar los rubros" });

                return Ok(new { message = "Rubros reordenados exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al reordenar rubros del grupo {GrupoCursoId}", grupoCursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}


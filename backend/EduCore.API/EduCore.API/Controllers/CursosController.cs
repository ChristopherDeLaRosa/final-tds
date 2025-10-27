using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CursosController : ControllerBase
    {
        private readonly ICursoService _cursoService;
        private readonly ILogger<CursosController> _logger;

        public CursosController(ICursoService cursoService, ILogger<CursosController> logger)
        {
            _cursoService = cursoService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los cursos activos
        /// </summary>
        /// <returns>Lista de cursos</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CursoDto>>> GetAll()
        {
            try
            {
                var cursos = await _cursoService.GetAllAsync();
                return Ok(cursos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cursos");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener curso por ID
        /// </summary>
        /// <param name="id">ID del curso</param>
        /// <returns>Datos del curso</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<CursoDto>> GetById(int id)
        {
            try
            {
                var curso = await _cursoService.GetByIdAsync(id);

                if (curso == null)
                    return NotFound(new { message = "Curso no encontrado" });

                return Ok(curso);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener curso {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener curso por código
        /// </summary>
        /// <param name="codigo">Código del curso</param>
        /// <returns>Datos del curso</returns>
        [HttpGet("codigo/{codigo}")]
        public async Task<ActionResult<CursoDto>> GetByCodigo(string codigo)
        {
            try
            {
                var curso = await _cursoService.GetByCodigoAsync(codigo);

                if (curso == null)
                    return NotFound(new { message = "Curso no encontrado" });

                return Ok(curso);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener curso con código {Codigo}", codigo);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener catálogo de cursos con secciones disponibles
        /// </summary>
        /// <param name="periodo">Periodo académico (opcional)</param>
        /// <returns>Catálogo de cursos con secciones</returns>
        [HttpGet("catalogo")]
        public async Task<ActionResult<IEnumerable<CursoCatalogoDto>>> GetCatalogo([FromQuery] string? periodo = null)
        {
            try
            {
                var catalogo = await _cursoService.GetCatalogoAsync(periodo);
                return Ok(catalogo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener catálogo de cursos");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear nuevo curso
        /// </summary>
        /// <param name="createDto">Datos del nuevo curso</param>
        /// <returns>Curso creado</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CursoDto>> Create([FromBody] CreateCursoDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Verificar si el código ya existe
                if (await _cursoService.CodigoExistsAsync(createDto.Codigo))
                {
                    return BadRequest(new { message = "El código ya está registrado" });
                }

                var curso = await _cursoService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = curso.Id }, curso);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear curso");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar curso existente
        /// </summary>
        /// <param name="id">ID del curso</param>
        /// <param name="updateDto">Datos actualizados</param>
        /// <returns>Curso actualizado</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CursoDto>> Update(int id, [FromBody] UpdateCursoDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var curso = await _cursoService.UpdateAsync(id, updateDto);

                if (curso == null)
                    return NotFound(new { message = "Curso no encontrado" });

                return Ok(curso);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar curso {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar curso (soft delete)
        /// </summary>
        /// <param name="id">ID del curso</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _cursoService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Curso no encontrado" });

                return Ok(new { message = "Curso eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar curso {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}
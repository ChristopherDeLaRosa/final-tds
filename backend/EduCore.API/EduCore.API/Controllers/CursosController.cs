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
        /// Obtener cursos por grado (1-12)
        /// </summary>
        /// <param name="grado">Grado escolar (1-12)</param>
        /// <returns>Lista de cursos del grado</returns>
        [HttpGet("grado/{grado}")]
        public async Task<ActionResult<IEnumerable<CursoDto>>> GetByGrado(int grado)
        {
            try
            {
                if (grado < 1 || grado > 12)
                    return BadRequest(new { message = "El grado debe estar entre 1 y 12" });

                var cursos = await _cursoService.GetByGradoAsync(grado);
                return Ok(cursos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cursos por grado {Grado}", grado);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener cursos por nivel educativo (Primaria/Secundaria)
        /// </summary>
        /// <param name="nivel">Nivel educativo</param>
        /// <returns>Lista de cursos del nivel</returns>
        [HttpGet("nivel/{nivel}")]
        public async Task<ActionResult<IEnumerable<CursoDto>>> GetByNivel(string nivel)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(nivel))
                    return BadRequest(new { message = "El nivel es requerido" });

                var cursos = await _cursoService.GetByNivelAsync(nivel);
                return Ok(cursos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cursos por nivel {Nivel}", nivel);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener cursos por área de conocimiento
        /// </summary>
        /// <param name="area">Área de conocimiento</param>
        /// <returns>Lista de cursos del área</returns>
        [HttpGet("area/{area}")]
        public async Task<ActionResult<IEnumerable<CursoDto>>> GetByArea(string area)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(area))
                    return BadRequest(new { message = "El área es requerida" });

                var cursos = await _cursoService.GetByAreaAsync(area);
                return Ok(cursos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cursos por área {Area}", area);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener catálogo de cursos por grado con grupos disponibles
        /// </summary>
        /// <param name="grado">Grado escolar (1-12)</param>
        /// <param name="periodo">Periodo académico</param>
        /// <returns>Catálogo de cursos con grupos</returns>
        [HttpGet("catalogo/grado/{grado}")]
        public async Task<ActionResult<IEnumerable<CursoPorGradoDto>>> GetCatalogoPorGrado(
            int grado,
            [FromQuery] string periodo)
        {
            try
            {
                if (grado < 1 || grado > 12)
                    return BadRequest(new { message = "El grado debe estar entre 1 y 12" });

                if (string.IsNullOrWhiteSpace(periodo))
                    return BadRequest(new { message = "El periodo es requerido" });

                var catalogo = await _cursoService.GetCursosPorGradoAsync(grado, periodo);
                return Ok(catalogo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener catálogo por grado {Grado}", grado);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener cursos agrupados por área de conocimiento para un grado
        /// </summary>
        /// <param name="grado">Grado escolar (1-12)</param>
        /// <returns>Cursos agrupados por área</returns>
        [HttpGet("agrupados-por-area/{grado}")]
        public async Task<ActionResult<Dictionary<string, List<CursoDto>>>> GetAgrupadosPorArea(int grado)
        {
            try
            {
                if (grado < 1 || grado > 12)
                    return BadRequest(new { message = "El grado debe estar entre 1 y 12" });

                var cursosAgrupados = await _cursoService.GetCursosPorAreaAsync(grado);
                return Ok(cursosAgrupados);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cursos agrupados por área para grado {Grado}", grado);
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
                    return NotFound(new { message = "Curso no encontrado o tiene grupos activos asociados" });

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
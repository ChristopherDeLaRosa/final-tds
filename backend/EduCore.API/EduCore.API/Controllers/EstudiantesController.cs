using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EstudiantesController : ControllerBase
    {
        private readonly IEstudianteService _estudianteService;
        private readonly ILogger<EstudiantesController> _logger;

        public EstudiantesController(IEstudianteService estudianteService, ILogger<EstudiantesController> logger)
        {
            _estudianteService = estudianteService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los estudiantes activos
        /// </summary>
        /// <returns>Lista de estudiantes ordenados por grado, sección y apellido</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstudianteDto>>> GetAll()
        {
            try
            {
                var estudiantes = await _estudianteService.GetAllAsync();
                return Ok(estudiantes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estudiantes");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener estudiante por ID
        /// </summary>
        /// <param name="id">ID del estudiante</param>
        /// <returns>Datos del estudiante</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<EstudianteDto>> GetById(int id)
        {
            try
            {
                var estudiante = await _estudianteService.GetByIdAsync(id);

                if (estudiante == null)
                    return NotFound(new { message = "Estudiante no encontrado" });

                return Ok(estudiante);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estudiante {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener estudiante por matrícula
        /// </summary>
        /// <param name="matricula">Matrícula del estudiante</param>
        /// <returns>Datos del estudiante</returns>
        [HttpGet("matricula/{matricula}")]
        public async Task<ActionResult<EstudianteDto>> GetByMatricula(string matricula)
        {
            try
            {
                var estudiante = await _estudianteService.GetByMatriculaAsync(matricula);

                if (estudiante == null)
                    return NotFound(new { message = "Estudiante no encontrado" });

                return Ok(estudiante);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estudiante con matrícula {Matricula}", matricula);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener estudiantes por grado
        /// </summary>
        /// <param name="grado">Grado escolar (1-12)</param>
        /// <returns>Lista de estudiantes del grado</returns>
        [HttpGet("grado/{grado}")]
        public async Task<ActionResult<IEnumerable<EstudianteDto>>> GetByGrado(int grado)
        {
            try
            {
                if (grado < 1 || grado > 12)
                    return BadRequest(new { message = "El grado debe estar entre 1 y 12" });

                var estudiantes = await _estudianteService.GetByGradoAsync(grado);
                return Ok(estudiantes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estudiantes por grado {Grado}", grado);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener estudiantes por grado y sección
        /// </summary>
        /// <param name="grado">Grado escolar (1-12)</param>
        /// <param name="seccion">Sección (A, B, C, etc.)</param>
        /// <returns>Lista de estudiantes del grado y sección</returns>
        [HttpGet("grado/{grado}/seccion/{seccion}")]
        public async Task<ActionResult<IEnumerable<EstudianteDto>>> GetByGradoSeccion(int grado, string seccion)
        {
            try
            {
                if (grado < 1 || grado > 12)
                    return BadRequest(new { message = "El grado debe estar entre 1 y 12" });

                if (string.IsNullOrWhiteSpace(seccion))
                    return BadRequest(new { message = "La sección es requerida" });

                var estudiantes = await _estudianteService.GetByGradoSeccionAsync(grado, seccion);
                return Ok(estudiantes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estudiantes por grado {Grado} y sección {Seccion}", grado, seccion);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener lista completa de estudiantes por grado y sección
        /// </summary>
        /// <param name="grado">Grado escolar (1-12)</param>
        /// <param name="seccion">Sección (A, B, C, etc.)</param>
        /// <returns>Lista detallada con total de estudiantes</returns>
        [HttpGet("lista/grado/{grado}/seccion/{seccion}")]
        public async Task<ActionResult<EstudiantesPorGradoDto>> GetListaPorGradoSeccion(int grado, string seccion)
        {
            try
            {
                if (grado < 1 || grado > 12)
                    return BadRequest(new { message = "El grado debe estar entre 1 y 12" });

                if (string.IsNullOrWhiteSpace(seccion))
                    return BadRequest(new { message = "La sección es requerida" });

                var lista = await _estudianteService.GetEstudiantesPorGradoSeccionAsync(grado, seccion);

                if (lista == null)
                    return NotFound(new { message = "No se encontraron estudiantes para el grado y sección especificados" });

                return Ok(lista);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lista de estudiantes");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear nuevo estudiante
        /// </summary>
        /// <param name="createDto">Datos del nuevo estudiante</param>
        /// <returns>Estudiante creado</returns>
        [HttpPost]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<EstudianteDto>> Create([FromBody] CreateEstudianteDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Verificar si la matrícula ya existe
                if (await _estudianteService.MatriculaExistsAsync(createDto.Matricula))
                {
                    return BadRequest(new { message = "La matrícula ya está registrada" });
                }

                var estudiante = await _estudianteService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = estudiante.Id }, estudiante);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear estudiante");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar estudiante existente
        /// </summary>
        /// <param name="id">ID del estudiante</param>
        /// <param name="updateDto">Datos actualizados</param>
        /// <returns>Estudiante actualizado</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<EstudianteDto>> Update(int id, [FromBody] UpdateEstudianteDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var estudiante = await _estudianteService.UpdateAsync(id, updateDto);

                if (estudiante == null)
                    return NotFound(new { message = "Estudiante no encontrado" });

                return Ok(estudiante);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar estudiante {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar estudiante (soft delete)
        /// </summary>
        /// <param name="id">ID del estudiante</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _estudianteService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Estudiante no encontrado" });

                return Ok(new { message = "Estudiante eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar estudiante {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener historial académico completo del estudiante
        /// </summary>
        /// <param name="id">ID del estudiante</param>
        /// <returns>Historial con todas las materias, notas y asistencia</returns>
        [HttpGet("{id}/historial")]
        public async Task<ActionResult<EstudianteHistorialDto>> GetHistorial(int id)
        {
            try
            {
                var historial = await _estudianteService.GetHistorialAsync(id);

                if (historial == null)
                    return NotFound(new { message = "Estudiante no encontrado" });

                return Ok(historial);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener historial del estudiante {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}
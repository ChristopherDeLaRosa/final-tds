using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
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
        /// <returns>Lista de estudiantes</returns>
        [HttpGet]
        //[Authorize(Roles = "Admin,Docente")]
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
        //[Authorize(Roles = "Admin,Docente")]
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
        /// Crear nuevo estudiante
        /// </summary>
        /// <param name="createDto">Datos del nuevo estudiante</param>
        /// <returns>Estudiante creado</returns>
        [HttpPost]
        //[Authorize(Roles = "Admin")]
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
        //[Authorize(Roles = "Admin")]
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
        //[Authorize(Roles = "Admin")]
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
        /// Obtener historial académico del estudiante
        /// </summary>
        /// <param name="id">ID del estudiante</param>
        /// <returns>Historial completo con cursos, notas y asistencia</returns>
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
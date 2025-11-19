using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InscripcionesController : ControllerBase
    {
        private readonly IInscripcionService _inscripcionService;
        private readonly ILogger<InscripcionesController> _logger;

        public InscripcionesController(
            IInscripcionService inscripcionService,
            ILogger<InscripcionesController> logger)
        {
            _inscripcionService = inscripcionService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener inscripción por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<InscripcionDto>> GetById(int id)
        {
            try
            {
                var inscripcion = await _inscripcionService.GetByIdAsync(id);

                if (inscripcion == null)
                    return NotFound(new { message = "Inscripción no encontrada" });

                return Ok(inscripcion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener inscripción {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener detalle completo de inscripción con estadísticas
        /// </summary>
        [HttpGet("{id}/detalle")]
        public async Task<ActionResult<InscripcionDetalleDto>> GetDetalle(int id)
        {
            try
            {
                var detalle = await _inscripcionService.GetDetalleByIdAsync(id);

                if (detalle == null)
                    return NotFound(new { message = "Inscripción no encontrada" });

                return Ok(detalle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener detalle de inscripción {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener inscripciones de un estudiante
        /// </summary>
        [HttpGet("estudiante/{estudianteId}")]
        public async Task<ActionResult<IEnumerable<InscripcionDto>>> GetByEstudiante(int estudianteId)
        {
            try
            {
                var inscripciones = await _inscripcionService.GetByEstudianteAsync(estudianteId);
                return Ok(inscripciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener inscripciones del estudiante {EstudianteId}", estudianteId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener horario completo de un estudiante (todas sus materias)
        /// </summary>
        [HttpGet("estudiante/{estudianteId}/horario")]
        public async Task<ActionResult<HorarioEstudianteDto>> GetHorarioEstudiante(
            int estudianteId,
            [FromQuery] string periodo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(periodo))
                    return BadRequest(new { message = "El periodo es requerido" });

                var horario = await _inscripcionService.GetHorarioEstudianteAsync(estudianteId, periodo);

                if (horario == null)
                    return NotFound(new { message = "Estudiante no encontrado" });

                return Ok(horario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener horario del estudiante {EstudianteId}", estudianteId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener inscripciones de un grupo-curso
        /// </summary>
        [HttpGet("grupo/{grupoCursoId}")]
        public async Task<ActionResult<IEnumerable<InscripcionDto>>> GetByGrupoCurso(int grupoCursoId)
        {
            try
            {
                var inscripciones = await _inscripcionService.GetByGrupoCursoAsync(grupoCursoId);
                return Ok(inscripciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener inscripciones del grupo {GrupoCursoId}", grupoCursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener lista de estudiantes inscritos en un grupo con estadísticas
        /// </summary>
        [HttpGet("grupo/{grupoCursoId}/lista-estudiantes")]
        public async Task<ActionResult<ListaEstudiantesGrupoDto>> GetListaEstudiantesGrupo(int grupoCursoId)
        {
            try
            {
                var lista = await _inscripcionService.GetListaEstudiantesGrupoAsync(grupoCursoId);

                if (lista == null)
                    return NotFound(new { message = "Grupo-curso no encontrado" });

                return Ok(lista);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lista de estudiantes del grupo {GrupoCursoId}", grupoCursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear inscripción individual
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<InscripcionDto>> Create([FromBody] CreateInscripcionDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var inscripcion = await _inscripcionService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = inscripcion.Id }, inscripcion);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear inscripción");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Inscribir a un estudiante en todos los grupos de su grado/sección
        /// </summary>
        [HttpPost("estudiante/completo")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<ResultadoInscripcionMasivaDto>> InscribirEstudianteCompleto(
            [FromBody] InscripcionMasivaEstudianteDto inscripcionDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var resultado = await _inscripcionService.InscribirEstudianteCompletoAsync(inscripcionDto);

                return Ok(new
                {
                    message = $"Proceso completado: {resultado.Exitosos} exitosos, {resultado.Fallidos} fallidos",
                    resultado
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al inscribir estudiante completo");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Inscribir múltiples estudiantes en un grupo-curso
        /// </summary>
        [HttpPost("grupo/masivo")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<ResultadoInscripcionMasivaDto>> InscribirGrupoCompleto(
            [FromBody] InscripcionMasivaGrupoDto inscripcionDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var resultado = await _inscripcionService.InscribirGrupoCompletoAsync(inscripcionDto);

                return Ok(new
                {
                    message = $"Proceso completado: {resultado.Exitosos} exitosos, {resultado.Fallidos} fallidos",
                    resultado
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al inscribir grupo completo");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Inscribir todo un grado/sección en todos sus grupos-cursos
        /// </summary>
        [HttpPost("grado-seccion/masivo")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<ResultadoInscripcionMasivaDto>> InscribirGradoSeccionCompleto(
            [FromBody] InscripcionMasivaGradoSeccionDto inscripcionDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var resultado = await _inscripcionService.InscribirGradoSeccionCompletoAsync(inscripcionDto);

                return Ok(new
                {
                    message = $"Proceso completado: {resultado.Exitosos} exitosos, {resultado.Fallidos} fallidos de {resultado.TotalProcesados} intentos",
                    resultado
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al inscribir grado/sección completo");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar inscripción
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<InscripcionDto>> Update(
            int id,
            [FromBody] UpdateInscripcionDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var inscripcion = await _inscripcionService.UpdateAsync(id, updateDto);

                if (inscripcion == null)
                    return NotFound(new { message = "Inscripción no encontrada" });

                return Ok(inscripcion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar inscripción {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar inscripción
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _inscripcionService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Inscripción no encontrada" });

                return Ok(new { message = "Inscripción eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar inscripción {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Retirar estudiante de un grupo-curso
        /// </summary>
        [HttpPatch("{id}/retirar")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<InscripcionDto>> RetirarEstudiante(
            int id,
            [FromBody] string motivo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(motivo))
                    return BadRequest(new { message = "El motivo es requerido" });

                var inscripcion = await _inscripcionService.RetirarEstudianteAsync(id, motivo);

                if (inscripcion == null)
                    return NotFound(new { message = "Inscripción no encontrada" });

                return Ok(inscripcion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al retirar estudiante de inscripción {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener estadísticas de inscripciones por periodo
        /// </summary>
        [HttpGet("estadisticas")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<EstadisticasInscripcionesDto>> GetEstadisticas(
            [FromQuery] string periodo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(periodo))
                    return BadRequest(new { message = "El periodo es requerido" });

                var estadisticas = await _inscripcionService.GetEstadisticasAsync(periodo);
                return Ok(estadisticas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas de inscripciones");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}

using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AsistenciasController : ControllerBase
    {
        private readonly IAsistenciaService _asistenciaService;
        private readonly ILogger<AsistenciasController> _logger;

        public AsistenciasController(
            IAsistenciaService asistenciaService,
            ILogger<AsistenciasController> logger)
        {
            _asistenciaService = asistenciaService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener asistencia por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<AsistenciaDto>> GetById(int id)
        {
            try
            {
                var asistencia = await _asistenciaService.GetByIdAsync(id);

                if (asistencia == null)
                    return NotFound(new { message = "Asistencia no encontrada" });

                return Ok(asistencia);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener asistencia {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener asistencias de una sesión
        /// </summary>
        [HttpGet("sesion/{sesionId}")]
        public async Task<ActionResult<IEnumerable<AsistenciaDto>>> GetBySesion(int sesionId)
        {
            try
            {
                var asistencias = await _asistenciaService.GetBySesionAsync(sesionId);
                return Ok(asistencias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener asistencias de sesión {SesionId}", sesionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener asistencias de un estudiante
        /// </summary>
        [HttpGet("estudiante/{estudianteId}")]
        public async Task<ActionResult<IEnumerable<AsistenciaDto>>> GetByEstudiante(int estudianteId)
        {
            try
            {
                var asistencias = await _asistenciaService.GetByEstudianteAsync(estudianteId);
                return Ok(asistencias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener asistencias del estudiante {EstudianteId}", estudianteId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener asistencias de un estudiante en un grupo específico
        /// </summary>
        [HttpGet("estudiante/{estudianteId}/grupo/{grupoCursoId}")]
        public async Task<ActionResult<IEnumerable<AsistenciaDto>>> GetByEstudianteGrupoCurso(
            int estudianteId,
            int grupoCursoId)
        {
            try
            {
                var asistencias = await _asistenciaService.GetByEstudianteGrupoCursoAsync(
                    estudianteId,
                    grupoCursoId
                );
                return Ok(asistencias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener asistencias");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Registrar asistencia individual
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<AsistenciaDto>> Create([FromBody] CreateAsistenciaDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var asistencia = await _asistenciaService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = asistencia.Id }, asistencia);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear asistencia");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Registrar asistencia para todo un grupo (tomar lista completa)
        /// </summary>
        [HttpPost("grupo")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<List<AsistenciaDto>>> RegistrarGrupo(
            [FromBody] RegistrarAsistenciaGrupoDto registroDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var asistencias = await _asistenciaService.RegistrarAsistenciaGrupoAsync(registroDto);
                return Ok(asistencias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar asistencia grupal");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar asistencia
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<AsistenciaDto>> Update(
            int id,
            [FromBody] UpdateAsistenciaDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var asistencia = await _asistenciaService.UpdateAsync(id, updateDto);

                if (asistencia == null)
                    return NotFound(new { message = "Asistencia no encontrada" });

                return Ok(asistencia);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar asistencia {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar asistencia
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _asistenciaService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Asistencia no encontrada" });

                return Ok(new { message = "Asistencia eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar asistencia {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener reporte de asistencia de un estudiante
        /// </summary>
        [HttpGet("reporte/estudiante/{estudianteId}")]
        public async Task<ActionResult<ReporteAsistenciaEstudianteDto>> GetReporteEstudiante(
            int estudianteId,
            [FromQuery] int? grupoCursoId = null)
        {
            try
            {
                var reporte = await _asistenciaService.GetReporteEstudianteAsync(
                    estudianteId,
                    grupoCursoId
                );

                if (reporte == null)
                    return NotFound(new { message = "Estudiante no encontrado" });

                return Ok(reporte);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar reporte de asistencia del estudiante {EstudianteId}", estudianteId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener reporte de asistencia de un grupo-curso
        /// </summary>
        [HttpGet("reporte/grupo/{grupoCursoId}")]
        public async Task<ActionResult<ReporteAsistenciaGrupoCursoDto>> GetReporteGrupoCurso(
            int grupoCursoId,
            [FromQuery] string? periodo = null)
        {
            try
            {
                var reporte = await _asistenciaService.GetReporteGrupoCursoAsync(
                    grupoCursoId,
                    periodo
                );

                if (reporte == null)
                    return NotFound(new { message = "Grupo no encontrado" });

                return Ok(reporte);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar reporte de asistencia del grupo {GrupoCursoId}", grupoCursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}


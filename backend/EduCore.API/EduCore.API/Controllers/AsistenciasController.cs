using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AsistenciasController : ControllerBase
    {
        private readonly IAsistenciaService _asistenciaService;
        private readonly ISesionService _sesionService;
        private readonly ILogger<AsistenciasController> _logger;

        public AsistenciasController(
            IAsistenciaService asistenciaService,
            ISesionService sesionService,
            ILogger<AsistenciasController> logger)
        {
            _asistenciaService = asistenciaService;
            _sesionService = sesionService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener asistencia por ID (Docentes solo pueden ver asistencias de sus sesiones)
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<AsistenciaDto>> GetById(int id)
        {
            try
            {
                var asistencia = await _asistenciaService.GetByIdAsync(id);

                if (asistencia == null)
                    return NotFound(new { message = "Asistencia no encontrada" });

                // Verificar permisos si es docente
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole == "Docente")
                {
                    var docenteIdClaim = User.FindFirst("DocenteId")?.Value;
                    if (!string.IsNullOrEmpty(docenteIdClaim))
                    {
                        var docenteId = int.Parse(docenteIdClaim);
                        var sesionesDocente = await _sesionService.GetByDocenteAsync(docenteId, null);

                        if (!sesionesDocente.Any(s => s.Id == asistencia.SesionId))
                        {
                            return Forbid();
                        }
                    }
                }

                return Ok(asistencia);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener asistencia {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener asistencias de una sesión (Docentes solo pueden ver sus sesiones)
        /// </summary>
        [HttpGet("sesion/{sesionId}")]
        public async Task<ActionResult<IEnumerable<AsistenciaDto>>> GetBySesion(int sesionId)
        {
            try
            {
                // Verificar permisos si es docente
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole == "Docente")
                {
                    var docenteIdClaim = User.FindFirst("DocenteId")?.Value;
                    if (!string.IsNullOrEmpty(docenteIdClaim))
                    {
                        var docenteId = int.Parse(docenteIdClaim);
                        var sesionesDocente = await _sesionService.GetByDocenteAsync(docenteId, null);

                        if (!sesionesDocente.Any(s => s.Id == sesionId))
                        {
                            return Forbid();
                        }
                    }
                }

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

                // Si es docente, filtrar solo las asistencias de sus sesiones
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole == "Docente")
                {
                    var docenteIdClaim = User.FindFirst("DocenteId")?.Value;
                    if (!string.IsNullOrEmpty(docenteIdClaim))
                    {
                        var docenteId = int.Parse(docenteIdClaim);
                        var sesionesDocente = await _sesionService.GetByDocenteAsync(docenteId, null);
                        var sesionesIds = sesionesDocente.Select(s => s.Id).ToHashSet();

                        asistencias = asistencias.Where(a => sesionesIds.Contains(a.SesionId));
                    }
                }

                return Ok(asistencias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener asistencias del estudiante {EstudianteId}", estudianteId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener asistencias de un estudiante en un grupo específico (Docentes solo pueden ver sus grupos)
        /// </summary>
        [HttpGet("estudiante/{estudianteId}/grupo/{grupoCursoId}")]
        public async Task<ActionResult<IEnumerable<AsistenciaDto>>> GetByEstudianteGrupoCurso(
            int estudianteId,
            int grupoCursoId)
        {
            try
            {
                // Verificar permisos si es docente
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole == "Docente")
                {
                    var docenteIdClaim = User.FindFirst("DocenteId")?.Value;
                    if (!string.IsNullOrEmpty(docenteIdClaim))
                    {
                        var docenteId = int.Parse(docenteIdClaim);
                        var sesionesDocente = await _sesionService.GetByDocenteAsync(docenteId, null);
                        var tieneAcceso = sesionesDocente.Any(s => s.GrupoCursoId == grupoCursoId);

                        if (!tieneAcceso)
                        {
                            return Forbid();
                        }
                    }
                }

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
        /// Registrar asistencia individual (Solo Admin/Coordinador/Docente - el docente solo para sus sesiones)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<AsistenciaDto>> Create([FromBody] CreateAsistenciaDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Verificar permisos si es docente
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole == "Docente")
                {
                    var docenteIdClaim = User.FindFirst("DocenteId")?.Value;
                    if (!string.IsNullOrEmpty(docenteIdClaim))
                    {
                        var docenteId = int.Parse(docenteIdClaim);
                        var sesionesDocente = await _sesionService.GetByDocenteAsync(docenteId, null);

                        if (!sesionesDocente.Any(s => s.Id == createDto.SesionId))
                        {
                            return Forbid();
                        }
                    }
                }

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
        /// Registrar asistencia para todo un grupo (Solo Admin/Coordinador/Docente - el docente solo para sus sesiones)
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

                // Verificar permisos si es docente
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole == "Docente")
                {
                    var docenteIdClaim = User.FindFirst("DocenteId")?.Value;
                    if (!string.IsNullOrEmpty(docenteIdClaim))
                    {
                        var docenteId = int.Parse(docenteIdClaim);
                        var sesionesDocente = await _sesionService.GetByDocenteAsync(docenteId, null);

                        if (!sesionesDocente.Any(s => s.Id == registroDto.SesionId))
                        {
                            return Forbid();
                        }
                    }
                }

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
        /// Actualizar asistencia (Solo Admin/Coordinador/Docente - el docente solo para sus sesiones)
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

                var asistenciaExistente = await _asistenciaService.GetByIdAsync(id);
                if (asistenciaExistente == null)
                    return NotFound(new { message = "Asistencia no encontrada" });

                // Verificar permisos si es docente
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole == "Docente")
                {
                    var docenteIdClaim = User.FindFirst("DocenteId")?.Value;
                    if (!string.IsNullOrEmpty(docenteIdClaim))
                    {
                        var docenteId = int.Parse(docenteIdClaim);
                        var sesionesDocente = await _sesionService.GetByDocenteAsync(docenteId, null);

                        if (!sesionesDocente.Any(s => s.Id == asistenciaExistente.SesionId))
                        {
                            return Forbid();
                        }
                    }
                }

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
        /// Eliminar asistencia (Solo Admin)
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
        /// Obtener reporte de asistencia de un estudiante (Docentes solo pueden ver sus grupos)
        /// </summary>
        [HttpGet("reporte/estudiante/{estudianteId}")]
        public async Task<ActionResult<ReporteAsistenciaEstudianteDto>> GetReporteEstudiante(
            int estudianteId,
            [FromQuery] int? grupoCursoId = null)
        {
            try
            {
                // Verificar permisos si es docente y se especifica un grupo
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole == "Docente" && grupoCursoId.HasValue)
                {
                    var docenteIdClaim = User.FindFirst("DocenteId")?.Value;
                    if (!string.IsNullOrEmpty(docenteIdClaim))
                    {
                        var docenteId = int.Parse(docenteIdClaim);
                        var sesionesDocente = await _sesionService.GetByDocenteAsync(docenteId, null);
                        var tieneAcceso = sesionesDocente.Any(s => s.GrupoCursoId == grupoCursoId.Value);

                        if (!tieneAcceso)
                        {
                            return Forbid();
                        }
                    }
                }

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
        /// Obtener reporte de asistencia de un grupo-curso (Docentes solo pueden ver sus grupos)
        /// </summary>
        [HttpGet("reporte/grupo/{grupoCursoId}")]
        public async Task<ActionResult<ReporteAsistenciaGrupoCursoDto>> GetReporteGrupoCurso(
            int grupoCursoId,
            [FromQuery] string? periodo = null)
        {
            try
            {
                // Verificar permisos si es docente
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole == "Docente")
                {
                    var docenteIdClaim = User.FindFirst("DocenteId")?.Value;
                    if (!string.IsNullOrEmpty(docenteIdClaim))
                    {
                        var docenteId = int.Parse(docenteIdClaim);
                        var sesionesDocente = await _sesionService.GetByDocenteAsync(docenteId, null);
                        var tieneAcceso = sesionesDocente.Any(s => s.GrupoCursoId == grupoCursoId);

                        if (!tieneAcceso)
                        {
                            return Forbid();
                        }
                    }
                }

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

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
        private readonly ILogger<AsistenciasController> _logger;

        public AsistenciasController(IAsistenciaService asistenciaService, ILogger<AsistenciasController> logger)
        {
            _asistenciaService = asistenciaService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todas las asistencias
        /// </summary>
        /// <returns>Lista de asistencias</returns>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<AsistenciaDto>>> GetAll()
        {
            try
            {
                var asistencias = await _asistenciaService.GetAllAsync();
                return Ok(asistencias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener asistencias");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener asistencia por ID
        /// </summary>
        /// <param name="id">ID de la asistencia</param>
        /// <returns>Datos de la asistencia</returns>
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
        /// Obtener asistencias por sesión
        /// </summary>
        /// <param name="sesionId">ID de la sesión</param>
        /// <returns>Lista de asistencias de la sesión</returns>
        [HttpGet("sesion/{sesionId}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<IEnumerable<AsistenciaDto>>> GetBySesion(int sesionId)
        {
            try
            {
                var asistencias = await _asistenciaService.GetBySesionAsync(sesionId);
                return Ok(asistencias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener asistencias de la sesión {SesionId}", sesionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener asistencias por estudiante
        /// </summary>
        /// <param name="estudianteId">ID del estudiante</param>
        /// <returns>Lista de asistencias del estudiante</returns>
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
        /// Crear nueva asistencia
        /// </summary>
        /// <param name="createDto">Datos de la nueva asistencia</param>
        /// <returns>Asistencia creada</returns>
        [HttpPost]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<AsistenciaDto>> Create([FromBody] CreateAsistenciaDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var asistencia = await _asistenciaService.CreateAsync(createDto, usuarioId);

                return CreatedAtAction(nameof(GetById), new { id = asistencia.Id }, asistencia);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear asistencia");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar asistencia existente
        /// </summary>
        /// <param name="id">ID de la asistencia</param>
        /// <param name="updateDto">Datos actualizados</param>
        /// <returns>Asistencia actualizada</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<AsistenciaDto>> Update(int id, [FromBody] UpdateAsistenciaDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var asistencia = await _asistenciaService.UpdateAsync(id, updateDto, usuarioId);

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
        /// <param name="id">ID de la asistencia</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Docente")]
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
        /// Registrar asistencia masiva para una sesión
        /// </summary>
        /// <param name="sesionId">ID de la sesión</param>
        /// <param name="registroDto">Lista de asistencias a registrar</param>
        /// <returns>Confirmación de registro</returns>
        [HttpPost("registrar-sesion/{sesionId}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<IActionResult> RegistrarSesion(int sesionId, [FromBody] RegistroAsistenciaSesionDto registroDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _asistenciaService.RegistrarAsistenciaSesionAsync(sesionId, registroDto, usuarioId);

                if (!result)
                    return BadRequest(new { message = "Error al registrar asistencia de la sesión" });

                return Ok(new { message = "Asistencia registrada exitosamente", total = registroDto.Asistencias.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar asistencia de sesión {SesionId}", sesionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener lista de asistencia de una sesión
        /// </summary>
        /// <param name="sesionId">ID de la sesión</param>
        /// <returns>Lista completa de estudiantes con su asistencia</returns>
        [HttpGet("lista-sesion/{sesionId}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<ListaAsistenciaSesionDto>> GetListaSesion(int sesionId)
        {
            try
            {
                var lista = await _asistenciaService.GetListaAsistenciaSesionAsync(sesionId);

                if (lista == null)
                    return NotFound(new { message = "Sesión no encontrada" });

                return Ok(lista);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lista de asistencia de sesión {SesionId}", sesionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener resumen de asistencia de una sección
        /// </summary>
        /// <param name="seccionId">ID de la sección</param>
        /// <returns>Resumen con porcentajes de asistencia por estudiante</returns>
        [HttpGet("resumen-seccion/{seccionId}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<ResumenAsistenciaSeccionDto>> GetResumenSeccion(int seccionId)
        {
            try
            {
                var resumen = await _asistenciaService.GetResumenAsistenciaSeccionAsync(seccionId);

                if (resumen == null)
                    return NotFound(new { message = "Sección no encontrada" });

                return Ok(resumen);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener resumen de asistencia de sección {SeccionId}", seccionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener resumen de asistencia de un estudiante
        /// </summary>
        /// <param name="estudianteId">ID del estudiante</param>
        /// <returns>Resumen de asistencia en todas las secciones</returns>
        [HttpGet("resumen-estudiante/{estudianteId}")]
        public async Task<ActionResult<ResumenAsistenciaEstudianteDto>> GetResumenEstudiante(int estudianteId)
        {
            try
            {
                var resumen = await _asistenciaService.GetResumenAsistenciaEstudianteAsync(estudianteId);

                if (resumen == null)
                    return NotFound(new { message = "Estudiante no encontrado" });

                return Ok(resumen);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener resumen de asistencia del estudiante {EstudianteId}", estudianteId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Generar plantilla de asistencia para una sesión (facilita al docente pasar lista)
        /// </summary>
        /// <param name="sesionId">ID de la sesión</param>
        /// <returns>Plantilla con todos los estudiantes marcados como "Presente" por defecto</returns>
        [HttpGet("plantilla-sesion/{sesionId}")]
        [Authorize(Roles = "Admin,Docente")]
        public async Task<ActionResult<List<AsistenciaRegistroDto>>> GenerarPlantilla(int sesionId)
        {
            try
            {
                var plantilla = await _asistenciaService.GenerarPlantillaAsistenciaAsync(sesionId);

                if (!plantilla.Any())
                    return NotFound(new { message = "Sesión no encontrada o sin estudiantes inscritos" });

                return Ok(plantilla);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar plantilla de asistencia para sesión {SesionId}", sesionId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}
using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AulasController : ControllerBase
    {
        private readonly IAulaService _aulaService;
        private readonly ILogger<AulasController> _logger;

        public AulasController(IAulaService aulaService, ILogger<AulasController> logger)
        {
            _aulaService = aulaService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todas las aulas activas
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AulaDto>>> GetAll()
        {
            try
            {
                var aulas = await _aulaService.GetAllAsync();
                return Ok(aulas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener aulas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener aula por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<AulaDto>> GetById(int id)
        {
            try
            {
                var aula = await _aulaService.GetByIdAsync(id);

                if (aula == null)
                    return NotFound(new { message = "Aula no encontrada" });

                return Ok(aula);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener aula {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener detalle completo de aula (con horarios, estudiantes, grupos)
        /// </summary>
        [HttpGet("{id}/detalle")]
        public async Task<ActionResult<AulaDetalleDto>> GetDetalle(int id)
        {
            try
            {
                var detalle = await _aulaService.GetDetalleByIdAsync(id);

                if (detalle == null)
                    return NotFound(new { message = "Aula no encontrada" });

                return Ok(detalle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener detalle de aula {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener aula por grado, sección y periodo
        /// </summary>
        [HttpGet("grado/{grado}/seccion/{seccion}")]
        public async Task<ActionResult<AulaDto>> GetByGradoSeccionPeriodo(
            int grado,
            string seccion,
            [FromQuery] string periodo)
        {
            try
            {
                if (grado < 1 || grado > 12)
                    return BadRequest(new { message = "El grado debe estar entre 1 y 12" });

                if (string.IsNullOrWhiteSpace(seccion))
                    return BadRequest(new { message = "La sección es requerida" });

                if (string.IsNullOrWhiteSpace(periodo))
                    return BadRequest(new { message = "El periodo es requerido" });

                var aula = await _aulaService.GetByGradoSeccionPeriodoAsync(grado, seccion, periodo);

                if (aula == null)
                    return NotFound(new { message = "Aula no encontrada" });

                return Ok(aula);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener aula por grado/sección/periodo");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener aulas por periodo académico
        /// </summary>
        [HttpGet("periodo/{periodo}")]
        public async Task<ActionResult<IEnumerable<AulaDto>>> GetByPeriodo(string periodo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(periodo))
                    return BadRequest(new { message = "El periodo es requerido" });

                var aulas = await _aulaService.GetByPeriodoAsync(periodo);
                return Ok(aulas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener aulas por periodo {Periodo}", periodo);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear nueva aula
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<AulaDto>> Create([FromBody] CreateAulaDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var aula = await _aulaService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = aula.Id }, aula);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear aula");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar aula
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<AulaDto>> Update(int id, [FromBody] UpdateAulaDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var aula = await _aulaService.UpdateAsync(id, updateDto);

                if (aula == null)
                    return NotFound(new { message = "Aula no encontrada" });

                return Ok(aula);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar aula {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar aula (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _aulaService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Aula no encontrada o tiene estudiantes/grupos activos" });

                return Ok(new { message = "Aula eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar aula {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ==================== GESTIÓN DE HORARIOS ====================

        /// <summary>
        /// Obtener horarios de un aula
        /// </summary>
        [HttpGet("{id}/horarios")]
        public async Task<ActionResult<IEnumerable<HorarioAulaDto>>> GetHorarios(int id)
        {
            try
            {
                var horarios = await _aulaService.GetHorariosAulaAsync(id);
                return Ok(horarios);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener horarios del aula {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear horario individual
        /// </summary>
        [HttpPost("horarios")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<HorarioAulaDto>> CreateHorario([FromBody] CreateHorarioAulaDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var horario = await _aulaService.CreateHorarioAsync(createDto);
                return Ok(horario);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear horario");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar horario
        /// </summary>
        [HttpPut("horarios/{horarioId}")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<HorarioAulaDto>> UpdateHorario(
            int horarioId,
            [FromBody] UpdateHorarioAulaDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var horario = await _aulaService.UpdateHorarioAsync(horarioId, updateDto);

                if (horario == null)
                    return NotFound(new { message = "Horario no encontrado" });

                return Ok(horario);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar horario {HorarioId}", horarioId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar horario
        /// </summary>
        [HttpDelete("horarios/{horarioId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteHorario(int horarioId)
        {
            try
            {
                var result = await _aulaService.DeleteHorarioAsync(horarioId);

                if (!result)
                    return NotFound(new { message = "Horario no encontrado" });

                return Ok(new { message = "Horario eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar horario {HorarioId}", horarioId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Configurar horario completo del aula (crear horarios + generar grupos + generar sesiones)
        /// </summary>
        [HttpPost("{id}/configurar-horario-completo")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<ResultadoConfiguracionAulaDto>> ConfigurarHorarioCompleto(
            int id,
            [FromBody] ConfigurarHorarioCompletoDto configDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Asegurar que el AulaId coincida
                configDto.AulaId = id;

                var resultado = await _aulaService.ConfigurarHorarioCompletoAsync(configDto);

                if (!resultado.Exitoso)
                {
                    return BadRequest(new
                    {
                        message = resultado.Mensaje,
                        errores = resultado.Errores,
                        resultado
                    });
                }

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al configurar horario completo para aula {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ==================== AUTO-GENERACIÓN ====================

        /// <summary>
        /// Generar grupos-cursos desde el horario del aula
        /// </summary>
        [HttpPost("{id}/generar-grupos")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<ResultadoConfiguracionAulaDto>> GenerarGrupos(int id)
        {
            try
            {
                var resultado = await _aulaService.GenerarGruposCursosDesdeHorarioAsync(id);

                if (!resultado.Exitoso)
                {
                    return BadRequest(new
                    {
                        message = resultado.Mensaje,
                        errores = resultado.Errores,
                        resultado
                    });
                }

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar grupos para aula {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Generar sesiones para todo el periodo escolar
        /// </summary>
        [HttpPost("{id}/generar-sesiones")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<ResultadoConfiguracionAulaDto>> GenerarSesiones(int id)
        {
            try
            {
                var resultado = await _aulaService.GenerarSesionesParaAulaAsync(id);

                if (!resultado.Exitoso)
                {
                    return BadRequest(new
                    {
                        message = resultado.Mensaje,
                        errores = resultado.Errores,
                        resultado
                    });
                }

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar sesiones para aula {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ==================== GESTIÓN DE ESTUDIANTES ====================

        /// <summary>
        /// Asignar estudiante a aula
        /// </summary>
        [HttpPost("{id}/asignar-estudiante/{estudianteId}")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<IActionResult> AsignarEstudiante(int id, int estudianteId)
        {
            try
            {
                var result = await _aulaService.AsignarEstudianteAsync(estudianteId, id);

                if (!result)
                    return NotFound(new { message = "Aula o estudiante no encontrado" });

                return Ok(new { message = "Estudiante asignado exitosamente" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al asignar estudiante {EstudianteId} a aula {AulaId}", estudianteId, id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Remover estudiante del aula
        /// </summary>
        [HttpDelete("remover-estudiante/{estudianteId}")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<IActionResult> RemoverEstudiante(int estudianteId)
        {
            try
            {
                var result = await _aulaService.RemoverEstudianteAsync(estudianteId);

                if (!result)
                    return NotFound(new { message = "Estudiante no encontrado o no está en un aula" });

                return Ok(new { message = "Estudiante removido del aula exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al remover estudiante {EstudianteId} del aula", estudianteId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Inscribir múltiples estudiantes en aula (asigna al aula + inscribe en todos los grupos)
        /// </summary>
        [HttpPost("{id}/inscribir-estudiantes")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<ResultadoInscripcionMasivaDto>> InscribirEstudiantes(
            int id,
            [FromBody] List<int> estudiantesIds)
        {
            try
            {
                if (estudiantesIds == null || !estudiantesIds.Any())
                    return BadRequest(new { message = "Debe proporcionar al menos un estudiante" });

                var resultado = await _aulaService.InscribirEstudiantesEnAulaAsync(id, estudiantesIds);

                return Ok(new
                {
                    message = $"Proceso completado: {resultado.Exitosos} exitosos, {resultado.Fallidos} fallidos",
                    resultado
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al inscribir estudiantes en aula {AulaId}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ==================== VALIDACIONES ====================

        /// <summary>
        /// Verificar si el aula tiene cupos disponibles
        /// </summary>
        [HttpGet("{id}/tiene-cupo")]
        public async Task<ActionResult<bool>> TieneCupo(int id)
        {
            try
            {
                var tieneCupo = await _aulaService.TieneCupoAsync(id);
                return Ok(new { tieneCupo });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar cupo del aula {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}
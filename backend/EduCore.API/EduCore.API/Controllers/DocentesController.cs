using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DocentesController : ControllerBase
    {
        private readonly IDocenteService _docenteService;
        private readonly ILogger<DocentesController> _logger;

        public DocentesController(
            IDocenteService docenteService,
            ILogger<DocentesController> logger)
        {
            _docenteService = docenteService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los docentes
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<IEnumerable<DocenteDto>>> GetAll()
        {
            try
            {
                var docentes = await _docenteService.GetAllAsync();
                return Ok(docentes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener docentes");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener todos los docentes activos
        /// </summary>
        [HttpGet("activos")]
        public async Task<ActionResult<IEnumerable<DocenteDto>>> GetAllActivos()
        {
            try
            {
                var docentes = await _docenteService.GetAllActivosAsync();
                return Ok(docentes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener docentes activos");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener docente por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<DocenteDto>> GetById(int id)
        {
            try
            {
                var docente = await _docenteService.GetByIdAsync(id);

                if (docente == null)
                    return NotFound(new { message = "Docente no encontrado" });

                return Ok(docente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener docente {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Generar siguiente código disponible
        /// </summary>
        /// <returns>Siguiente código en formato DOC-NNN</returns>
        [HttpGet("generar-codigo")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<object>> GenerarCodigo()
        {
            try
            {
                var codigo = await _docenteService.GenerarCodigoAsync();
                return Ok(new { codigo });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar código");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener detalle completo de docente con estadísticas
        /// </summary>
        [HttpGet("{id}/detalle")]
        public async Task<ActionResult<DocenteDetalleDto>> GetDetalle(int id)
        {
            try
            {
                var detalle = await _docenteService.GetDetalleByIdAsync(id);

                if (detalle == null)
                    return NotFound(new { message = "Docente no encontrado" });

                return Ok(detalle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener detalle de docente {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener docente por código
        /// </summary>
        [HttpGet("codigo/{codigo}")]
        public async Task<ActionResult<DocenteDto>> GetByCodigo(string codigo)
        {
            try
            {
                var docente = await _docenteService.GetByCodigoAsync(codigo);

                if (docente == null)
                    return NotFound(new { message = "Docente no encontrado" });

                return Ok(docente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener docente por código {Codigo}", codigo);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Buscar docentes con filtros
        /// </summary>
        [HttpPost("buscar")]
        public async Task<ActionResult<IEnumerable<DocenteDto>>> Search([FromBody] DocenteFiltrosDto filtros)
        {
            try
            {
                var docentes = await _docenteService.SearchAsync(filtros);
                return Ok(docentes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al buscar docentes");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener docentes por especialidad
        /// </summary>
        [HttpGet("especialidad/{especialidad}")]
        public async Task<ActionResult<IEnumerable<DocenteDto>>> GetByEspecialidad(string especialidad)
        {
            try
            {
                var docentes = await _docenteService.GetByEspecialidadAsync(especialidad);
                return Ok(docentes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener docentes por especialidad {Especialidad}", especialidad);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear nuevo docente
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<DocenteDto>> Create([FromBody] CreateDocenteDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var docente = await _docenteService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = docente.Id }, docente);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear docente");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar docente
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<DocenteDto>> Update(int id, [FromBody] UpdateDocenteDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var docente = await _docenteService.UpdateAsync(id, updateDto);

                if (docente == null)
                    return NotFound(new { message = "Docente no encontrado" });

                return Ok(docente);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar docente {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar docente (solo si no tiene grupos asignados)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _docenteService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Docente no encontrado o tiene grupos asignados" });

                return Ok(new { message = "Docente eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar docente {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener horario semanal del docente
        /// </summary>
        [HttpGet("{id}/horario-semanal")]
        public async Task<ActionResult<HorarioDocenteDto>> GetHorarioSemanal(
            int id,
            [FromQuery] DateTime fecha)
        {
            try
            {
                var horario = await _docenteService.GetHorarioSemanalAsync(id, fecha);

                if (horario == null)
                    return NotFound(new { message = "Docente no encontrado" });

                return Ok(horario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener horario semanal del docente {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener sesiones del docente
        /// </summary>
        [HttpGet("{id}/sesiones")]
        public async Task<ActionResult<IEnumerable<SesionDto>>> GetSesiones(
            int id,
            [FromQuery] DateTime? fecha = null)
        {
            try
            {
                var sesiones = await _docenteService.GetSesionesAsync(id, fecha);
                return Ok(sesiones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener sesiones del docente {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener grupos asignados al docente
        /// </summary>
        [HttpGet("{id}/grupos")]
        public async Task<ActionResult<IEnumerable<GrupoCursoDto>>> GetGruposAsignados(
            int id,
            [FromQuery] string? periodo = null)
        {
            try
            {
                var grupos = await _docenteService.GetGruposAsignadosAsync(id, periodo);
                return Ok(grupos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener grupos del docente {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener carga académica del docente
        /// </summary>
        [HttpGet("{id}/carga-academica")]
        public async Task<ActionResult<CargaAcademicaDocenteDto>> GetCargaAcademica(
            int id,
            [FromQuery] string periodo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(periodo))
                    return BadRequest(new { message = "El periodo es requerido" });

                var carga = await _docenteService.GetCargaAcademicaAsync(id, periodo);

                if (carga == null)
                    return NotFound(new { message = "Docente no encontrado" });

                return Ok(carga);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener carga académica del docente {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener estadísticas del docente
        /// </summary>
        [HttpGet("{id}/estadisticas")]
        public async Task<ActionResult<EstadisticasDocenteDto>> GetEstadisticas(
            int id,
            [FromQuery] string periodo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(periodo))
                    return BadRequest(new { message = "El periodo es requerido" });

                var estadisticas = await _docenteService.GetEstadisticasAsync(id, periodo);

                if (estadisticas == null)
                    return NotFound(new { message = "Docente no encontrado" });

                return Ok(estadisticas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas del docente {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}


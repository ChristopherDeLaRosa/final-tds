using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GruposCursosController : ControllerBase
    {
        private readonly IGrupoCursoService _grupoService;
        private readonly ILogger<GruposCursosController> _logger;

        public GruposCursosController(
            IGrupoCursoService grupoService,
            ILogger<GruposCursosController> logger)
        {
            _grupoService = grupoService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los grupos activos
        /// </summary>
        /// <returns>Lista de grupos</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GrupoCursoDto>>> GetAll()
        {
            try
            {
                var grupos = await _grupoService.GetAllAsync();
                return Ok(grupos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener grupos");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener grupo por ID
        /// </summary>
        /// <param name="id">ID del grupo</param>
        /// <returns>Datos del grupo</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<GrupoCursoDto>> GetById(int id)
        {
            try
            {
                var grupo = await _grupoService.GetByIdAsync(id);

                if (grupo == null)
                    return NotFound(new { message = "Grupo no encontrado" });

                return Ok(grupo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener grupo {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener detalle completo del grupo incluyendo estudiantes
        /// </summary>
        /// <param name="id">ID del grupo</param>
        /// <returns>Detalle completo del grupo</returns>
        [HttpGet("{id}/detalle")]
        public async Task<ActionResult<GrupoCursoDetalleDto>> GetDetalle(int id)
        {
            try
            {
                var detalle = await _grupoService.GetDetalleByIdAsync(id);

                if (detalle == null)
                    return NotFound(new { message = "Grupo no encontrado" });

                return Ok(detalle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener detalle del grupo {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener grupos por periodo académico
        /// </summary>
        /// <param name="periodo">Periodo académico</param>
        /// <returns>Lista de grupos del periodo</returns>
        [HttpGet("periodo/{periodo}")]
        public async Task<ActionResult<IEnumerable<GrupoCursoDto>>> GetByPeriodo(string periodo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(periodo))
                    return BadRequest(new { message = "El periodo es requerido" });

                var grupos = await _grupoService.GetByPeriodoAsync(periodo);
                return Ok(grupos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener grupos por periodo {Periodo}", periodo);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener grupos por grado y sección
        /// </summary>
        /// <param name="grado">Grado escolar (1-12)</param>
        /// <param name="seccion">Sección (A, B, C, etc.)</param>
        /// <param name="periodo">Periodo académico</param>
        /// <returns>Lista de grupos del grado y sección</returns>
        [HttpGet("grado/{grado}/seccion/{seccion}")]
        public async Task<ActionResult<IEnumerable<GrupoCursoDto>>> GetByGradoSeccion(
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

                var grupos = await _grupoService.GetByGradoSeccionAsync(grado, seccion, periodo);
                return Ok(grupos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener grupos por grado y sección");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener grupos por curso
        /// </summary>
        /// <param name="cursoId">ID del curso</param>
        /// <returns>Lista de grupos del curso</returns>
        [HttpGet("curso/{cursoId}")]
        public async Task<ActionResult<IEnumerable<GrupoCursoDto>>> GetByCurso(int cursoId)
        {
            try
            {
                var grupos = await _grupoService.GetByCursoAsync(cursoId);
                return Ok(grupos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener grupos por curso {CursoId}", cursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener grupos asignados a un docente
        /// </summary>
        /// <param name="docenteId">ID del docente</param>
        /// <returns>Lista de grupos del docente</returns>
        [HttpGet("docente/{docenteId}")]
        public async Task<ActionResult<IEnumerable<GrupoCursoDto>>> GetByDocente(int docenteId)
        {
            try
            {
                var grupos = await _grupoService.GetByDocenteAsync(docenteId);
                return Ok(grupos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener grupos por docente {DocenteId}", docenteId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener horario completo de un grado y sección
        /// </summary>
        /// <param name="grado">Grado escolar (1-12)</param>
        /// <param name="seccion">Sección (A, B, C, etc.)</param>
        /// <param name="periodo">Periodo académico</param>
        /// <returns>Horario del grado y sección</returns>
        [HttpGet("horario/grado/{grado}/seccion/{seccion}")]
        public async Task<ActionResult<HorarioGradoDto>> GetHorario(
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

                var horario = await _grupoService.GetHorarioByGradoSeccionAsync(grado, seccion, periodo);

                if (horario == null)
                    return NotFound(new { message = "No se encontró horario para el grado y sección especificados" });

                return Ok(horario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener horario para grado {Grado} sección {Seccion}", grado, seccion);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear nuevo grupo
        /// </summary>
        /// <param name="createDto">Datos del nuevo grupo</param>
        /// <returns>Grupo creado</returns>
        [HttpPost]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<GrupoCursoDto>> Create([FromBody] CreateGrupoCursoDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Verificar si el código ya existe
                if (await _grupoService.CodigoExistsAsync(createDto.Codigo))
                {
                    return BadRequest(new { message = "El código ya está registrado" });
                }

                var grupo = await _grupoService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = grupo.Id }, grupo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear grupo");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar grupo existente
        /// </summary>
        /// <param name="id">ID del grupo</param>
        /// <param name="updateDto">Datos actualizados</param>
        /// <returns>Grupo actualizado</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Coordinador")]
        public async Task<ActionResult<GrupoCursoDto>> Update(int id, [FromBody] UpdateGrupoCursoDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var grupo = await _grupoService.UpdateAsync(id, updateDto);

                if (grupo == null)
                    return NotFound(new { message = "Grupo no encontrado" });

                return Ok(grupo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar grupo {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar grupo (soft delete)
        /// </summary>
        /// <param name="id">ID del grupo</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _grupoService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Grupo no encontrado o tiene estudiantes inscritos" });

                return Ok(new { message = "Grupo eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar grupo {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}
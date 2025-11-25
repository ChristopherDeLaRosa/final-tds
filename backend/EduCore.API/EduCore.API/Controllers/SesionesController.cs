using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Hosting;
using System.Globalization;
using System.Numerics;
using System.Text.RegularExpressions;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SesionesController : ControllerBase
    {
        private readonly ISesionService _sesionService;
        private readonly ILogger<SesionesController> _logger;

        public SesionesController(
            ISesionService sesionService,
            ILogger<SesionesController> logger)
        {
            _sesionService = sesionService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener sesión por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<SesionDto>> GetById(int id)
        {
            try
            {
                var sesion = await _sesionService.GetByIdAsync(id);

                if (sesion == null)
                    return NotFound(new { message = "Sesión no encontrada" });

                return Ok(sesion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener sesión {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener detalle completo de una sesión con asistencias
        /// </summary>
        [HttpGet("{id}/detalle")]
        public async Task<ActionResult<SesionDetalleDto>> GetDetalle(int id)
        {
            try
            {
                var detalle = await _sesionService.GetDetalleByIdAsync(id);

                if (detalle == null)
                    return NotFound(new { message = "Sesión no encontrada" });

                return Ok(detalle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener detalle de sesión {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener sesiones de un grupo-curso
        /// </summary>
        [HttpGet("grupo/{grupoCursoId}")]
        public async Task<ActionResult<IEnumerable<SesionDto>>> GetByGrupoCurso(int grupoCursoId)
        {
            try
            {
                var sesiones = await _sesionService.GetByGrupoCursoAsync(grupoCursoId);
                return Ok(sesiones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener sesiones del grupo {GrupoCursoId}", grupoCursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener sesiones de un grupo-curso en un rango de fechas
        /// </summary>
        [HttpGet("grupo/{grupoCursoId}/fechas")]
        public async Task<ActionResult<IEnumerable<SesionDto>>> GetByGrupoCursoFechas(
            int grupoCursoId,
            [FromQuery] DateTime fechaInicio,
            [FromQuery] DateTime fechaFin)
        {
            try
            {
                if (fechaFin < fechaInicio)
                    return BadRequest(new { message = "La fecha de fin debe ser posterior a la fecha de inicio" });

                var sesiones = await _sesionService.GetByGrupoCursoFechasAsync(
                    grupoCursoId,
                    fechaInicio,
                    fechaFin
                );
                return Ok(sesiones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener sesiones por fechas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener sesiones por fecha específica
        /// </summary>
        [HttpGet("fecha/{fecha}")]
        public async Task<ActionResult<IEnumerable<SesionDto>>> GetByFecha(DateTime fecha)
        {
            try
            {
                var sesiones = await _sesionService.GetByFechaAsync(fecha);
                return Ok(sesiones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener sesiones por fecha {Fecha}", fecha.ToShortDateString());
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener sesiones en un rango de fechas
        /// </summary>
        [HttpGet("rango-fechas")]
        public async Task<ActionResult<IEnumerable<SesionDto>>> GetByRangoFechas(
            [FromQuery] DateTime fechaInicio,
            [FromQuery] DateTime fechaFin)
        {
            try
            {
                if (fechaFin < fechaInicio)
                    return BadRequest(new { message = "La fecha de fin debe ser posterior a la fecha de inicio" });

                var sesiones = await _sesionService.GetByRangoFechasAsync(fechaInicio, fechaFin);
                return Ok(sesiones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener sesiones por rango de fechas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener sesiones de un docente
        /// </summary>
        [HttpGet("docente/{docenteId}")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<IEnumerable<SesionDto>>> GetByDocente(
            int docenteId,
            [FromQuery] DateTime? fecha = null)
        {
            try
            {
                var sesiones = await _sesionService.GetByDocenteAsync(docenteId, fecha);
                return Ok(sesiones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener sesiones del docente {DocenteId}", docenteId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear nueva sesión
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<SesionDto>> Create([FromBody] CreateSesionDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var sesion = await _sesionService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = sesion.Id }, sesion);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear sesión");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear múltiples sesiones recurrentes (programación automática)
        /// </summary>
        [HttpPost("recurrentes")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<List<SesionDto>>> CrearRecurrentes(
            [FromBody] CrearSesionesRecurrentesDto recurrenteDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var sesiones = await _sesionService.CrearSesionesRecurrentesAsync(recurrenteDto);

                return Ok(new
                {
                    message = $"{sesiones.Count} sesiones creadas exitosamente",
                    sesiones
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear sesiones recurrentes");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar sesión
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<SesionDto>> Update(int id, [FromBody] UpdateSesionDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var sesion = await _sesionService.UpdateAsync(id, updateDto);

                if (sesion == null)
                    return NotFound(new { message = "Sesión no encontrada" });

                return Ok(sesion);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar sesión {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar sesión (solo si no tiene asistencias)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _sesionService.DeleteAsync(id);

                if (!result)
                    return NotFound(new { message = "Sesión no encontrada o tiene asistencias registradas" });

                return Ok(new { message = "Sesión eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar sesión {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Marcar sesión como realizada
        /// </summary>
        [HttpPatch("{id}/marcar-realizada")]
        [Authorize(Roles = "Admin,Docente,Coordinador")]
        public async Task<ActionResult<SesionDto>> MarcarComoRealizada(int id)
        {
            try
            {
                var sesion = await _sesionService.MarcarComoRealizadaAsync(id);

                if (sesion == null)
                    return NotFound(new { message = "Sesión no encontrada" });

                return Ok(sesion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al marcar sesión como realizada {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener horario semanal de un grupo-curso
        /// </summary>
        [HttpGet("grupo/{grupoCursoId}/horario-semanal")]
        public async Task<ActionResult<HorarioSemanalGrupoDto>> GetHorarioSemanal(
            int grupoCursoId,
            [FromQuery] DateTime fecha)
        {
            try
            {
                var horario = await _sesionService.GetHorarioSemanalAsync(grupoCursoId, fecha);

                if (horario == null)
                    return NotFound(new { message = "Grupo no encontrado" });

                return Ok(horario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener horario semanal del grupo {GrupoCursoId}", grupoCursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener calendario mensual de sesiones por grado y sección
        /// </summary>
        [HttpGet("calendario/grado/{grado}/seccion/{seccion}")]
        public async Task<ActionResult<CalendarioMensualDto>> GetCalendarioMensual(
            int grado,
            string seccion,
            [FromQuery] int anio,
            [FromQuery] int mes)
        {
            try
            {
                if (grado < 1 || grado > 12)
                    return BadRequest(new { message = "El grado debe estar entre 1 y 12" });

                if (mes < 1 || mes > 12)
                    return BadRequest(new { message = "El mes debe estar entre 1 y 12" });

                if (string.IsNullOrWhiteSpace(seccion))
                    return BadRequest(new { message = "La sección es requerida" });

                var calendario = await _sesionService.GetCalendarioMensualAsync(grado, seccion, anio, mes);
                return Ok(calendario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener calendario mensual");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener estadísticas de sesiones de un grupo-curso
        /// </summary>
        [HttpGet("grupo/{grupoCursoId}/estadisticas")]
        public async Task<ActionResult<EstadisticasSesionesDto>> GetEstadisticas(
            int grupoCursoId,
            [FromQuery] string? periodo = null)
        {
            try
            {
                var estadisticas = await _sesionService.GetEstadisticasGrupoCursoAsync(grupoCursoId, periodo);

                if (estadisticas == null)
                    return NotFound(new { message = "Grupo no encontrado" });

                return Ok(estadisticas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas del grupo {GrupoCursoId}", grupoCursoId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}

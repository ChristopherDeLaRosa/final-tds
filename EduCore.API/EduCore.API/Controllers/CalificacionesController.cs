using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using EduCore.API.DTOs;
using EduCore.API.Services;
using EduCore.API.DTOs.GradeDTOs;
using EduCore.API.Services.Interfaces;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class CalificacionesController : ControllerBase
{
    private readonly ICalificacionService _calificacionService;

    public CalificacionesController(ICalificacionService calificacionService)
    {
        _calificacionService = calificacionService;
    }

    /// <summary>
    /// Obtener rubros de calificación de un curso
    /// </summary>
    /// <param name="courseId">ID del curso</param>
    /// <returns>Lista de rubros</returns>
    [HttpGet("cursos/{courseId}/rubros")]
    [Authorize(Roles = "admin,docente")]
    public async Task<ActionResult<List<GradeItemResponseDto>>> GetRubros(int courseId)
    {
        var result = await _calificacionService.GetRubrosByCourseAsync(courseId);
        return Ok(result);
    }

    /// <summary>
    /// Crear un nuevo rubro de calificación
    /// </summary>
    /// <param name="courseId">ID del curso</param>
    /// <param name="dto">Datos del rubro</param>
    /// <returns>Rubro creado</returns>
    [HttpPost("cursos/{courseId}/rubros")]
    [Authorize(Roles = "admin,docente")]
    public async Task<ActionResult<GradeItemResponseDto>> CreateRubro(int courseId, [FromBody] CreateGradeItemDto dto)
    {
        var userId = GetUserIdFromToken() ?? throw new UnauthorizedAccessException();
        var result = await _calificacionService.CreateRubroAsync(courseId, dto, userId.Value);
        return CreatedAtAction(nameof(GetRubros), new { courseId }, result);
    }

    /// <summary>
    /// Actualizar un rubro existente
    /// </summary>
    /// <param name="id">ID del rubro</param>
    /// <param name="dto">Datos a actualizar</param>
    /// <returns>Rubro actualizado</returns>
    [HttpPut("rubros/{id}")]
    [Authorize(Roles = "admin,docente")]
    public async Task<ActionResult<GradeItemResponseDto>> UpdateRubro(int id, [FromBody] UpdateGradeItemDto dto)
    {
        var userId = GetUserIdFromToken() ?? throw new UnauthorizedAccessException();
        var result = await _calificacionService.UpdateRubroAsync(id, dto, userId.Value);
        return Ok(result);
    }

    /// <summary>
    /// Eliminar un rubro (solo si no tiene calificaciones)
    /// </summary>
    /// <param name="id">ID del rubro</param>
    /// <returns>Confirmación de eliminación</returns>
    [HttpDelete("rubros/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult> DeleteRubro(int id)
    {
        await _calificacionService.DeleteRubroAsync(id);
        return Ok(new { message = "Rubro eliminado exitosamente" });
    }

    /// <summary>
    /// Carga masiva de calificaciones para una sección y rubro
    /// </summary>
    /// <param name="dto">Datos de la carga masiva</param>
    /// <returns>Lista de calificaciones creadas/actualizadas</returns>
    [HttpPost("calificaciones/carga")]
    [Authorize(Roles = "docente")]
    public async Task<ActionResult<List<GradeEntryResponseDto>>> CargaMasiva([FromBody] CargaMasivaCalificacionesDto dto)
    {
        var userId = GetUserIdFromToken() ?? throw new UnauthorizedAccessException();
        var result = await _calificacionService.CargaMasivaAsync(dto, userId.Value);
        return Ok(result);
    }

    /// <summary>
    /// Actualizar una calificación individual
    /// </summary>
    /// <param name="gradeEntryId">ID de la calificación</param>
    /// <param name="dto">Datos a actualizar</param>
    /// <returns>Calificación actualizada</returns>
    [HttpPut("calificaciones/{gradeEntryId}")]
    [Authorize(Roles = "docente,admin")]
    public async Task<ActionResult<GradeEntryResponseDto>> UpdateCalificacion(int gradeEntryId, [FromBody] UpdateGradeEntryDto dto)
    {
        var userId = GetUserIdFromToken() ?? throw new UnauthorizedAccessException();
        var result = await _calificacionService.UpdateCalificacionAsync(gradeEntryId, dto, userId.Value);
        return Ok(result);
    }

    /// <summary>
    /// Obtener promedios de un estudiante por curso y general
    /// </summary>
    /// <param name="studentId">ID del estudiante</param>
    /// <returns>Promedios ponderados</returns>
    [HttpGet("estudiantes/{studentId}/promedios")]
    [Authorize(Roles = "docente,admin,estudiante")]
    public async Task<ActionResult<PromedioEstudianteDto>> GetPromedios(int studentId)
    {
        var userId = GetUserIdFromToken();
        var userRole = GetUserRoleFromToken();

        var result = await _calificacionService.GetPromediosEstudianteAsync(studentId, userId, userRole);
        return Ok(result);
    }

    /// <summary>
    /// Obtener acta de calificaciones de una sección
    /// </summary>
    /// <param name="sectionId">ID de la sección</param>
    /// <returns>Acta con todos los estudiantes, rubros y calificaciones</returns>
    [HttpGet("secciones/{sectionId}/acta")]
    [Authorize(Roles = "docente,admin,tesoreria")]
    public async Task<ActionResult<ActaSeccionDto>> GetActa(int sectionId)
    {
        var result = await _calificacionService.GetActaSeccionAsync(sectionId);
        return Ok(result);
    }

    /// <summary>
    /// Exportar acta de calificaciones en formato CSV
    /// </summary>
    /// <param name="sectionId">ID de la sección</param>
    /// <returns>Archivo CSV</returns>
    [HttpGet("secciones/{sectionId}/acta/csv")]
    [Authorize(Roles = "docente,admin,tesoreria")]
    public async Task<ActionResult> ExportActaCSV(int sectionId)
    {
        var acta = await _calificacionService.GetActaSeccionAsync(sectionId);

        var csv = new System.Text.StringBuilder();
        csv.AppendLine($"Acta de Calificaciones - {acta.SeccionNombre}");
        csv.AppendLine($"Curso: {acta.CursoNombre}");
        csv.AppendLine($"Año Escolar: {acta.AnioEscolar}");
        csv.AppendLine();

        // Encabezados
        var headers = "Matrícula,Nombre Completo," + string.Join(",", acta.Rubros) + ",Promedio Final";
        csv.AppendLine(headers);

        // Datos
        foreach (var estudiante in acta.Estudiantes)
        {
            var row = $"{estudiante.Matricula},{estudiante.NombreCompleto}";

            foreach (var rubro in acta.Rubros)
            {
                var calificacion = estudiante.Calificaciones.ContainsKey(rubro)
                    ? estudiante.Calificaciones[rubro]?.ToString("F2") ?? ""
                    : "";
                row += $",{calificacion}";
            }

            row += $",{estudiante.PromedioFinal:F2}";
            csv.AppendLine(row);
        }

        var bytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"Acta_Seccion_{sectionId}_{DateTime.Now:yyyyMMdd}.csv");
    }

    private int? GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst("UserId")?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private string? GetUserRoleFromToken()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value;
    }
}
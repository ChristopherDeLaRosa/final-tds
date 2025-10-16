using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using EduCore.API.DTOs;
using EduCore.API.Services;
using EduCore.API.DTOs.Student;
using EduCore.API.DTOs.StudentDTOs;
using EduCore.API.Services.Interfaces;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/estudiantes")]
[Authorize]
public class EstudiantesController : ControllerBase
{
    private readonly IEstudianteService _estudianteService;

    public EstudiantesController(IEstudianteService estudianteService)
    {
        _estudianteService = estudianteService;
    }

    /// <summary>
    /// Obtener lista de estudiantes con paginación y filtros
    /// </summary>
    /// <param name="query">Parámetros de consulta (página, límite, búsqueda, filtros)</param>
    /// <returns>Lista paginada de estudiantes</returns>
    [HttpGet]
    [Authorize(Roles = "admin,tesoreria,docente")]
    public async Task<ActionResult<PagedResultDto<StudentResponseDto>>> GetAll([FromQuery] StudentQueryDto query)
    {
        var result = await _estudianteService.GetAllAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Obtener un estudiante por ID
    /// </summary>
    /// <param name="id">ID del estudiante</param>
    /// <returns>Datos del estudiante</returns>
    [HttpGet("{id}")]
    [Authorize(Roles = "admin,tesoreria,docente,estudiante")]
    public async Task<ActionResult<StudentResponseDto>> GetById(int id)
    {
        var userId = GetUserIdFromToken();
        var userRole = GetUserRoleFromToken();

        var result = await _estudianteService.GetByIdAsync(id, userId, userRole);
        return Ok(result);
    }

    /// <summary>
    /// Crear un nuevo estudiante
    /// </summary>
    /// <param name="dto">Datos del estudiante a crear</param>
    /// <returns>Estudiante creado</returns>
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<StudentResponseDto>> Create([FromBody] CreateStudentDto dto)
    {
        var userId = GetUserIdFromToken() ?? throw new UnauthorizedAccessException();
        var result = await _estudianteService.CreateAsync(dto, userId.Value);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Actualizar un estudiante existente
    /// </summary>
    /// <param name="id">ID del estudiante</param>
    /// <param name="dto">Datos a actualizar</param>
    /// <returns>Estudiante actualizado</returns>
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<StudentResponseDto>> Update(int id, [FromBody] UpdateStudentDto dto)
    {
        var result = await _estudianteService.UpdateAsync(id, dto);
        return Ok(result);
    }

    /// <summary>
    /// Eliminar un estudiante (marca como inactivo)
    /// </summary>
    /// <param name="id">ID del estudiante</param>
    /// <returns>Confirmación de eliminación</returns>
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult> Delete(int id)
    {
        await _estudianteService.DeleteAsync(id);
        return Ok(new { message = "Estudiante marcado como inactivo exitosamente" });
    }

    /// <summary>
    /// Obtener historial académico del estudiante
    /// </summary>
    /// <param name="id">ID del estudiante</param>
    /// <returns>Historial con inscripciones, cursos y calificaciones</returns>
    [HttpGet("{id}/historial")]
    [Authorize(Roles = "admin,docente,estudiante")]
    public async Task<ActionResult<StudentHistorialDto>> GetHistorial(int id)
    {
        var userId = GetUserIdFromToken();
        var userRole = GetUserRoleFromToken();

        var result = await _estudianteService.GetHistorialAsync(id, userId, userRole);
        return Ok(result);
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
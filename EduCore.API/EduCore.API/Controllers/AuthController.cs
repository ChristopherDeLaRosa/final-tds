using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduCore.API.DTOs;
using EduCore.API.Services;
using EduCore.API.DTOs.AuthDTOs;
using EduCore.API.Services.Interfaces;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Iniciar sesión en el sistema
    /// </summary>
    /// <param name="loginDto">Credenciales de acceso</param>
    /// <returns>Token JWT y datos del usuario</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto);
        return Ok(result);
    }

    /// <summary>
    /// Cerrar sesión (invalida el token)
    /// </summary>
    /// <param name="logoutDto">Token a invalidar</param>
    /// <returns>Confirmación de cierre de sesión</returns>
    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult> Logout([FromBody] LogoutDto logoutDto)
    {
        await _authService.LogoutAsync(logoutDto.Token);
        return Ok(new { message = "Sesión cerrada exitosamente" });
    }
}
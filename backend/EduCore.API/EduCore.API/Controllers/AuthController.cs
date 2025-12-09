using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _authService.LoginAsync(loginDto);

                if (result == null)
                    return Unauthorized(new { message = "Credenciales inválidas" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante el login");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (await _authService.UserExistsAsync(registerDto.NombreUsuario))
                    return BadRequest(new { message = "El nombre de usuario ya está en uso" });

                if (await _authService.EmailExistsAsync(registerDto.Email))
                    return BadRequest(new { message = "El correo ya está registrado" });

                var result = await _authService.RegisterAsync(registerDto);

                if (result == null)
                    return BadRequest(new { message = "No se pudo registrar el usuario" });

                return CreatedAtAction(nameof(Register), new { usuario = registerDto.NombreUsuario }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante el registro");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("check-username/{nombreUsuario}")]
        [AllowAnonymous]
        public async Task<ActionResult<bool>> CheckUsername(string nombreUsuario)
        {
            try
            {
                var exists = await _authService.UserExistsAsync(nombreUsuario);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar nombre de usuario");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("check-email/{email}")]
        [AllowAnonymous]
        public async Task<ActionResult<bool>> CheckEmail(string email)
        {
            try
            {
                var exists = await _authService.EmailExistsAsync(email);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar email");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            return Ok(new { message = "Logout exitoso" });
        }

        [HttpGet("verify")]
        [Authorize]
        public IActionResult VerifyToken()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userName = User.FindFirst(ClaimTypes.Name)?.Value;
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                return Ok(new
                {
                    userId,
                    userName,
                    userEmail,
                    userRole,
                    message = "Token válido"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar token");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                var result = await _authService.ChangePasswordAsync(userId, dto);

                if (!result)
                    return BadRequest(new { message = "La contraseña actual es incorrecta" });

                return Ok(new { message = "Contraseña actualizada correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cambiar contraseña");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}

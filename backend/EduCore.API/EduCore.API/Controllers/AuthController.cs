using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        /// <summary>
        /// Login de usuario
        /// </summary>
        /// <param name="loginDto">Credenciales de acceso</param>
        /// <returns>Token JWT y datos del usuario</returns>
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
                {
                    _logger.LogWarning("Intento de login fallido para usuario: {Usuario}", loginDto.NombreUsuario);
                    return Unauthorized(new { message = "Credenciales inválidas" });
                }

                _logger.LogInformation("Login exitoso para usuario: {Usuario}", loginDto.NombreUsuario);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante el login para usuario: {Usuario}", loginDto.NombreUsuario);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Registro de nuevo usuario
        /// </summary>
        /// <param name="registerDto">Datos del nuevo usuario</param>
        /// <returns>Token JWT y datos del usuario registrado</returns>
        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Verificar si el usuario ya existe
                if (await _authService.UserExistsAsync(registerDto.NombreUsuario))
                {
                    return BadRequest(new { message = "El nombre de usuario ya está en uso" });
                }

                // Verificar si el email ya existe
                if (await _authService.EmailExistsAsync(registerDto.Email))
                {
                    return BadRequest(new { message = "El email ya está registrado" });
                }

                var result = await _authService.RegisterAsync(registerDto);

                if (result == null)
                {
                    return BadRequest(new { message = "Error al registrar el usuario. Verifique los datos proporcionados" });
                }

                _logger.LogInformation("Usuario registrado exitosamente: {Usuario}", registerDto.NombreUsuario);
                return CreatedAtAction(nameof(Register), new { id = registerDto.NombreUsuario }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante el registro de usuario: {Usuario}", registerDto.NombreUsuario);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Verificar si un nombre de usuario existe
        /// </summary>
        /// <param name="nombreUsuario">Nombre de usuario a verificar</param>
        /// <returns>True si existe, False si no existe</returns>
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
                _logger.LogError(ex, "Error al verificar nombre de usuario: {Usuario}", nombreUsuario);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Verificar si un email existe
        /// </summary>
        /// <param name="email">Email a verificar</param>
        /// <returns>True si existe, False si no existe</returns>
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
                _logger.LogError(ex, "Error al verificar email: {Email}", email);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Logout (en implementaciones con blacklist de tokens)
        /// </summary>
        /// <returns>Mensaje de confirmación</returns>
        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            // en una implementación real, aqui se podria agregar el token a una blacklist
            // Por ahora, el logout se maneja en el cliente eliminando el token
            _logger.LogInformation("Logout exitoso para usuario: {Usuario}", User.Identity?.Name);
            return Ok(new { message = "Logout exitoso" });
        }

        /// <summary>
        /// Verificar si el token es válido
        /// </summary>
        /// <returns>Datos del usuario autenticado</returns>
        [HttpGet("verify")]
        [Authorize]
        public IActionResult VerifyToken()
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var userName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
                var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
                var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

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
    }
}
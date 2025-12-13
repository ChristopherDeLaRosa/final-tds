using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using EduCore.API.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EduCore.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly EduCoreDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            EduCoreDbContext context,
            IOptions<JwtSettings> jwtSettings,
            IEmailService emailService,
            ILogger<AuthService> logger)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.NombreUsuario == loginDto.NombreUsuario && u.Activo);

            if (usuario == null)
                return null;

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, usuario.PasswordHash))
                return null;

            usuario.UltimoAcceso = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // ✅ MEJORA: Si el usuario es docente pero no tiene DocenteId, intentar encontrarlo por email
            if (usuario.Rol == "Docente" && !usuario.DocenteId.HasValue)
            {
                var docente = await _context.Docentes
                    .FirstOrDefaultAsync(d => d.Email == usuario.Email && d.Activo);

                if (docente != null)
                {
                    // Actualizar el DocenteId en el usuario
                    usuario.DocenteId = docente.Id;
                    await _context.SaveChangesAsync();

                    _logger.LogInformation(
                        "DocenteId asignado automáticamente al usuario {Usuario}: DocenteId={DocenteId}",
                        usuario.NombreUsuario,
                        docente.Id
                    );
                }
                else
                {
                    _logger.LogWarning(
                        "Usuario docente {Usuario} sin registro en tabla Docentes (Email: {Email})",
                        usuario.NombreUsuario,
                        usuario.Email
                    );
                }
            }

            var token = GenerateJwtToken(usuario);
            var expiracion = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes);

            return new AuthResponseDto
            {
                Token = token,
                NombreUsuario = usuario.NombreUsuario,
                Email = usuario.Email,
                Rol = usuario.Rol,
                Expiracion = expiracion
            };
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
        {
            if (await UserExistsAsync(registerDto.NombreUsuario))
                return null;

            if (await EmailExistsAsync(registerDto.Email))
                return null;

            if (registerDto.Rol == "Estudiante" && registerDto.EstudianteId.HasValue)
            {
                var estudianteExists = await _context.Estudiantes
                    .AnyAsync(e => e.Id == registerDto.EstudianteId.Value);
                if (!estudianteExists)
                    return null;
            }

            if (registerDto.Rol == "Docente" && registerDto.DocenteId.HasValue)
            {
                var docenteExists = await _context.Docentes
                    .AnyAsync(d => d.Id == registerDto.DocenteId.Value);
                if (!docenteExists)
                    return null;
            }

            // ✅ MEJORA: Si es docente y no se proporcionó DocenteId, buscarlo por email
            int? docenteId = registerDto.DocenteId;
            if (registerDto.Rol == "Docente" && !docenteId.HasValue)
            {
                var docente = await _context.Docentes
                    .FirstOrDefaultAsync(d => d.Email == registerDto.Email && d.Activo);

                if (docente != null)
                {
                    docenteId = docente.Id;
                    _logger.LogInformation(
                        "DocenteId encontrado automáticamente por email para {Usuario}: DocenteId={DocenteId}",
                        registerDto.NombreUsuario,
                        docente.Id
                    );
                }
            }

            string passwordTemporal = Guid.NewGuid().ToString("N")[..8];

            var usuario = new Usuario
            {
                NombreUsuario = registerDto.NombreUsuario,
                Email = registerDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordTemporal),
                Rol = registerDto.Rol,
                EstudianteId = registerDto.EstudianteId,
                DocenteId = docenteId, //Usar el valor encontrado o proporcionado
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var emailBody = $@"
                <h2>Bienvenido al Sistema Zirak</h2>
                <p>Hola <strong>{usuario.NombreUsuario}</strong>, tu cuenta ha sido creada.</p>

                <p><strong>Credenciales de acceso:</strong></p>
                <ul>
                    <li><strong>Usuario:</strong> {usuario.NombreUsuario}</li>
                    <li><strong>Contraseña temporal:</strong> {passwordTemporal}</li>
                </ul>

                <p>Debes cambiar esta contraseña al iniciar sesión.</p>
                <p>Accede aquí: <a href='https://tusistema.com/login'>Iniciar sesión</a></p>
            ";

            await _emailService.SendEmailAsync(
                usuario.Email,
                "Credenciales de acceso - Zirak",
                emailBody
            );

            var token = GenerateJwtToken(usuario);
            var expiracion = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes);

            return new AuthResponseDto
            {
                Token = token,
                NombreUsuario = usuario.NombreUsuario,
                Email = usuario.Email,
                Rol = usuario.Rol,
                Expiracion = expiracion
            };
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            var user = await _context.Usuarios.FindAsync(userId);

            if (user == null)
                return false;

            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.PasswordHash))
                return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UserExistsAsync(string nombreUsuario)
        {
            return await _context.Usuarios.AnyAsync(u => u.NombreUsuario == nombreUsuario);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Usuarios.AnyAsync(u => u.Email == email);
        }

        private string GenerateJwtToken(Usuario usuario)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.NombreUsuario),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim(ClaimTypes.Role, usuario.Rol),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Agregar EstudianteId si existe
            if (usuario.EstudianteId.HasValue)
                claims.Add(new Claim("EstudianteId", usuario.EstudianteId.Value.ToString()));

            // Agregar DocenteId si existe (CRÍTICO para filtrar grupos)
            if (usuario.DocenteId.HasValue)
                claims.Add(new Claim("DocenteId", usuario.DocenteId.Value.ToString()));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
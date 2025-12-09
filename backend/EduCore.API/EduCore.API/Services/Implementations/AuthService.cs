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

        public AuthService(EduCoreDbContext context, IOptions<JwtSettings> jwtSettings, IEmailService emailService)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _emailService = emailService;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.NombreUsuario == loginDto.NombreUsuario && u.Activo);

            if (usuario == null)
                return null;

            // Verificar contraseña
            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, usuario.PasswordHash))
                return null;

            // actualizar último acceso
            usuario.UltimoAcceso = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Generar token
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
            // verificar si el usuario ya existe
            if (await UserExistsAsync(registerDto.NombreUsuario))
                return null;

            if (await EmailExistsAsync(registerDto.Email))
                return null;

            // Validar referencia a estudiante o docente segun el rol
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

            // Crear usuario
            var usuario = new Usuario
            {
                NombreUsuario = registerDto.NombreUsuario,
                Email = registerDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Rol = registerDto.Rol,
                EstudianteId = registerDto.EstudianteId,
                DocenteId = registerDto.DocenteId,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            // --- AQUÍ SE ENVÍA EL CORREO (ANTES DEL RETURN) ---

            var passwordTemporal = registerDto.Password;

            var emailBody = $@"
                <h2>Bienvenido al Sistema EduCore</h2>
                <p>Hola <strong>{usuario.NombreUsuario}</strong>, tu cuenta ha sido creada.</p>

                <p><strong>Credenciales de acceso:</strong></p>
                <ul>
                    <li><strong>Usuario:</strong> {usuario.NombreUsuario}</li>
                    <li><strong>Contraseña temporal:</strong> {passwordTemporal}</li>
                </ul>

                <p>Por seguridad, debes cambiar tu contraseña al iniciar sesión.</p>
                <p>Accede aquí: <a href='https://tusistema.com/login'>Iniciar sesión</a></p>

                <p>Saludos,<br/>Equipo EduCore</p>
    ";

            await _emailService.SendEmailAsync(
                usuario.Email,
                "Credenciales de acceso - EduCore",
                emailBody
            );

            // Generar token
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

            // Agregar claim adicional si es Estudiante o Docente
            if (usuario.EstudianteId.HasValue)
                claims.Add(new Claim("EstudianteId", usuario.EstudianteId.Value.ToString()));

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
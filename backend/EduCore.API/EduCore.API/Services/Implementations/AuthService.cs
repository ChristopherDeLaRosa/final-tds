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

        public AuthService(EduCoreDbContext context, IOptions<JwtSettings> jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
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
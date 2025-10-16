using EduCore.API.Data;
using EduCore.API.DTOs.AuthDTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace EduCore.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly EduCoreDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ITokenBlacklistService _tokenBlacklist;

        public AuthService(EduCoreDbContext context, IConfiguration configuration, ITokenBlacklistService tokenBlacklist)
        {
            _context = context;
            _configuration = configuration;
            _tokenBlacklist = tokenBlacklist;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email && u.Activo);

            if (user == null || !VerifyPasswordHash(loginDto.Password, user.PasswordHash))
            {
                throw new UnauthorizedException("Credenciales inválidas");
            }

            var token = GenerateJwtToken(user);
            var expiresAt = DateTime.UtcNow.AddHours(8);

            return new LoginResponseDto
            {
                Token = token,
                Rol = user.Rol,
                UserId = user.Id,
                Nombre = user.Nombre,
                ExpiresAt = expiresAt
            };
        }

        public async Task LogoutAsync(string token)
        {
            _tokenBlacklist.AddToBlacklist(token);
            await Task.CompletedTask;
        }

        private string GenerateJwtToken(Models.User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured"));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                new Claim("UserId", user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Nombre),
                new Claim(ClaimTypes.Role, user.Rol)
            }),
                Expires = DateTime.UtcNow.AddHours(8),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private static bool VerifyPasswordHash(string password, string storedHash)
        {
            // En producción, usar BCrypt o similar
            // Por simplicidad, usamos SHA256
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            var hash = Convert.ToBase64String(hashedBytes);
            return hash == storedHash;
        }

        public static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}

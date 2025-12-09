using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto);
        Task<bool> UserExistsAsync(string nombreUsuario);
        Task<bool> EmailExistsAsync(string email);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto);

    }
}
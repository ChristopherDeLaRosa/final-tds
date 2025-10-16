using EduCore.API.DTOs.AuthDTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginDto loginDto);
        Task LogoutAsync(string token);
    }
}

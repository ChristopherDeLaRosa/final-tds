namespace EduCore.API.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
        public DateTime Expiracion { get; set; }
    }

    public class ChangePasswordDto
    {
        public string? OldPassword { get; set; }
        public string? NewPassword { get; set; }
    }

}
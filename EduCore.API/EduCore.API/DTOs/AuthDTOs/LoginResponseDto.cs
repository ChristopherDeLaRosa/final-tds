namespace EduCore.API.DTOs.AuthDTOs
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}

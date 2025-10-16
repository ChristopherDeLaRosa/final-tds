using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs.AuthDTOs
{
    public class LogoutDto
    {
        [Required(ErrorMessage = "El token es requerido")]
        public string Token { get; set; } = string.Empty;
    }
}

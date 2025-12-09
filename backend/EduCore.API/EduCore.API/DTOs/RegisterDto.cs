using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "El nombre de usuario es requerido")]
        [MinLength(4, ErrorMessage = "El nombre de usuario debe tener al menos 4 caracteres")]
        [MaxLength(100, ErrorMessage = "El nombre de usuario no puede exceder 100 caracteres")]
        public string NombreUsuario { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        [MaxLength(150, ErrorMessage = "El email no puede exceder 150 caracteres")]
        public string Email { get; set; } = string.Empty;

        public string? Password { get; set; } = null;

        [Required(ErrorMessage = "El rol es requerido")]
        [RegularExpression("^(Admin|Docente|Estudiante)$", ErrorMessage = "Rol inválido")]
        public string Rol { get; set; } = string.Empty;

        public int? EstudianteId { get; set; }
        public int? DocenteId { get; set; }
    }
}

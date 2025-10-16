using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs.Student
{
    public class UpdateStudentDto
    {
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string? Nombre { get; set; }

        [StringLength(100, ErrorMessage = "El apellido no puede exceder 100 caracteres")]
        public string? Apellido { get; set; }

        public DateTime? FechaNacimiento { get; set; }

        [Range(1, 6, ErrorMessage = "El grado debe estar entre 1 y 6")]
        public int? Grado { get; set; }

        [RegularExpression("^[A-F]$", ErrorMessage = "La sección debe ser una letra entre A y F")]
        public string? Seccion { get; set; }

        [StringLength(250, ErrorMessage = "La dirección no puede exceder 250 caracteres")]
        public string? Direccion { get; set; }

        [Phone(ErrorMessage = "El teléfono no tiene un formato válido")]
        [StringLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
        public string? Telefono { get; set; }

        [EmailAddress(ErrorMessage = "El email no tiene un formato válido")]
        [StringLength(100, ErrorMessage = "El email no puede exceder 100 caracteres")]
        public string? Email { get; set; }

        [RegularExpression("^(activo|inactivo)$", ErrorMessage = "El estado debe ser 'activo' o 'inactivo'")]
        public string? Estado { get; set; }
    }
}

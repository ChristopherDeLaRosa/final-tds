using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs.Student
{
    public class CreateStudentDto
    {
        [Required(ErrorMessage = "La matrícula es requerida")]
        [StringLength(50, ErrorMessage = "La matrícula no puede exceder 50 caracteres")]
        public string Matricula { get; set; } = string.Empty;

        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El apellido es requerido")]
        [StringLength(100, ErrorMessage = "El apellido no puede exceder 100 caracteres")]
        public string Apellido { get; set; } = string.Empty;

        [Required(ErrorMessage = "La fecha de nacimiento es requerida")]
        public DateTime FechaNacimiento { get; set; }

        [Required(ErrorMessage = "El grado es requerido")]
        [Range(1, 6, ErrorMessage = "El grado debe estar entre 1 y 6")]
        public int Grado { get; set; }

        [Required(ErrorMessage = "La sección es requerida")]
        [RegularExpression("^[A-F]$", ErrorMessage = "La sección debe ser una letra entre A y F")]
        public string Seccion { get; set; } = string.Empty;

        [StringLength(250, ErrorMessage = "La dirección no puede exceder 250 caracteres")]
        public string? Direccion { get; set; }

        [Phone(ErrorMessage = "El teléfono no tiene un formato válido")]
        [StringLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
        public string? Telefono { get; set; }

        [EmailAddress(ErrorMessage = "El email no tiene un formato válido")]
        [StringLength(100, ErrorMessage = "El email no puede exceder 100 caracteres")]
        public string? Email { get; set; }
    }
}

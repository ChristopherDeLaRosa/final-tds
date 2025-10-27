using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class DocenteDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombres { get; set; } = string.Empty;
        public string Apellidos { get; set; } = string.Empty;
        public string NombreCompleto => $"{Nombres} {Apellidos}";
        public string Email { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public string? Especialidad { get; set; }
        public DateTime FechaContratacion { get; set; }
        public bool Activo { get; set; }
    }

    public class CreateDocenteDto
    {
        [Required(ErrorMessage = "El código es requerido")]
        [MaxLength(20, ErrorMessage = "El código no puede exceder 20 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los nombres son requeridos")]
        [MaxLength(100, ErrorMessage = "Los nombres no pueden exceder 100 caracteres")]
        public string Nombres { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los apellidos son requeridos")]
        [MaxLength(100, ErrorMessage = "Los apellidos no pueden exceder 100 caracteres")]
        public string Apellidos { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        [MaxLength(150, ErrorMessage = "El email no puede exceder 150 caracteres")]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
        public string? Telefono { get; set; }

        [MaxLength(100, ErrorMessage = "La especialidad no puede exceder 100 caracteres")]
        public string? Especialidad { get; set; }
    }

    public class UpdateDocenteDto
    {
        [Required(ErrorMessage = "Los nombres son requeridos")]
        [MaxLength(100, ErrorMessage = "Los nombres no pueden exceder 100 caracteres")]
        public string Nombres { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los apellidos son requeridos")]
        [MaxLength(100, ErrorMessage = "Los apellidos no pueden exceder 100 caracteres")]
        public string Apellidos { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        [MaxLength(150, ErrorMessage = "El email no puede exceder 150 caracteres")]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
        public string? Telefono { get; set; }

        [MaxLength(100, ErrorMessage = "La especialidad no puede exceder 100 caracteres")]
        public string? Especialidad { get; set; }

        public bool Activo { get; set; } = true;
    }

    public class DocenteCargaAcademicaDto
    {
        public int DocenteId { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string? Especialidad { get; set; }
        public List<SeccionDocenteDto> Secciones { get; set; } = new List<SeccionDocenteDto>();
        public int TotalHorasSemana { get; set; }
        public int TotalSecciones { get; set; }
    }

    public class SeccionDocenteDto
    {
        public int SeccionId { get; set; }
        public string CodigoSeccion { get; set; } = string.Empty;
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public string? Aula { get; set; }
        public string? Horario { get; set; }
        public int Inscritos { get; set; }
        public int Capacidad { get; set; }
    }
}
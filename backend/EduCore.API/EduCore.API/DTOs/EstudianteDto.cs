using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class EstudianteDto
    {
        public int Id { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string Nombres { get; set; } = string.Empty;
        public string Apellidos { get; set; } = string.Empty;
        public string NombreCompleto => $"{Nombres} {Apellidos}";
        public string Email { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public string? Direccion { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public DateTime FechaIngreso { get; set; }
        public bool Activo { get; set; }
    }

    public class CreateEstudianteDto
    {
        [Required(ErrorMessage = "La matrícula es requerida")]
        [MaxLength(20, ErrorMessage = "La matrícula no puede exceder 20 caracteres")]
        public string Matricula { get; set; } = string.Empty;

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

        [MaxLength(200, ErrorMessage = "La dirección no puede exceder 200 caracteres")]
        public string? Direccion { get; set; }

        [Required(ErrorMessage = "La fecha de nacimiento es requerida")]
        public DateTime FechaNacimiento { get; set; }
    }

    public class UpdateEstudianteDto
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

        [MaxLength(200, ErrorMessage = "La dirección no puede exceder 200 caracteres")]
        public string? Direccion { get; set; }

        [Required(ErrorMessage = "La fecha de nacimiento es requerida")]
        public DateTime FechaNacimiento { get; set; }

        public bool Activo { get; set; } = true;
    }

    public class EstudianteHistorialDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public List<HistorialCursoDto> Cursos { get; set; } = new List<HistorialCursoDto>();
        public decimal PromedioGeneral { get; set; }
        public int TotalCursosAprobados { get; set; }
        public int TotalCursosReprobados { get; set; }
    }

    public class HistorialCursoDto
    {
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public string Docente { get; set; } = string.Empty;
        public decimal? PromedioFinal { get; set; }
        public string Estado { get; set; } = string.Empty;
        public decimal? PorcentajeAsistencia { get; set; }
    }
}
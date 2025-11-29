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
        public int Edad => DateTime.Today.Year - FechaNacimiento.Year -
            (DateTime.Today.DayOfYear < FechaNacimiento.DayOfYear ? 1 : 0);
        public DateTime FechaIngreso { get; set; }
        public int GradoActual { get; set; }
        public string SeccionActual { get; set; } = string.Empty;
        public string GradoSeccion => $"{GradoActual}° {SeccionActual}";
        public string? NombreTutor { get; set; }
        public string? TelefonoTutor { get; set; }
        public string? EmailTutor { get; set; }
        public string? ObservacionesMedicas { get; set; }
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

        [Required(ErrorMessage = "El grado actual es requerido")]
        [Range(1, 12, ErrorMessage = "El grado debe estar entre 1 y 12")]
        public int GradoActual { get; set; }

        [Required(ErrorMessage = "La sección actual es requerida")]
        [MaxLength(10, ErrorMessage = "La sección no puede exceder 10 caracteres")]
        public string SeccionActual { get; set; } = string.Empty;

        [MaxLength(100, ErrorMessage = "El nombre del tutor no puede exceder 100 caracteres")]
        public string? NombreTutor { get; set; }

        [MaxLength(20, ErrorMessage = "El teléfono del tutor no puede exceder 20 caracteres")]
        public string? TelefonoTutor { get; set; }

        [EmailAddress(ErrorMessage = "Email del tutor inválido")]
        [MaxLength(150, ErrorMessage = "El email del tutor no puede exceder 150 caracteres")]
        public string? EmailTutor { get; set; }

        [MaxLength(500, ErrorMessage = "Las observaciones médicas no pueden exceder 500 caracteres")]
        public string? ObservacionesMedicas { get; set; }

        public int? AulaId { get; set; }
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

        [Required(ErrorMessage = "El grado actual es requerido")]
        [Range(1, 12, ErrorMessage = "El grado debe estar entre 1 y 12")]
        public int GradoActual { get; set; }

        [Required(ErrorMessage = "La sección actual es requerida")]
        [MaxLength(10, ErrorMessage = "La sección no puede exceder 10 caracteres")]
        public string SeccionActual { get; set; } = string.Empty;

        [MaxLength(100, ErrorMessage = "El nombre del tutor no puede exceder 100 caracteres")]
        public string? NombreTutor { get; set; }

        [MaxLength(20, ErrorMessage = "El teléfono del tutor no puede exceder 20 caracteres")]
        public string? TelefonoTutor { get; set; }

        [EmailAddress(ErrorMessage = "Email del tutor inválido")]
        [MaxLength(150, ErrorMessage = "El email del tutor no puede exceder 150 caracteres")]
        public string? EmailTutor { get; set; }

        [MaxLength(500, ErrorMessage = "Las observaciones médicas no pueden exceder 500 caracteres")]
        public string? ObservacionesMedicas { get; set; }

        public bool Activo { get; set; } = true;
        public int? AulaId { get; set; }
    }

    public class EstudianteHistorialDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public int GradoActual { get; set; }
        public string SeccionActual { get; set; } = string.Empty;
        public List<HistorialGrupoDto> Grupos { get; set; } = new List<HistorialGrupoDto>();
        public decimal PromedioGeneral { get; set; }
        public int TotalMateriasAprobadas { get; set; }
        public int TotalMateriasReprobadas { get; set; }
        public decimal PorcentajeAsistenciaGeneral { get; set; }
    }

    public class HistorialGrupoDto
    {
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string AreaConocimiento { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public string Docente { get; set; } = string.Empty;
        public decimal? PromedioFinal { get; set; }
        public string Estado { get; set; } = string.Empty;
        public decimal? PorcentajeAsistencia { get; set; }
    }

    // DTO para listar estudiantes por grado y sección
    public class EstudiantesPorGradoDto
    {
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public int TotalEstudiantes { get; set; }
        public List<EstudianteDto> Estudiantes { get; set; } = new List<EstudianteDto>();
    }
}
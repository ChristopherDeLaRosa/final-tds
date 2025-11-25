using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class AsistenciaDto
    {
        public int Id { get; set; }
        public int SesionId { get; set; }
        public DateTime FechaSesion { get; set; }
        public string TemaSesion { get; set; } = string.Empty;
        public int EstudianteId { get; set; }
        public string MatriculaEstudiante { get; set; } = string.Empty;
        public string NombreEstudiante { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
        public DateTime FechaRegistro { get; set; }
        public bool NotificacionEnviada { get; set; }
    }

    public class CreateAsistenciaDto
    {
        [Required(ErrorMessage = "La sesión es requerida")]
        public int SesionId { get; set; }

        [Required(ErrorMessage = "El estudiante es requerido")]
        public int EstudianteId { get; set; }

        [Required(ErrorMessage = "El estado es requerido")]
        [MaxLength(20, ErrorMessage = "El estado no puede exceder 20 caracteres")]
        public string Estado { get; set; } = "Presente"; // Presente, Ausente, Tardanza, Justificado

        [MaxLength(300, ErrorMessage = "Las observaciones no pueden exceder 300 caracteres")]
        public string? Observaciones { get; set; }
    }

    public class UpdateAsistenciaDto
    {
        [Required(ErrorMessage = "El estado es requerido")]
        [MaxLength(20, ErrorMessage = "El estado no puede exceder 20 caracteres")]
        public string Estado { get; set; } = string.Empty;

        [MaxLength(300, ErrorMessage = "Las observaciones no pueden exceder 300 caracteres")]
        public string? Observaciones { get; set; }
    }

    // Para registrar asistencia de toda la clase
    public class RegistrarAsistenciaGrupoDto
    {
        [Required(ErrorMessage = "La sesión es requerida")]
        public int SesionId { get; set; }

        [Required(ErrorMessage = "Las asistencias son requeridas")]
        public List<AsistenciaEstudianteDto> Asistencias { get; set; } = new();
    }

    public class AsistenciaEstudianteDto
    {
        [Required]
        public int EstudianteId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Estado { get; set; } = "Presente";

        [MaxLength(300)]
        public string? Observaciones { get; set; }
    }

    // Para reportes de asistencia
    public class ReporteAsistenciaEstudianteDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public int GradoActual { get; set; }
        public string SeccionActual { get; set; } = string.Empty;
        public int TotalSesiones { get; set; }
        public int Presentes { get; set; }
        public int Ausentes { get; set; }
        public int Tardanzas { get; set; }
        public int Justificados { get; set; }
        public decimal PorcentajeAsistencia { get; set; }
    }

    public class ReporteAsistenciaGrupoCursoDto
    {
        public int GrupoCursoId { get; set; }
        public string CodigoGrupo { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public int TotalSesiones { get; set; }
        public decimal PorcentajeAsistenciaPromedio { get; set; }
        public List<AsistenciaEstudianteResumenDto> Estudiantes { get; set; } = new();
    }

    public class AsistenciaEstudianteResumenDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public int Presentes { get; set; }
        public int Ausentes { get; set; }
        public int Tardanzas { get; set; }
        public decimal PorcentajeAsistencia { get; set; }
    }
}
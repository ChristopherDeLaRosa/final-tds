using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    // DTOs para Sesiones
    public class SesionDto
    {
        public int Id { get; set; }
        public int SeccionId { get; set; }
        public string CodigoSeccion { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public string? Tema { get; set; }
        public string? Observaciones { get; set; }
        public bool Realizada { get; set; }
    }

    public class CreateSesionDto
    {
        [Required(ErrorMessage = "La sección es requerida")]
        public int SeccionId { get; set; }

        [Required(ErrorMessage = "La fecha es requerida")]
        public DateTime Fecha { get; set; }

        [Required(ErrorMessage = "La hora de inicio es requerida")]
        public TimeSpan HoraInicio { get; set; }

        [Required(ErrorMessage = "La hora de fin es requerida")]
        public TimeSpan HoraFin { get; set; }

        [MaxLength(100, ErrorMessage = "El tema no puede exceder 100 caracteres")]
        public string? Tema { get; set; }

        [MaxLength(500, ErrorMessage = "Las observaciones no pueden exceder 500 caracteres")]
        public string? Observaciones { get; set; }
    }

    public class UpdateSesionDto
    {
        [Required(ErrorMessage = "La fecha es requerida")]
        public DateTime Fecha { get; set; }

        [Required(ErrorMessage = "La hora de inicio es requerida")]
        public TimeSpan HoraInicio { get; set; }

        [Required(ErrorMessage = "La hora de fin es requerida")]
        public TimeSpan HoraFin { get; set; }

        [MaxLength(100, ErrorMessage = "El tema no puede exceder 100 caracteres")]
        public string? Tema { get; set; }

        [MaxLength(500, ErrorMessage = "Las observaciones no pueden exceder 500 caracteres")]
        public string? Observaciones { get; set; }

        public bool Realizada { get; set; }
    }

    // DTOs para Asistencia
    public class AsistenciaDto
    {
        public int Id { get; set; }
        public int SesionId { get; set; }
        public DateTime FechaSesion { get; set; }
        public string TemaClase { get; set; } = string.Empty;
        public int EstudianteId { get; set; }
        public string MatriculaEstudiante { get; set; } = string.Empty;
        public string NombreEstudiante { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
        public DateTime FechaRegistro { get; set; }
    }

    public class CreateAsistenciaDto
    {
        [Required(ErrorMessage = "La sesión es requerida")]
        public int SesionId { get; set; }

        [Required(ErrorMessage = "El estudiante es requerido")]
        public int EstudianteId { get; set; }

        [Required(ErrorMessage = "El estado es requerido")]
        [RegularExpression("^(Presente|Ausente|Tardanza|Justificado)$", ErrorMessage = "Estado inválido")]
        public string Estado { get; set; } = "Presente";

        [MaxLength(300, ErrorMessage = "Las observaciones no pueden exceder 300 caracteres")]
        public string? Observaciones { get; set; }
    }

    public class UpdateAsistenciaDto
    {
        [Required(ErrorMessage = "El estado es requerido")]
        [RegularExpression("^(Presente|Ausente|Tardanza|Justificado)$", ErrorMessage = "Estado inválido")]
        public string Estado { get; set; } = "Presente";

        [MaxLength(300, ErrorMessage = "Las observaciones no pueden exceder 300 caracteres")]
        public string? Observaciones { get; set; }
    }

    public class RegistroAsistenciaSesionDto
    {
        [Required(ErrorMessage = "Las asistencias son requeridas")]
        public List<AsistenciaRegistroDto> Asistencias { get; set; } = new List<AsistenciaRegistroDto>();
    }

    public class AsistenciaRegistroDto
    {
        [Required(ErrorMessage = "El estudiante es requerido")]
        public int EstudianteId { get; set; }

        [Required(ErrorMessage = "El estado es requerido")]
        [RegularExpression("^(Presente|Ausente|Tardanza|Justificado)$", ErrorMessage = "Estado inválido")]
        public string Estado { get; set; } = "Presente";

        public string? Observaciones { get; set; }
    }

    // DTOs para reportes de asistencia
    public class ResumenAsistenciaSeccionDto
    {
        public int SeccionId { get; set; }
        public string CodigoSeccion { get; set; } = string.Empty;
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public int TotalSesiones { get; set; }
        public int SesionesRealizadas { get; set; }
        public List<EstudianteAsistenciaDto> Estudiantes { get; set; } = new List<EstudianteAsistenciaDto>();
    }

    public class EstudianteAsistenciaDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public int TotalPresente { get; set; }
        public int TotalAusente { get; set; }
        public int TotalTardanza { get; set; }
        public int TotalJustificado { get; set; }
        public decimal PorcentajeAsistencia { get; set; }
        public string EstadoAsistencia { get; set; } = string.Empty; // Excelente (>=90), Bueno (>=75), Regular (>=60), Bajo (<60)
    }

    public class ResumenAsistenciaEstudianteDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public List<SeccionAsistenciaDto> Secciones { get; set; } = new List<SeccionAsistenciaDto>();
        public decimal PromedioAsistenciaGeneral { get; set; }
    }

    public class SeccionAsistenciaDto
    {
        public int SeccionId { get; set; }
        public string CodigoSeccion { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public int TotalSesiones { get; set; }
        public int TotalPresente { get; set; }
        public int TotalAusente { get; set; }
        public int TotalTardanza { get; set; }
        public int TotalJustificado { get; set; }
        public decimal PorcentajeAsistencia { get; set; }
    }

    public class ListaAsistenciaSesionDto
    {
        public int SesionId { get; set; }
        public int SeccionId { get; set; }
        public string CodigoSeccion { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public string? Tema { get; set; }
        public List<AsistenciaEstudianteDto> Asistencias { get; set; } = new List<AsistenciaEstudianteDto>();
    }

    public class AsistenciaEstudianteDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
    }
}
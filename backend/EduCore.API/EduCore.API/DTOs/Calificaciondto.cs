using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class CalificacionDto
    {
        public int Id { get; set; }
        public int EstudianteId { get; set; }
        public string MatriculaEstudiante { get; set; } = string.Empty;
        public string NombreEstudiante { get; set; } = string.Empty;
        public int RubroId { get; set; }
        public string NombreRubro { get; set; } = string.Empty;
        public decimal PorcentajeRubro { get; set; }
        public int GrupoCursoId { get; set; }
        public string NombreCurso { get; set; } = string.Empty;
        public decimal Nota { get; set; }
        public string? Observaciones { get; set; }
        public DateTime FechaRegistro { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public bool Recuperacion { get; set; }
    }

    public class CreateCalificacionDto
    {
        [Required(ErrorMessage = "El estudiante es requerido")]
        public int EstudianteId { get; set; }

        [Required(ErrorMessage = "El rubro es requerido")]
        public int RubroId { get; set; }

        [Required(ErrorMessage = "La nota es requerida")]
        [Range(0, 100, ErrorMessage = "La nota debe estar entre 0 y 100")]
        public decimal Nota { get; set; }

        [MaxLength(500, ErrorMessage = "Las observaciones no pueden exceder 500 caracteres")]
        public string? Observaciones { get; set; }

        public bool Recuperacion { get; set; } = false;
    }

    public class UpdateCalificacionDto
    {
        [Required(ErrorMessage = "La nota es requerida")]
        [Range(0, 100, ErrorMessage = "La nota debe estar entre 0 y 100")]
        public decimal Nota { get; set; }

        [MaxLength(500, ErrorMessage = "Las observaciones no pueden exceder 500 caracteres")]
        public string? Observaciones { get; set; }
    }

    // Para registrar calificaciones de varios estudiantes a la vez
    public class RegistrarCalificacionesGrupoDto
    {
        [Required(ErrorMessage = "El rubro es requerido")]
        public int RubroId { get; set; }

        [Required(ErrorMessage = "Las calificaciones son requeridas")]
        public List<CalificacionEstudianteDto> Calificaciones { get; set; } = new();
    }

    public class CalificacionEstudianteDto
    {
        [Required]
        public int EstudianteId { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal Nota { get; set; }

        [MaxLength(500)]
        public string? Observaciones { get; set; }
    }

    // Para ver el boletín de un estudiante
    public class BoletinEstudianteDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public int GradoActual { get; set; }
        public string SeccionActual { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public List<CalificacionGrupoCursoDto> GruposCursos { get; set; } = new();
        public decimal PromedioGeneral { get; set; }
        public int TotalMateriasAprobadas { get; set; }
        public int TotalMateriasReprobadas { get; set; }
        public decimal PorcentajeAsistencia { get; set; }
    }

    public class CalificacionGrupoCursoDto
    {
        public int GrupoCursoId { get; set; }
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string AreaConocimiento { get; set; } = string.Empty;
        public string Docente { get; set; } = string.Empty;
        public List<CalificacionRubroDto> Rubros { get; set; } = new();
        public decimal? PromedioFinal { get; set; }
        public string Estado { get; set; } = string.Empty; // Aprobado/Reprobado
    }

    public class CalificacionRubroDto
    {
        public int RubroId { get; set; }
        public string NombreRubro { get; set; } = string.Empty;
        public decimal PorcentajeRubro { get; set; }
        public decimal? Nota { get; set; }
        public decimal? NotaPonderada { get; set; }
        public bool Recuperacion { get; set; }
        public string? Observaciones { get; set; }
    }

    // Para ver las calificaciones de un grupo completo
    public class CalificacionesGrupoCursoDto
    {
        public int GrupoCursoId { get; set; }
        public string CodigoGrupo { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public List<RubroResumenDto> Rubros { get; set; } = new();
        public List<EstudianteCalificacionesDto> Estudiantes { get; set; } = new();
        public decimal PromedioGrupo { get; set; }
    }

    public class RubroResumenDto
    {
        public int RubroId { get; set; }
        public string NombreRubro { get; set; } = string.Empty;
        public decimal Porcentaje { get; set; }
        public int Orden { get; set; }
    }

    public class EstudianteCalificacionesDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public Dictionary<int, decimal?> NotasPorRubro { get; set; } = new(); // Key: RubroId, Value: Nota
        public decimal? PromedioFinal { get; set; }
    }

    // Para estadísticas de rendimiento
    public class EstadisticasCalificacionesDto
    {
        public int GrupoCursoId { get; set; }
        public string NombreCurso { get; set; } = string.Empty;
        public int TotalEstudiantes { get; set; }
        public int Aprobados { get; set; }
        public int Reprobados { get; set; }
        public decimal PorcentajeAprobacion { get; set; }
        public decimal PromedioGrupo { get; set; }
        public decimal NotaMaxima { get; set; }
        public decimal NotaMinima { get; set; }
        public List<DistribucionNotasDto> DistribucionNotas { get; set; } = new();
    }

    public class DistribucionNotasDto
    {
        public string Rango { get; set; } = string.Empty; // "90-100", "80-89", etc.
        public int Cantidad { get; set; }
        public decimal Porcentaje { get; set; }
    }
}
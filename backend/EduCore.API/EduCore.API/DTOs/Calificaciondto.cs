using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    // DTOs para Rubros
    public class RubroDto
    {
        public int Id { get; set; }
        public int SeccionId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal Porcentaje { get; set; }
        public int Orden { get; set; }
        public bool Activo { get; set; }
    }

    public class CreateRubroDto
    {
        [Required(ErrorMessage = "La sección es requerida")]
        public int SeccionId { get; set; }

        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(300, ErrorMessage = "La descripción no puede exceder 300 caracteres")]
        public string? Descripcion { get; set; }

        [Required(ErrorMessage = "El porcentaje es requerido")]
        [Range(0, 100, ErrorMessage = "El porcentaje debe estar entre 0 y 100")]
        public decimal Porcentaje { get; set; }

        public int Orden { get; set; } = 0;
    }

    public class UpdateRubroDto
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(300, ErrorMessage = "La descripción no puede exceder 300 caracteres")]
        public string? Descripcion { get; set; }

        [Required(ErrorMessage = "El porcentaje es requerido")]
        [Range(0, 100, ErrorMessage = "El porcentaje debe estar entre 0 y 100")]
        public decimal Porcentaje { get; set; }

        public int Orden { get; set; }
        public bool Activo { get; set; } = true;
    }

    // DTOs para Calificaciones
    public class CalificacionDto
    {
        public int Id { get; set; }
        public int EstudianteId { get; set; }
        public string MatriculaEstudiante { get; set; } = string.Empty;
        public string NombreEstudiante { get; set; } = string.Empty;
        public int RubroId { get; set; }
        public string NombreRubro { get; set; } = string.Empty;
        public decimal Nota { get; set; }
        public string? Observaciones { get; set; }
        public DateTime FechaRegistro { get; set; }
        public DateTime? FechaModificacion { get; set; }
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
    }

    public class UpdateCalificacionDto
    {
        [Required(ErrorMessage = "La nota es requerida")]
        [Range(0, 100, ErrorMessage = "La nota debe estar entre 0 y 100")]
        public decimal Nota { get; set; }

        [MaxLength(500, ErrorMessage = "Las observaciones no pueden exceder 500 caracteres")]
        public string? Observaciones { get; set; }
    }

    public class CargaCalificacionesDto
    {
        [Required(ErrorMessage = "Las calificaciones son requeridas")]
        public List<CalificacionCargaDto> Calificaciones { get; set; } = new List<CalificacionCargaDto>();
    }

    public class CalificacionCargaDto
    {
        [Required(ErrorMessage = "El estudiante es requerido")]
        public int EstudianteId { get; set; }

        [Required(ErrorMessage = "La nota es requerida")]
        [Range(0, 100, ErrorMessage = "La nota debe estar entre 0 y 100")]
        public decimal Nota { get; set; }

        public string? Observaciones { get; set; }
    }

    // DTOs para reportes de calificaciones
    public class ActaCalificacionesDto
    {
        public int SeccionId { get; set; }
        public string CodigoSeccion { get; set; } = string.Empty;
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public string Docente { get; set; } = string.Empty;
        public DateTime FechaGeneracion { get; set; } = DateTime.UtcNow;
        public List<RubroDto> Rubros { get; set; } = new List<RubroDto>();
        public List<EstudianteCalificacionesDto> Estudiantes { get; set; } = new List<EstudianteCalificacionesDto>();
    }

    public class EstudianteCalificacionesDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public Dictionary<string, decimal?> NotasPorRubro { get; set; } = new Dictionary<string, decimal?>();
        public decimal PromedioFinal { get; set; }
        public string Estado { get; set; } = string.Empty; // Aprobado, Reprobado, Pendiente
    }

    public class PromedioEstudianteDto
    {
        public int SeccionId { get; set; }
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public List<NotaRubroDto> Notas { get; set; } = new List<NotaRubroDto>();
        public decimal PromedioFinal { get; set; }
        public string Estado { get; set; } = string.Empty;
    }

    public class NotaRubroDto
    {
        public string NombreRubro { get; set; } = string.Empty;
        public decimal Porcentaje { get; set; }
        public decimal? Nota { get; set; }
        public decimal? NotaPonderada { get; set; }
    }
}



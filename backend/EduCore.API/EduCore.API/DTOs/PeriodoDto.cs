using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class PeriodoDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Trimestre { get; set; } = string.Empty;
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public bool EsActual { get; set; }
        public bool Activo { get; set; }
        public string? Observaciones { get; set; }
        public int TotalGrupos { get; set; }
        public int DiasRestantes { get; set; }
        public string Estado { get; set; } = string.Empty; // "Activo", "Finalizado", "Próximo"
    }

    public class CreatePeriodoDto
    {
        [Required(ErrorMessage = "El nombre del período es requerido")]
        [MaxLength(50)]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El trimestre es requerido")]
        [MaxLength(20)]
        public string Trimestre { get; set; } = string.Empty;

        [Required(ErrorMessage = "La fecha de inicio es requerida")]
        public DateTime FechaInicio { get; set; }

        [Required(ErrorMessage = "La fecha de fin es requerida")]
        public DateTime FechaFin { get; set; }

        [MaxLength(500)]
        public string? Observaciones { get; set; }
    }

    public class UpdatePeriodoDto
    {
        [Required(ErrorMessage = "El nombre del período es requerido")]
        [MaxLength(50)]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "La fecha de inicio es requerida")]
        public DateTime FechaInicio { get; set; }

        [Required(ErrorMessage = "La fecha de fin es requerida")]
        public DateTime FechaFin { get; set; }

        public bool Activo { get; set; }

        [MaxLength(500)]
        public string? Observaciones { get; set; }
    }

    // DTO para resumen de períodos
    public class ResumenPeriodoDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Trimestre { get; set; } = string.Empty;
        public bool EsActual { get; set; }
        public string Estado { get; set; } = string.Empty;
        public int TotalEstudiantes { get; set; }
        public int TotalCursos { get; set; }
        public decimal PromedioGeneral { get; set; }
        public int EstudiantesAprobados { get; set; }
        public int EstudiantesReprobados { get; set; }
        public decimal PorcentajeAprobacion { get; set; }
    }

    // DTO para comparación entre trimestres
    public class ComparacionTrimestreDto
    {
        public string Trimestre { get; set; } = string.Empty;
        public decimal PromedioGeneral { get; set; }
        public decimal PorcentajeAprobacion { get; set; }
        public int TotalEstudiantes { get; set; }
        public List<ComparacionCursoDto> Cursos { get; set; } = new();
    }

    public class ComparacionCursoDto
    {
        public string NombreCurso { get; set; } = string.Empty;
        public decimal PromedioTrimestre1 { get; set; }
        public decimal PromedioTrimestre2 { get; set; }
        public decimal PromedioTrimestre3 { get; set; }
        public decimal Tendencia { get; set; } // Positiva o negativa
    }
}
using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class GrupoCursoDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public int CursoId { get; set; }
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public int DocenteId { get; set; }
        public string CodigoDocente { get; set; } = string.Empty;
        public string NombreDocente { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public int Anio { get; set; }
        public string Periodo { get; set; } = string.Empty;
        public int? AulaId { get; set; }
        public string? AulaFisica { get; set; }

        public string? Horario { get; set; }
        public int CapacidadMaxima { get; set; }
        public int CantidadEstudiantes { get; set; }
        public bool Activo { get; set; }
    }

    public class CreateGrupoCursoDto
    {
        [Required]
        [MaxLength(20)]
        public string Codigo { get; set; } = string.Empty;

        [Required]
        public int CursoId { get; set; }

        [Required]
        public int DocenteId { get; set; }

        [Required]
        [Range(1, 12)]
        public int Grado { get; set; }

        [Required]
        [MaxLength(10)]
        public string Seccion { get; set; } = string.Empty;

        [Required]
        public int Anio { get; set; }

        [Required(ErrorMessage = "El período es requerido")]
        public int PeriodoId { get; set; }

        public int? AulaId { get; set; }


        [MaxLength(200)]
        public string? Horario { get; set; }

        [Required]
        [Range(1, 50)]
        public int CapacidadMaxima { get; set; } = 35;
    }

    public class UpdateGrupoCursoDto
    {
        [Required]
        public int DocenteId { get; set; }

        public int? AulaId { get; set; }


        [MaxLength(200)]
        public string? Horario { get; set; }

        [Required]
        [Range(1, 50)]
        public int CapacidadMaxima { get; set; }

        public bool Activo { get; set; }
    }

    public class GrupoCursoDetalleDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public CursoDto Curso { get; set; } = null!;
        public DocenteDto Docente { get; set; } = null!;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public int Anio { get; set; }
        public string Periodo { get; set; } = string.Empty;
        public int? AulaId { get; set; }
        public string? AulaFisica { get; set; }
        public string? Horario { get; set; }
        public int CapacidadMaxima { get; set; }
        public int CantidadEstudiantes { get; set; }
        public bool Activo { get; set; }
        public List<EstudianteGrupoDto> Estudiantes { get; set; } = new();
    }

    // Renombrado para evitar conflicto
    public class EstudianteGrupoDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string? Email { get; set; }
        public DateTime FechaInscripcion { get; set; }
        public string Estado { get; set; } = string.Empty;
    }

    // Para horarios
    public class HorarioGradoDto
    {
        public string Periodo { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public List<GrupoCursoHorarioDto> Grupos { get; set; } = new();
    }

    public class GrupoCursoHorarioDto
    {
        public int GrupoId { get; set; }
        public string CodigoGrupo { get; set; } = string.Empty;
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string AreaConocimiento { get; set; } = string.Empty;
        public string Docente { get; set; } = string.Empty;
        public int? AulaId { get; set; }
        public string? AulaFisica { get; set; }
        public string? Horario { get; set; }
    }

    /// <summary>
    /// DTO para creación masiva de grupos-cursos
    /// </summary>
    public class CreateGruposCursosBatchDto
    {
        [Required(ErrorMessage = "El período es requerido")]
        public int PeriodoId { get; set; }

        [Required(ErrorMessage = "El aula es requerida")]
        public int AulaId { get; set; }

        [Required(ErrorMessage = "El docente es requerido")]
        public int DocenteId { get; set; }

        [Required(ErrorMessage = "Debe seleccionar al menos un curso")]
        [MinLength(1, ErrorMessage = "Debe seleccionar al menos un curso")]
        public List<CursoBatchItemDto> Cursos { get; set; } = new();
    }

    /// <summary>
    /// DTO para cada curso en la creación masiva
    /// </summary>
    public class CursoBatchItemDto
    {
        [Required(ErrorMessage = "El ID del curso es requerido")]
        public int CursoId { get; set; }

        [MaxLength(200, ErrorMessage = "El horario no puede exceder 200 caracteres")]
        public string? Horario { get; set; }
    }

    /// <summary>
    /// DTO de respuesta para la creación masiva
    /// </summary>
    public class BatchCreateResultDto
    {
        public int TotalCreados { get; set; }
        public int TotalFallidos { get; set; }
        public List<GrupoCursoDto> GruposCreados { get; set; } = new();
        public List<BatchErrorDto> Errores { get; set; } = new();
    }

    /// <summary>
    /// DTO para errores individuales en el batch
    /// </summary>
    public class BatchErrorDto
    {
        public int CursoId { get; set; }
        public string NombreCurso { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
    }
}
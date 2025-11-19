using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class InscripcionDto
    {
        public int Id { get; set; }
        public int EstudianteId { get; set; }
        public string MatriculaEstudiante { get; set; } = string.Empty;
        public string NombreEstudiante { get; set; } = string.Empty;
        public int GradoEstudiante { get; set; }
        public string SeccionEstudiante { get; set; } = string.Empty;
        public int GrupoCursoId { get; set; }
        public string CodigoGrupo { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string AreaConocimiento { get; set; } = string.Empty;
        public string Docente { get; set; } = string.Empty;
        public DateTime FechaInscripcion { get; set; }
        public string Estado { get; set; } = string.Empty;
        public decimal? PromedioFinal { get; set; }
        public bool Activo { get; set; }
    }

    public class CreateInscripcionDto
    {
        [Required(ErrorMessage = "El estudiante es requerido")]
        public int EstudianteId { get; set; }

        [Required(ErrorMessage = "El grupo-curso es requerido")]
        public int GrupoCursoId { get; set; }
    }

    public class UpdateInscripcionDto
    {
        [Required(ErrorMessage = "El estado es requerido")]
        [MaxLength(20, ErrorMessage = "El estado no puede exceder 20 caracteres")]
        public string Estado { get; set; } = string.Empty;

        public bool Activo { get; set; }
    }

    // Para inscribir a un estudiante en todos los grupos de su grado/sección
    public class InscripcionMasivaEstudianteDto
    {
        [Required(ErrorMessage = "El estudiante es requerido")]
        public int EstudianteId { get; set; }

        [Required(ErrorMessage = "El periodo es requerido")]
        [MaxLength(20)]
        public string Periodo { get; set; } = string.Empty;
    }

    // Para inscribir a múltiples estudiantes en un grupo
    public class InscripcionMasivaGrupoDto
    {
        [Required(ErrorMessage = "El grupo-curso es requerido")]
        public int GrupoCursoId { get; set; }

        [Required(ErrorMessage = "Los estudiantes son requeridos")]
        public List<int> EstudiantesIds { get; set; } = new();
    }

    // Para inscribir a todo un grado/sección en sus grupos correspondientes
    public class InscripcionMasivaGradoSeccionDto
    {
        [Required(ErrorMessage = "El grado es requerido")]
        [Range(1, 12)]
        public int Grado { get; set; }

        [Required(ErrorMessage = "La sección es requerida")]
        [MaxLength(10)]
        public string Seccion { get; set; } = string.Empty;

        [Required(ErrorMessage = "El periodo es requerido")]
        [MaxLength(20)]
        public string Periodo { get; set; } = string.Empty;
    }

    public class InscripcionDetalleDto
    {
        public int Id { get; set; }
        public EstudianteDto Estudiante { get; set; } = null!;
        public GrupoCursoDto GrupoCurso { get; set; } = null!;
        public DateTime FechaInscripcion { get; set; }
        public string Estado { get; set; } = string.Empty;
        public decimal? PromedioFinal { get; set; }
        public bool Activo { get; set; }

        // Estadísticas adicionales
        public int TotalAsistencias { get; set; }
        public int Presentes { get; set; }
        public decimal PorcentajeAsistencia { get; set; }
        public int TotalCalificaciones { get; set; }
    }

    // Para ver todas las inscripciones de un estudiante (su horario completo)
    public class HorarioEstudianteDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public int GradoActual { get; set; }
        public string SeccionActual { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public List<InscripcionDto> Inscripciones { get; set; } = new();
        public int TotalMaterias { get; set; }
        public int MateriasAprobadas { get; set; }
        public int MateriasReprobadas { get; set; }
        public decimal PromedioGeneral { get; set; }
    }

    // Para ver lista de estudiantes inscritos en un grupo
    public class ListaEstudiantesGrupoDto
    {
        public int GrupoCursoId { get; set; }
        public string CodigoGrupo { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public int CapacidadMaxima { get; set; }
        public int CantidadEstudiantes { get; set; }
        public int CuposDisponibles { get; set; }
        public List<EstudianteInscritoGrupoDto> Estudiantes { get; set; } = new();
    }

    public class EstudianteInscritoGrupoDto
    {
        public int InscripcionId { get; set; }
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public DateTime FechaInscripcion { get; set; }
        public decimal? PromedioFinal { get; set; }
    }

    // Para estadísticas de inscripciones
    public class EstadisticasInscripcionesDto
    {
        public string Periodo { get; set; } = string.Empty;
        public int TotalEstudiantes { get; set; }
        public int TotalInscripciones { get; set; }
        public int InscripcionesActivas { get; set; }
        public int EstudiantesRetirados { get; set; }
        public int CursosCompletados { get; set; }
        public decimal PromedioInscripcionesPorEstudiante { get; set; }
        public List<InscripcionesPorGradoDto> InscripcionesPorGrado { get; set; } = new();
    }

    public class InscripcionesPorGradoDto
    {
        public int Grado { get; set; }
        public int TotalEstudiantes { get; set; }
        public int TotalInscripciones { get; set; }
    }

    // Resultado de inscripción masiva
    public class ResultadoInscripcionMasivaDto
    {
        public int TotalProcesados { get; set; }
        public int Exitosos { get; set; }
        public int Fallidos { get; set; }
        public List<InscripcionDto> InscripcionesCreadas { get; set; } = new();
        public List<ErrorInscripcionDto> Errores { get; set; } = new();
    }

    public class ErrorInscripcionDto
    {
        public int? EstudianteId { get; set; }
        public int? GrupoCursoId { get; set; }
        public string Motivo { get; set; } = string.Empty;
    }
}
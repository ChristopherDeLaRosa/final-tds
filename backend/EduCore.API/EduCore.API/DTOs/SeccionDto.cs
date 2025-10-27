using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class SeccionDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public int CursoId { get; set; }
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public int DocenteId { get; set; }
        public string CodigoDocente { get; set; } = string.Empty;
        public string NombreDocente { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public string? Aula { get; set; }
        public string? Horario { get; set; }
        public int Capacidad { get; set; }
        public int Inscritos { get; set; }
        public int Disponibles => Capacidad - Inscritos;
        public bool Activo { get; set; }
    }

    public class CreateSeccionDto
    {
        [Required(ErrorMessage = "El código es requerido")]
        [MaxLength(20, ErrorMessage = "El código no puede exceder 20 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "El curso es requerido")]
        public int CursoId { get; set; }

        [Required(ErrorMessage = "El docente es requerido")]
        public int DocenteId { get; set; }

        [Required(ErrorMessage = "El periodo es requerido")]
        [MaxLength(50, ErrorMessage = "El periodo no puede exceder 50 caracteres")]
        public string Periodo { get; set; } = string.Empty;

        [MaxLength(50, ErrorMessage = "El aula no puede exceder 50 caracteres")]
        public string? Aula { get; set; }

        [MaxLength(100, ErrorMessage = "El horario no puede exceder 100 caracteres")]
        public string? Horario { get; set; }

        [Required(ErrorMessage = "La capacidad es requerida")]
        [Range(1, 200, ErrorMessage = "La capacidad debe estar entre 1 y 200")]
        public int Capacidad { get; set; }
    }

    public class UpdateSeccionDto
    {
        [Required(ErrorMessage = "El docente es requerido")]
        public int DocenteId { get; set; }

        [MaxLength(50, ErrorMessage = "El aula no puede exceder 50 caracteres")]
        public string? Aula { get; set; }

        [MaxLength(100, ErrorMessage = "El horario no puede exceder 100 caracteres")]
        public string? Horario { get; set; }

        [Required(ErrorMessage = "La capacidad es requerida")]
        [Range(1, 200, ErrorMessage = "La capacidad debe estar entre 1 y 200")]
        public int Capacidad { get; set; }

        public bool Activo { get; set; } = true;
    }

    public class SeccionDetalleDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public CursoDto Curso { get; set; } = null!;
        public DocenteDto Docente { get; set; } = null!;
        public string Periodo { get; set; } = string.Empty;
        public string? Aula { get; set; }
        public string? Horario { get; set; }
        public int Capacidad { get; set; }
        public int Inscritos { get; set; }
        public int Disponibles => Capacidad - Inscritos;
        public bool Activo { get; set; }
        public List<EstudianteInscritoDto> Estudiantes { get; set; } = new List<EstudianteInscritoDto>();
    }

    public class EstudianteInscritoDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime FechaInscripcion { get; set; }
        public string Estado { get; set; } = string.Empty;
    }

    public class HorarioDto
    {
        public string Periodo { get; set; } = string.Empty;
        public List<SeccionHorarioDto> Secciones { get; set; } = new List<SeccionHorarioDto>();
    }

    public class SeccionHorarioDto
    {
        public int SeccionId { get; set; }
        public string CodigoSeccion { get; set; } = string.Empty;
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string Docente { get; set; } = string.Empty;
        public string? Aula { get; set; }
        public string? Horario { get; set; }
    }
}
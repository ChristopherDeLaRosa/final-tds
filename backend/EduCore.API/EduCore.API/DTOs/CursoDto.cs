using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class CursoDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public int Creditos { get; set; }
        public int HorasSemana { get; set; }
        public bool Activo { get; set; }
    }

    public class CreateCursoDto
    {
        [Required(ErrorMessage = "El código es requerido")]
        [MaxLength(20, ErrorMessage = "El código no puede exceder 20 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(150, ErrorMessage = "El nombre no puede exceder 150 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string? Descripcion { get; set; }

        [Required(ErrorMessage = "Los créditos son requeridos")]
        [Range(1, 10, ErrorMessage = "Los créditos deben estar entre 1 y 10")]
        public int Creditos { get; set; }

        [Required(ErrorMessage = "Las horas por semana son requeridas")]
        [Range(1, 40, ErrorMessage = "Las horas por semana deben estar entre 1 y 40")]
        public int HorasSemana { get; set; }
    }

    public class UpdateCursoDto
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(150, ErrorMessage = "El nombre no puede exceder 150 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string? Descripcion { get; set; }

        [Required(ErrorMessage = "Los créditos son requeridos")]
        [Range(1, 10, ErrorMessage = "Los créditos deben estar entre 1 y 10")]
        public int Creditos { get; set; }

        [Required(ErrorMessage = "Las horas por semana son requeridas")]
        [Range(1, 40, ErrorMessage = "Las horas por semana deben estar entre 1 y 40")]
        public int HorasSemana { get; set; }

        public bool Activo { get; set; } = true;
    }

    public class CursoCatalogoDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public int Creditos { get; set; }
        public int HorasSemana { get; set; }
        public int SeccionesDisponibles { get; set; }
        public List<SeccionSimpleDto> Secciones { get; set; } = new List<SeccionSimpleDto>();
    }

    public class SeccionSimpleDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public string? Aula { get; set; }
        public string? Horario { get; set; }
        public string Docente { get; set; } = string.Empty;
        public int Inscritos { get; set; }
        public int Capacidad { get; set; }
        public bool DisponibleParaInscripcion => Inscritos < Capacidad;
    }
}
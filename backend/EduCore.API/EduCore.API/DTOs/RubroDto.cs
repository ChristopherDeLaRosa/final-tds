using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class RubroDto
    {
        public int Id { get; set; }
        public int GrupoCursoId { get; set; }
        public string CodigoGrupo { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal Porcentaje { get; set; }
        public int Orden { get; set; }
        public bool Activo { get; set; }
        public int CantidadCalificaciones { get; set; }
    }

    public class CreateRubroDto
    {
        [Required(ErrorMessage = "El grupo-curso es requerido")]
        public int GrupoCursoId { get; set; }

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
        public bool Activo { get; set; }
    }

    // Para crear múltiples rubros a la vez (plantilla)
    public class CrearRubrosPlantillaDto
    {
        [Required(ErrorMessage = "El grupo-curso es requerido")]
        public int GrupoCursoId { get; set; }

        [Required(ErrorMessage = "Los rubros son requeridos")]
        public List<RubroPlantillaDto> Rubros { get; set; } = new();
    }

    public class RubroPlantillaDto
    {
        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(300)]
        public string? Descripcion { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal Porcentaje { get; set; }

        public int Orden { get; set; }
    }

    // Para ver el resumen de rubros de un grupo con estadísticas
    public class RubrosGrupoCursoDto
    {
        public int GrupoCursoId { get; set; }
        public string CodigoGrupo { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public List<RubroDetalleDto> Rubros { get; set; } = new();
        public decimal TotalPorcentaje { get; set; }
        public bool PorcentajeCompleto { get; set; }
    }

    public class RubroDetalleDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal Porcentaje { get; set; }
        public int Orden { get; set; }
        public bool Activo { get; set; }
        public int TotalCalificaciones { get; set; }
        public int EstudiantesConNota { get; set; }
        public int EstudiantesSinNota { get; set; }
        public decimal? PromedioRubro { get; set; }
    }

    // Para validar que los porcentajes sumen 100%
    public class ValidacionRubrosDto
    {
        public int GrupoCursoId { get; set; }
        public decimal TotalPorcentaje { get; set; }
        public bool EsValido { get; set; }
        public string Mensaje { get; set; } = string.Empty;
        public List<RubroDto> Rubros { get; set; } = new();
    }
}
using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    // DTO base
    public class CursoDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public int NivelGrado { get; set; }
        public string Nivel { get; set; } = string.Empty;
        public string AreaConocimiento { get; set; } = string.Empty;
        public int HorasSemana { get; set; }
        public bool EsObligatoria { get; set; }
        public int Orden { get; set; }
        public bool Activo { get; set; }
    }

    // Para crear
    public class CreateCursoDto
    {
        [Required]
        [MaxLength(20)]
        public string Codigo { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Descripcion { get; set; }

        [Required]
        [Range(1, 12)]
        public int NivelGrado { get; set; }

        [Required]
        [MaxLength(50)]
        public string Nivel { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string AreaConocimiento { get; set; } = string.Empty;

        [Required]
        [Range(1, 10)]
        public int HorasSemana { get; set; }

        public bool EsObligatoria { get; set; } = true;
        public int Orden { get; set; } = 0;
    }

    // Para actualizar
    public class UpdateCursoDto
    {
        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Descripcion { get; set; }

        [Required]
        [MaxLength(100)]
        public string AreaConocimiento { get; set; } = string.Empty;

        [Required]
        [Range(1, 10)]
        public int HorasSemana { get; set; }

        public bool EsObligatoria { get; set; }
        public int Orden { get; set; }
        public bool Activo { get; set; }
    }

    // Para catalogo por grado
    public class CursoPorGradoDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string AreaConocimiento { get; set; } = string.Empty;
        public bool EsObligatoria { get; set; }
        public int HorasSemana { get; set; }
        public int GruposDisponibles { get; set; }
        public List<GrupoSimpleDto> Grupos { get; set; } = new();
    }

    public class GrupoSimpleDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Seccion { get; set; } = string.Empty;
        public string Horario { get; set; } = string.Empty;
        public string? Aula { get; set; }
        public string Docente { get; set; } = string.Empty;
        public int CantidadEstudiantes { get; set; }
        public int CapacidadMaxima { get; set; }
        public bool DisponibleParaInscripcion { get; set; }
    }
}
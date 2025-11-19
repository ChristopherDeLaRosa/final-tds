using System.ComponentModel.DataAnnotations;
using static System.Collections.Specialized.BitVector32;

namespace EduCore.API.Models
{
    public class Curso
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string Codigo { get; set; } = string.Empty; // Ej: MAT-8, HIST-9

        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Descripcion { get; set; }

 
        [Required]
        [Range(1, 12)]
        public int NivelGrado { get; set; } // 1-12 (primaria/secundaria)

        [Required]
        [MaxLength(50)]
        public string Nivel { get; set; } = string.Empty; // "Primaria", "Secundaria"

        [Required]
        [MaxLength(100)]
        public string AreaConocimiento { get; set; } = string.Empty; // "Matematicas", "Ciencias", "Lenguaje"

        [Required]
        public int HorasSemana { get; set; }

        [Required]
        public bool EsObligatoria { get; set; } = true; // true = obligatoria, false = electiva

        public int Orden { get; set; } = 0; // Para ordenar en el horario

        public bool Activo { get; set; } = true;

        // Navegacion
        public virtual ICollection<GrupoCurso> GruposCursos { get; set; } = new List<GrupoCurso>();
    }
}
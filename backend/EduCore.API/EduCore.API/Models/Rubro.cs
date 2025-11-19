using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    // Rubro representa un componente de evaluacion dentro de un grupo-curso
    public class Rubro
    {
        [Key]
        public int Id { get; set; }

        // CAMBIO: SeccionId -> GrupoCursoId
        [Required]
        public int GrupoCursoId { get; set; }

        [ForeignKey("GrupoCursoId")]
        public virtual GrupoCurso GrupoCurso { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty; // Ej: Examen Parcial, Tareas

        [MaxLength(300)]
        public string? Descripcion { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal Porcentaje { get; set; } // % del total de la nota

        public int Orden { get; set; } = 0;

        public bool Activo { get; set; } = true;

        // Navegación
        public virtual ICollection<Calificacion> Calificaciones { get; set; } = new List<Calificacion>();
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    // rubro representa un componente de evaluacion dentro de una sección de curso
    public class Rubro
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SeccionId { get; set; }

        [ForeignKey("SeccionId")]
        public virtual Seccion Seccion { get; set; } = null!;

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
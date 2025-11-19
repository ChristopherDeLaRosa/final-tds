using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    public class Calificacion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EstudianteId { get; set; }

        [ForeignKey("EstudianteId")]
        public virtual Estudiante Estudiante { get; set; } = null!;

        [Required]
        public int RubroId { get; set; }

        [ForeignKey("RubroId")]
        public virtual Rubro Rubro { get; set; } = null!;

        [Required]
        [Range(0, 100)]
        public decimal Nota { get; set; }

        [MaxLength(500)]
        public string? Observaciones { get; set; }

        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        public DateTime? FechaModificacion { get; set; }

        public int? UsuarioModificacionId { get; set; }

        // Campos adicionales escolares
        public bool Recuperacion { get; set; } = false; // Si es nota de recuperación

        public int? CalificacionOriginalId { get; set; } // Referencia a la nota original si es recuperación
    }
}
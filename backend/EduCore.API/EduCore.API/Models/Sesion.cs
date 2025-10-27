using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    // clases/sesiones programadas dentro de una sección de curso
    public class Sesion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SeccionId { get; set; }

        [ForeignKey("SeccionId")]
        public virtual Seccion Seccion { get; set; } = null!;

        [Required]
        public DateTime Fecha { get; set; }

        [Required]
        public TimeSpan HoraInicio { get; set; }

        [Required]
        public TimeSpan HoraFin { get; set; }

        [MaxLength(100)]
        public string? Tema { get; set; }

        [MaxLength(500)]
        public string? Observaciones { get; set; }

        public bool Realizada { get; set; } = false;

        // Navegación
        public virtual ICollection<Asistencia> Asistencias { get; set; } = new List<Asistencia>();
    }
}
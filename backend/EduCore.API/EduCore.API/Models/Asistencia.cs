using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    public class Asistencia
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SesionId { get; set; }

        [ForeignKey("SesionId")]
        public virtual Sesion Sesion { get; set; } = null!;

        [Required]
        public int EstudianteId { get; set; }

        [ForeignKey("EstudianteId")]
        public virtual Estudiante Estudiante { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string Estado { get; set; } = "Presente"; // Presente, Ausente, Tardanza, Justificado

        [MaxLength(300)]
        public string? Observaciones { get; set; }

        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        public int? UsuarioRegistroId { get; set; }
    }
}

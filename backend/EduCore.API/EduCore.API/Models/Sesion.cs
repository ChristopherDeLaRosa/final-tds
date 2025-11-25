using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    // Clases/sesiones programadas dentro de un grupo-curso
    public class Sesion
    {
        [Key]
        public int Id { get; set; }

        // CAMBIO: SeccionId -> GrupoCursoId
        [Required]
        public int GrupoCursoId { get; set; }

        [ForeignKey("GrupoCursoId")]
        public virtual GrupoCurso GrupoCurso { get; set; } = null!;

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
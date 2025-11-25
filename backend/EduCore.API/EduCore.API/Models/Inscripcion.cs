using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    public class Inscripcion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EstudianteId { get; set; }

        [ForeignKey("EstudianteId")]
        public virtual Estudiante Estudiante { get; set; } = null!;

        // CAMBIO: SeccionId -> GrupoCursoId
        [Required]
        public int GrupoCursoId { get; set; }

        [ForeignKey("GrupoCursoId")]
        public virtual GrupoCurso GrupoCurso { get; set; } = null!;

        public DateTime FechaInscripcion { get; set; } = DateTime.UtcNow;

        [MaxLength(20)]
        public string Estado { get; set; } = "Activo"; // Activo, Retirado, Completado

        public decimal? PromedioFinal { get; set; }

        public bool Activo { get; set; } = true;
    }
}
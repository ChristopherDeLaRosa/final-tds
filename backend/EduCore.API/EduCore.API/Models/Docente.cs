using System.ComponentModel.DataAnnotations;
using static System.Collections.Specialized.BitVector32;

namespace EduCore.API.Models
{
    public class Docente
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string Codigo { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Nombres { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Apellidos { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Telefono { get; set; }

        [MaxLength(100)]
        public string? Especialidad { get; set; }

        public DateTime FechaContratacion { get; set; } = DateTime.UtcNow;

        public bool Activo { get; set; } = true;

        // Navegación
        public virtual ICollection<GrupoCurso> GrupoCursos { get; set; } = new List<GrupoCurso>();
    }
}
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
        public string Codigo { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Descripcion { get; set; }

        [Required]
        public int Creditos { get; set; }

        [Required]
        public int HorasSemana { get; set; }

        public bool Activo { get; set; } = true;

        // Navegación
        public virtual ICollection<Seccion> Secciones { get; set; } = new List<Seccion>();
    }
}
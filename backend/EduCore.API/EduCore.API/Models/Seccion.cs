using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    public class Seccion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string Codigo { get; set; } = string.Empty; // Ej: SEC-001 / asignatura

        [Required]
        public int CursoId { get; set; }

        [ForeignKey("CursoId")]
        public virtual Curso Curso { get; set; } = null!;

        [Required]
        public int DocenteId { get; set; }

        [ForeignKey("DocenteId")]
        public virtual Docente Docente { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Periodo { get; set; } = string.Empty; // Ej: 2025-1

        [MaxLength(50)]
        public string? Aula { get; set; }

        [MaxLength(100)]
        public string? Horario { get; set; } // Ej: "Lun-Mie 8:00-10:00"

        [Required]
        public int Capacidad { get; set; }

        public int Inscritos { get; set; } = 0;

        public bool Activo { get; set; } = true;

        // Navegación
        public virtual ICollection<Inscripcion> Inscripciones { get; set; } = new List<Inscripcion>();
        public virtual ICollection<Sesion> Sesiones { get; set; } = new List<Sesion>();
        public virtual ICollection<Rubro> Rubros { get; set; } = new List<Rubro>();
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    public class Estudiante
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string Matricula { get; set; } = string.Empty;

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

        [MaxLength(200)]
        public string? Direccion { get; set; }

        [Required]
        public DateTime FechaNacimiento { get; set; }

        public DateTime FechaIngreso { get; set; } = DateTime.UtcNow;

        [ForeignKey("AulaId")]
        public int? AulaId { get; set; } // FK al aula asignada

        public virtual Aula? Aula { get; set; }

        [Required]
        [Range(1, 12)]
        public int GradoActual { get; set; } // 1-12 (grado actual del estudiante)

        [Required]
        [MaxLength(10)]
        public string SeccionActual { get; set; } = string.Empty; // "A", "B", "C"

        [MaxLength(100)]
        public string? NombreTutor { get; set; } // Nombre del padre/madre/tutor

        [MaxLength(20)]
        public string? TelefonoTutor { get; set; }

        [MaxLength(150)]
        public string? EmailTutor { get; set; }

        [MaxLength(500)]
        public string? ObservacionesMedicas { get; set; } // Alergias, condiciones especiales

        public bool Activo { get; set; } = true;

        // Navegación
        public virtual ICollection<Inscripcion> Inscripciones { get; set; } = new List<Inscripcion>();
        public virtual ICollection<Calificacion> Calificaciones { get; set; } = new List<Calificacion>();
        public virtual ICollection<Asistencia> Asistencias { get; set; } = new List<Asistencia>();
        
    }
}
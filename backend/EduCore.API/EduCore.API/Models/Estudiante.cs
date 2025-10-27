using System.ComponentModel.DataAnnotations;

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

        public bool Activo { get; set; } = true;

        // Navegación
        public virtual ICollection<Inscripcion> Inscripciones { get; set; } = new List<Inscripcion>();
        public virtual ICollection<Calificacion> Calificaciones { get; set; } = new List<Calificacion>();
        public virtual ICollection<Asistencia> Asistencias { get; set; } = new List<Asistencia>();
    }
}
using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models
{
    public class Usuario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string NombreUsuario { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Rol { get; set; } = string.Empty; // Admin, Docente, Estudiante

        public bool Activo { get; set; } = true;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? UltimoAcceso { get; set; }

        // Relación con Estudiante o Docente
        public int? EstudianteId { get; set; }
        public virtual Estudiante? Estudiante { get; set; }

        public int? DocenteId { get; set; }
        public virtual Docente? Docente { get; set; }
    }
}
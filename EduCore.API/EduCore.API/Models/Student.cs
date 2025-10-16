using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    public class Student
    {
        public int Id { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
        public int Grado { get; set; } // 1-6 básica o bachiller
        public string Seccion { get; set; } = string.Empty; // A-F
        public string? Direccion { get; set; }
        public string? Telefono { get; set; }
        public string? Email { get; set; }
        public string Estado { get; set; } = "activo"; // activo, inactivo
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("CreatedBy")]
        public User? CreatedByUser { get; set; }

        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    }
}

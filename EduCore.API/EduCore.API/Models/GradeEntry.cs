using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    public class GradeEntry
    {
        public int Id { get; set; }
        public int EnrollmentId { get; set; }
        public int GradeItemId { get; set; }
        public decimal Calificacion { get; set; } // 0 a 100
        public string? Observacion { get; set; }
        public int CreadoPorUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("EnrollmentId")]
        public Enrollment? Enrollment { get; set; }

        [ForeignKey("GradeItemId")]
        public GradeItem? GradeItem { get; set; }

        [ForeignKey("CreadoPorUserId")]
        public User? CreadoPorUser { get; set; }
    }
}

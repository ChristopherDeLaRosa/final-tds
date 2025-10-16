using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    public class GradeItem
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal Peso { get; set; } // 0 a 1
        public string RubroTipo { get; set; } = string.Empty; // examen, tarea, proyecto, participacion
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("CourseId")]
        public Course? Course { get; set; }
    }
}

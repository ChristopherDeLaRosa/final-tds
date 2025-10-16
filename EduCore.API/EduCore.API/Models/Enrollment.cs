using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    public class Enrollment
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int CourseId { get; set; }
        public int SectionId { get; set; }
        public int AnioEscolar { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("StudentId")]
        public Student? Student { get; set; }

        [ForeignKey("CourseId")]
        public Course? Course { get; set; }

        [ForeignKey("SectionId")]
        public Section? Section { get; set; }

        public ICollection<GradeEntry> GradeEntries { get; set; } = new List<GradeEntry>();
    }
}

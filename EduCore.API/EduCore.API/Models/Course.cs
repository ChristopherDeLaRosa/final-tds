namespace EduCore.API.Models
{
    public class Course
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public int Grado { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<GradeItem> GradeItems { get; set; } = new List<GradeItem>();
    }
}

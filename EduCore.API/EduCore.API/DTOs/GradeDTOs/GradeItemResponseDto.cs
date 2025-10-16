namespace EduCore.API.DTOs.GradeDTOs
{
    public class GradeItemResponseDto
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal Peso { get; set; }
        public string RubroTipo { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}

namespace EduCore.API.DTOs.GradeDTOs
{
    public class GradeEntryResponseDto
    {
        public int Id { get; set; }
        public int EnrollmentId { get; set; }
        public int GradeItemId { get; set; }
        public decimal Calificacion { get; set; }
        public string? Observacion { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

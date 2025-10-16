namespace EduCore.API.DTOs.GradeDTOs
{
    public class PromedioCursoDto
    {
        public int CourseId { get; set; }
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public decimal PromedioPonderado { get; set; }
        public List<CalificacionDetalleDto> Calificaciones { get; set; } = new();
    }
}

namespace EduCore.API.DTOs.Student
{
    public class StudentQueryDto
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
        public string? Q { get; set; }
        public int? Grado { get; set; }
        public string? Seccion { get; set; }
        public string? Estado { get; set; }
        public string SortBy { get; set; } = "Id";
        public string Order { get; set; } = "asc";
    }
}

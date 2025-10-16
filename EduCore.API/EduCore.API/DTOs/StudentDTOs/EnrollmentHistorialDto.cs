namespace EduCore.API.DTOs.Student
{
    public class EnrollmentHistorialDto
    {
        public int EnrollmentId { get; set; }
        public int AnioEscolar { get; set; }
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string SeccionNombre { get; set; } = string.Empty;
        public decimal? PromedioFinal { get; set; }
        public List<CalificacionResumenDto> Calificaciones { get; set; } = new();
    }
}

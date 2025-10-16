namespace EduCore.API.DTOs.StudentDtos
{
    public class CalificacionResumenDto
    {
        public string RubroNombre { get; set; } = string.Empty;
        public string RubroTipo { get; set; } = string.Empty;
        public decimal Peso { get; set; }
        public decimal? Calificacion { get; set; }
    }
}

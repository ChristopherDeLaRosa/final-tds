namespace EduCore.API.DTOs.GradeDTOs
{
    public class CalificacionDetalleDto
    {
        public string RubroNombre { get; set; } = string.Empty;
        public string RubroTipo { get; set; } = string.Empty;
        public decimal Peso { get; set; }
        public decimal Calificacion { get; set; }
        public decimal Aporte { get; set; }
    }
}

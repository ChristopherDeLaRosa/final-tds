namespace EduCore.API.DTOs.GradeDTOs
{
    public class ActaEstudianteDto
    {
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public Dictionary<string, decimal?> Calificaciones { get; set; } = new();
        public decimal PromedioFinal { get; set; }
    }
}

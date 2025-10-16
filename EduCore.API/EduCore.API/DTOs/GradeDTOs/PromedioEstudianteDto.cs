namespace EduCore.API.DTOs.GradeDTOs
{
    public class PromedioEstudianteDto
    {
        public int StudentId { get; set; }
        public string NombreEstudiante { get; set; } = string.Empty;
        public List<PromedioCursoDto> PromediosPorCurso { get; set; } = new();
        public decimal PromedioGeneral { get; set; }
    }
}

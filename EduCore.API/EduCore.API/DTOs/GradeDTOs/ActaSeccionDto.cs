namespace EduCore.API.DTOs.GradeDTOs
{
    public class ActaSeccionDto
    {
        public int SectionId { get; set; }
        public string SeccionNombre { get; set; } = string.Empty;
        public string CursoNombre { get; set; } = string.Empty;
        public int AnioEscolar { get; set; }
        public List<string> Rubros { get; set; } = new();
        public List<ActaEstudianteDto> Estudiantes { get; set; } = new();
    }
}

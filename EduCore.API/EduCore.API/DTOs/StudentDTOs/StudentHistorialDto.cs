namespace EduCore.API.DTOs.Student
{
    public class StudentHistorialDto
    {
        public StudentResponseDto Estudiante { get; set; } = new();
        public List<EnrollmentHistorialDto> Inscripciones { get; set; } = new();
    }
}

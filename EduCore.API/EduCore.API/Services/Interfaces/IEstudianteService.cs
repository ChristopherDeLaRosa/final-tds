using EduCore.API.DTOs.Student;
using EduCore.API.DTOs.StudentDTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IEstudianteService
    {
        Task<PagedResultDto<StudentResponseDto>> GetAllAsync(StudentQueryDto query);
        Task<StudentResponseDto> GetByIdAsync(int id, int? requestingUserId, string? requestingUserRole);
        Task<StudentResponseDto> CreateAsync(CreateStudentDto dto, int createdByUserId);
        Task<StudentResponseDto> UpdateAsync(int id, UpdateStudentDto dto);
        Task DeleteAsync(int id);
        Task<StudentHistorialDto> GetHistorialAsync(int id, int? requestingUserId, string? requestingUserRole);
    }
}

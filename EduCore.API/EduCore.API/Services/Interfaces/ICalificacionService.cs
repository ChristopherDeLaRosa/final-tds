using EduCore.API.DTOs.GradeDTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface ICalificacionService
    {
        Task<List<GradeItemResponseDto>> GetRubrosByCourseAsync(int courseId);
        Task<GradeItemResponseDto> CreateRubroAsync(int courseId, CreateGradeItemDto dto, int userId);
        Task<GradeItemResponseDto> UpdateRubroAsync(int rubroId, UpdateGradeItemDto dto, int userId);
        Task DeleteRubroAsync(int rubroId);
        Task<List<GradeEntryResponseDto>> CargaMasivaAsync(CargaMasivaCalificacionesDto dto, int userId);
        Task<GradeEntryResponseDto> UpdateCalificacionAsync(int gradeEntryId, UpdateGradeEntryDto dto, int userId);
        Task<PromedioEstudianteDto> GetPromediosEstudianteAsync(int studentId, int? requestingUserId, string? requestingUserRole);
        Task<ActaSeccionDto> GetActaSeccionAsync(int sectionId);
    }
}

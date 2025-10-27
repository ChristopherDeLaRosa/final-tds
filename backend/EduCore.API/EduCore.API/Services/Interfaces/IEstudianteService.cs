using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IEstudianteService
    {
        Task<IEnumerable<EstudianteDto>> GetAllAsync();
        Task<EstudianteDto?> GetByIdAsync(int id);
        Task<EstudianteDto?> GetByMatriculaAsync(string matricula);
        Task<EstudianteDto> CreateAsync(CreateEstudianteDto createDto);
        Task<EstudianteDto?> UpdateAsync(int id, UpdateEstudianteDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<EstudianteHistorialDto?> GetHistorialAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> MatriculaExistsAsync(string matricula);
    }
}
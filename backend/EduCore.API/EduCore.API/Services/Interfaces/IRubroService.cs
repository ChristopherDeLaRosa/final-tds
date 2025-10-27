using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IRubroService
    {
        Task<IEnumerable<RubroDto>> GetAllAsync();
        Task<RubroDto?> GetByIdAsync(int id);
        Task<IEnumerable<RubroDto>> GetBySeccionAsync(int seccionId);
        Task<RubroDto> CreateAsync(CreateRubroDto createDto);
        Task<RubroDto?> UpdateAsync(int id, UpdateRubroDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<decimal> GetTotalPorcentajeBySeccionAsync(int seccionId);
    }
}

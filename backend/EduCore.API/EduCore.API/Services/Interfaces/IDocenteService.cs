using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IDocenteService
    {
        Task<IEnumerable<DocenteDto>> GetAllAsync();
        Task<DocenteDto?> GetByIdAsync(int id);
        Task<DocenteDto?> GetByCodigoAsync(string codigo);
        Task<DocenteDto> CreateAsync(CreateDocenteDto createDto);
        Task<DocenteDto?> UpdateAsync(int id, UpdateDocenteDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<DocenteCargaAcademicaDto?> GetCargaAcademicaAsync(int id, string? periodo = null);
        Task<bool> ExistsAsync(int id);
        Task<bool> CodigoExistsAsync(string codigo);
    }
}
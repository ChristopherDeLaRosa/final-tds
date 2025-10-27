using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface ICursoService
    {
        Task<IEnumerable<CursoDto>> GetAllAsync();
        Task<CursoDto?> GetByIdAsync(int id);
        Task<CursoDto?> GetByCodigoAsync(string codigo);
        Task<CursoDto> CreateAsync(CreateCursoDto createDto);
        Task<CursoDto?> UpdateAsync(int id, UpdateCursoDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<CursoCatalogoDto>> GetCatalogoAsync(string? periodo = null);
        Task<bool> ExistsAsync(int id);
        Task<bool> CodigoExistsAsync(string codigo);
    }
}
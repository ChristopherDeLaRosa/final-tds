using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface ISeccionService
    {
        Task<IEnumerable<SeccionDto>> GetAllAsync();
        Task<SeccionDto?> GetByIdAsync(int id);
        Task<SeccionDetalleDto?> GetDetalleByIdAsync(int id);
        Task<IEnumerable<SeccionDto>> GetByPeriodoAsync(string periodo);
        Task<IEnumerable<SeccionDto>> GetByCursoAsync(int cursoId);
        Task<IEnumerable<SeccionDto>> GetByDocenteAsync(int docenteId);
        Task<SeccionDto> CreateAsync(CreateSeccionDto createDto);
        Task<SeccionDto?> UpdateAsync(int id, UpdateSeccionDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<HorarioDto?> GetHorarioByPeriodoAsync(string periodo);
        Task<bool> ExistsAsync(int id);
        Task<bool> CodigoExistsAsync(string codigo);
    }
}

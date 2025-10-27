using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface ISesionService
    {
        Task<IEnumerable<SesionDto>> GetAllAsync();
        Task<SesionDto?> GetByIdAsync(int id);
        Task<IEnumerable<SesionDto>> GetBySeccionAsync(int seccionId);
        Task<IEnumerable<SesionDto>> GetBySeccionYFechaAsync(int seccionId, DateTime fechaInicio, DateTime fechaFin);
        Task<SesionDto> CreateAsync(CreateSesionDto createDto);
        Task<SesionDto?> UpdateAsync(int id, UpdateSesionDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<bool> MarcarComoRealizadaAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}
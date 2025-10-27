using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface ICalificacionService
    {
        Task<IEnumerable<CalificacionDto>> GetAllAsync();
        Task<CalificacionDto?> GetByIdAsync(int id);
        Task<IEnumerable<CalificacionDto>> GetByEstudianteAsync(int estudianteId);
        Task<IEnumerable<CalificacionDto>> GetByRubroAsync(int rubroId);
        Task<IEnumerable<CalificacionDto>> GetBySeccionAsync(int seccionId);
        Task<CalificacionDto> CreateAsync(CreateCalificacionDto createDto, int usuarioId);
        Task<CalificacionDto?> UpdateAsync(int id, UpdateCalificacionDto updateDto, int usuarioId);
        Task<bool> DeleteAsync(int id);
        Task<bool> CargaMasivaAsync(int rubroId, CargaCalificacionesDto cargaDto, int usuarioId);
        Task<PromedioEstudianteDto?> GetPromedioEstudianteAsync(int seccionId, int estudianteId);
        Task<ActaCalificacionesDto?> GenerarActaAsync(int seccionId);
        Task<bool> ActualizarPromedioFinalAsync(int seccionId, int estudianteId);
        Task<bool> ExistsAsync(int id);
    }
}


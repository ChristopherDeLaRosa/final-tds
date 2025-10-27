using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IAsistenciaService
    {
        Task<IEnumerable<AsistenciaDto>> GetAllAsync();
        Task<AsistenciaDto?> GetByIdAsync(int id);
        Task<IEnumerable<AsistenciaDto>> GetBySesionAsync(int sesionId);
        Task<IEnumerable<AsistenciaDto>> GetByEstudianteAsync(int estudianteId);
        Task<AsistenciaDto> CreateAsync(CreateAsistenciaDto createDto, int usuarioId);
        Task<AsistenciaDto?> UpdateAsync(int id, UpdateAsistenciaDto updateDto, int usuarioId);
        Task<bool> DeleteAsync(int id);
        Task<bool> RegistrarAsistenciaSesionAsync(int sesionId, RegistroAsistenciaSesionDto registroDto, int usuarioId);
        Task<ListaAsistenciaSesionDto?> GetListaAsistenciaSesionAsync(int sesionId);
        Task<ResumenAsistenciaSeccionDto?> GetResumenAsistenciaSeccionAsync(int seccionId);
        Task<ResumenAsistenciaEstudianteDto?> GetResumenAsistenciaEstudianteAsync(int estudianteId);
        Task<List<AsistenciaRegistroDto>> GenerarPlantillaAsistenciaAsync(int sesionId);
        Task<bool> ExistsAsync(int id);
    }
}
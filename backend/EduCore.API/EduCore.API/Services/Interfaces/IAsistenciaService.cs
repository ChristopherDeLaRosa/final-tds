using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IAsistenciaService
    {
        // CRUD básico
        Task<AsistenciaDto?> GetByIdAsync(int id);
        Task<AsistenciaDto> CreateAsync(CreateAsistenciaDto createDto);
        Task<AsistenciaDto?> UpdateAsync(int id, UpdateAsistenciaDto updateDto);
        Task<bool> DeleteAsync(int id);

        // Consultas por sesión
        Task<IEnumerable<AsistenciaDto>> GetBySesionAsync(int sesionId);

        // Consultas por estudiante
        Task<IEnumerable<AsistenciaDto>> GetByEstudianteAsync(int estudianteId);
        Task<IEnumerable<AsistenciaDto>> GetByEstudianteGrupoCursoAsync(int estudianteId, int grupoCursoId);

        // Registrar asistencia masiva (toda la clase)
        Task<List<AsistenciaDto>> RegistrarAsistenciaGrupoAsync(RegistrarAsistenciaGrupoDto registroDto);

        // Reportes
        Task<ReporteAsistenciaEstudianteDto?> GetReporteEstudianteAsync(int estudianteId, int? grupoCursoId = null);
        Task<ReporteAsistenciaGrupoCursoDto?> GetReporteGrupoCursoAsync(int grupoCursoId, string? periodo = null);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<bool> YaRegistradaAsync(int sesionId, int estudianteId);

        // para el dashboard
        Task<AsistenciaDashboardDto> GetAsistenciaGlobalHoyAsync();
    }
}
using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IEstudianteService
    {
        // CRUD básico
        Task<IEnumerable<EstudianteDto>> GetAllAsync();
        Task<EstudianteDto?> GetByIdAsync(int id);
        Task<EstudianteDto?> GetByMatriculaAsync(string matricula);
        Task<EstudianteDto> CreateAsync(CreateEstudianteDto createDto);
        Task<EstudianteDto?> UpdateAsync(int id, UpdateEstudianteDto updateDto);
        Task<bool> DeleteAsync(int id);

        // Consultas específicas escolares
        Task<IEnumerable<EstudianteDto>> GetByGradoAsync(int grado);
        Task<IEnumerable<EstudianteDto>> GetByGradoSeccionAsync(int grado, string seccion);
        Task<EstudiantesPorGradoDto?> GetEstudiantesPorGradoSeccionAsync(int grado, string seccion);

        // Historial académico
        Task<EstudianteHistorialDto?> GetHistorialAsync(int id);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<bool> MatriculaExistsAsync(string matricula);

        //Genera la siguiente matrícula disponible en formato "2025-0001"
        Task<string> GenerarMatriculaAsync();
        //para la ia
        Task<int> GetTotalAsync();
        // Asignación masiva a aulas
        Task<ResultadoOperacionMasivaDto> BulkAssignToAulaAsync(int aulaId, List<int> estudianteIds);
        Task<ResultadoOperacionMasivaDto> BulkUnassignFromAulaAsync(List<int> estudianteIds);
    }
}
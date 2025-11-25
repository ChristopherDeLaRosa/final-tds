using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface ICursoService
    {
        // CRUD básico
        Task<IEnumerable<CursoDto>> GetAllAsync();
        Task<CursoDto?> GetByIdAsync(int id);
        Task<CursoDto?> GetByCodigoAsync(string codigo);
        Task<CursoDto> CreateAsync(CreateCursoDto createDto);
        Task<CursoDto?> UpdateAsync(int id, UpdateCursoDto updateDto);
        Task<bool> DeleteAsync(int id);

        // Consultas específicas escolares
        Task<IEnumerable<CursoDto>> GetByGradoAsync(int grado);
        Task<IEnumerable<CursoDto>> GetByNivelAsync(string nivel);
        Task<IEnumerable<CursoDto>> GetByAreaAsync(string area);

        // Catálogo para inscripción
        Task<IEnumerable<CursoPorGradoDto>> GetCursosPorGradoAsync(int grado, string periodo);

        // Agrupación por área de conocimiento
        Task<Dictionary<string, List<CursoDto>>> GetCursosPorAreaAsync(int grado);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<bool> CodigoExistsAsync(string codigo);
    }
}
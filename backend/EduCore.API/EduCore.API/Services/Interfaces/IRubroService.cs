using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IRubroService
    {
        // CRUD básico
        Task<IEnumerable<RubroDto>> GetAllAsync();
        Task<RubroDto?> GetByIdAsync(int id);
        Task<RubroDto> CreateAsync(CreateRubroDto createDto);
        Task<RubroDto?> UpdateAsync(int id, UpdateRubroDto updateDto);
        Task<bool> DeleteAsync(int id);

        // Consultas por grupo-curso
        Task<IEnumerable<RubroDto>> GetByGrupoCursoAsync(int grupoCursoId);
        Task<RubrosGrupoCursoDto?> GetRubrosGrupoCursoDetalleAsync(int grupoCursoId);

        // Crear rubros desde plantilla
        Task<List<RubroDto>> CrearRubrosPlantillaAsync(CrearRubrosPlantillaDto plantillaDto);

        // Validación de porcentajes
        Task<ValidacionRubrosDto> ValidarPorcentajesAsync(int grupoCursoId);

        // Reordenar rubros
        Task<bool> ReordenarRubrosAsync(int grupoCursoId, Dictionary<int, int> ordenamiento);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<bool> NombreExisteEnGrupoAsync(int grupoCursoId, string nombre, int? rubroId = null);
    }
}
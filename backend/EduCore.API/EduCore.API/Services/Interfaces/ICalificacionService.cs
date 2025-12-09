using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface ICalificacionService
    {
        // CRUD básico
        Task<CalificacionDto?> GetByIdAsync(int id);
        Task<CalificacionDto> CreateAsync(CreateCalificacionDto createDto);
        Task<CalificacionDto?> UpdateAsync(int id, UpdateCalificacionDto updateDto);
        Task<bool> DeleteAsync(int id);

        // Consultas por estudiante
        Task<IEnumerable<CalificacionDto>> GetByEstudianteAsync(int estudianteId);
        Task<IEnumerable<CalificacionDto>> GetByEstudianteGrupoCursoAsync(int estudianteId, int grupoCursoId);

        // Consultas por rubro
        Task<IEnumerable<CalificacionDto>> GetByRubroAsync(int rubroId);

        // Consultas por grupo
        Task<CalificacionesGrupoCursoDto?> GetCalificacionesGrupoCursoAsync(int grupoCursoId);

        // Registro masivo
        Task<List<CalificacionDto>> RegistrarCalificacionesGrupoAsync(RegistrarCalificacionesGrupoDto registroDto);

        // Boletín y reportes
        Task<BoletinEstudianteDto?> GetBoletinEstudianteAsync(int estudianteId, string periodo);
        Task<EstadisticasCalificacionesDto?> GetEstadisticasGrupoCursoAsync(int grupoCursoId);

        // Cálculo de promedios
        Task<decimal?> CalcularPromedioGrupoCursoAsync(int estudianteId, int grupoCursoId);
        Task ActualizarPromediosInscripcionAsync(int estudianteId, int grupoCursoId);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<bool> YaRegistradaAsync(int estudianteId, int rubroId);
        //para el dashboard
        Task<RendimientoDashboardDto> GetEstadisticasGeneralesAsync();
    }
}
using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IAulaService
    {
        // CRUD Básico de Aulas
        Task<IEnumerable<AulaDto>> GetAllAsync();
        Task<AulaDto?> GetByIdAsync(int id);
        Task<AulaDetalleDto?> GetDetalleByIdAsync(int id);
        Task<AulaDto?> GetByGradoSeccionPeriodoAsync(int grado, string seccion, string periodo);
        Task<IEnumerable<AulaDto>> GetByPeriodoAsync(string periodo);
        Task<AulaDto> CreateAsync(CreateAulaDto createDto);
        Task<AulaDto?> UpdateAsync(int id, UpdateAulaDto updateDto);
        Task<bool> DeleteAsync(int id);

        // Gestión de Horarios
        Task<IEnumerable<HorarioAulaDto>> GetHorariosAulaAsync(int aulaId);
        Task<HorarioAulaDto> CreateHorarioAsync(CreateHorarioAulaDto createDto);
        Task<HorarioAulaDto?> UpdateHorarioAsync(int horarioId, UpdateHorarioAulaDto updateDto);
        Task<bool> DeleteHorarioAsync(int horarioId);
        Task<ResultadoConfiguracionAulaDto> ConfigurarHorarioCompletoAsync(ConfigurarHorarioCompletoDto configDto);

        // Auto-generación de Grupos y Sesiones
        Task<ResultadoConfiguracionAulaDto> GenerarGruposCursosDesdeHorarioAsync(int aulaId);
        Task<ResultadoConfiguracionAulaDto> GenerarSesionesParaAulaAsync(int aulaId);

        // Gestión de Estudiantes
        Task<bool> AsignarEstudianteAsync(int estudianteId, int aulaId);
        Task<bool> RemoverEstudianteAsync(int estudianteId);
        Task<ResultadoInscripcionMasivaDto> InscribirEstudiantesEnAulaAsync(int aulaId, List<int> estudiantesIds);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<bool> TieneCupoAsync(int aulaId);
        Task<bool> ExisteConflictoHorarioAsync(int aulaId, DayOfWeek dia, TimeSpan horaInicio, TimeSpan horaFin, int? horarioId = null);
    }
}
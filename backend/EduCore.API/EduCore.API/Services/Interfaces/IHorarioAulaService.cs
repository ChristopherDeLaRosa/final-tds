using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IHorarioAulaService
    {
        // Consultas
        Task<IEnumerable<HorarioAulaDto>> GetHorariosAulaAsync(int aulaId);
        Task<HorarioAulaDto?> GetHorarioByIdAsync(int horarioId);

        // CRUD de horarios individuales
        Task<HorarioAulaDto> CreateHorarioAsync(CreateHorarioAulaDto createDto);
        Task<HorarioAulaDto?> UpdateHorarioAsync(int horarioId, UpdateHorarioAulaDto updateDto);
        Task<bool> DeleteHorarioAsync(int horarioId);

        // Configuración completa
        Task<ResultadoConfiguracionAulaDto> ConfigurarHorarioCompletoAsync(
            ConfigurarHorarioCompletoDto configDto);

        // Auto-generación desde horarios
        Task<ResultadoConfiguracionAulaDto> GenerarGruposCursosDesdeHorarioAsync(int aulaId);
        Task<ResultadoConfiguracionAulaDto> GenerarSesionesParaAulaAsync(int aulaId);

        // Validaciones
        Task<bool> ExisteConflictoHorarioAsync(
            int aulaId,
            DayOfWeek dia,
            TimeSpan horaInicio,
            TimeSpan horaFin,
            int? horarioId = null);

        Task<bool> ExistsAsync(int horarioId);
    }
}

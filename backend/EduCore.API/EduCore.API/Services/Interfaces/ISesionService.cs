using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface ISesionService
    {
        // CRUD básico
        Task<SesionDto?> GetByIdAsync(int id);
        Task<SesionDetalleDto?> GetDetalleByIdAsync(int id);
        Task<SesionDto> CreateAsync(CreateSesionDto createDto);
        Task<SesionDto?> UpdateAsync(int id, UpdateSesionDto updateDto);
        Task<bool> DeleteAsync(int id);

        // Consultas por grupo-curso
        Task<IEnumerable<SesionDto>> GetByGrupoCursoAsync(int grupoCursoId);
        Task<IEnumerable<SesionDto>> GetByGrupoCursoFechasAsync(
            int grupoCursoId,
            DateTime fechaInicio,
            DateTime fechaFin);

        // Consultas por fecha
        Task<IEnumerable<SesionDto>> GetByFechaAsync(DateTime fecha);
        Task<IEnumerable<SesionDto>> GetByRangoFechasAsync(DateTime fechaInicio, DateTime fechaFin);

        // Consultas por docente
        Task<IEnumerable<SesionDto>> GetByDocenteAsync(int docenteId, DateTime? fecha = null);

        // Sesiones recurrentes
        Task<List<SesionDto>> CrearSesionesRecurrentesAsync(CrearSesionesRecurrentesDto recurrenteDto);

        // Marcar sesión como realizada
        Task<SesionDto?> MarcarComoRealizadaAsync(int id);

        // Horarios y calendarios
        Task<HorarioSemanalGrupoDto?> GetHorarioSemanalAsync(int grupoCursoId, DateTime fecha);
        Task<CalendarioMensualDto> GetCalendarioMensualAsync(int grado, string seccion, int anio, int mes);

        // Estadísticas
        Task<EstadisticasSesionesDto?> GetEstadisticasGrupoCursoAsync(int grupoCursoId, string? periodo = null);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<bool> ExisteConflictoHorarioAsync(int grupoCursoId, DateTime fecha, TimeSpan horaInicio, TimeSpan horaFin, int? sesionId = null);
    }
}
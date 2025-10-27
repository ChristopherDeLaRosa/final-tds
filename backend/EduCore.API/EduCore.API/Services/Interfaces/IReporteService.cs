using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IReporteService
    {
        Task<ReporteNotasSeccionDto?> GenerarReporteNotasSeccionAsync(int seccionId);
        Task<ReporteAsistenciaSeccionDto?> GenerarReporteAsistenciaSeccionAsync(int seccionId);
        Task<ReporteRendimientoEstudianteDto?> GenerarReporteRendimientoEstudianteAsync(int estudianteId);
        Task<ReporteEstadisticasGeneralesDto> GenerarEstadisticasGeneralesAsync(string? periodo = null);
        Task<ReporteRankingEstudiantesDto> GenerarRankingEstudiantesAsync(string periodo);
    }
}


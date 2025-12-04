using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IPeriodoService
    {
        // CRUD básico
        Task<IEnumerable<PeriodoDto>> GetAllAsync();
        Task<PeriodoDto?> GetByIdAsync(int id);
        Task<PeriodoDto?> GetPeriodoActualAsync();
        Task<PeriodoDto> CreateAsync(CreatePeriodoDto createDto);
        Task<PeriodoDto?> UpdateAsync(int id, UpdatePeriodoDto updateDto);
        Task<bool> DeleteAsync(int id);

        // Operaciones específicas
        Task<bool> SetPeriodoActualAsync(int id);
        Task<IEnumerable<PeriodoDto>> GetByAnioEscolarAsync(string anioEscolar);
        Task<PeriodoDto?> GetPeriodoByFechaAsync(DateTime fecha);

        // Reportes y estadísticas
        Task<ResumenPeriodoDto?> GetResumenPeriodoAsync(int periodoId);
        Task<List<ComparacionTrimestreDto>> GetComparacionTrimestresPorAnioAsync(string anioEscolar);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<bool> TieneSolapamientoAsync(DateTime fechaInicio, DateTime fechaFin, int? periodoIdExcluir = null);
        Task<bool> PuedeEliminarAsync(int id);

        // Utilidades
        Task<bool> CerrarPeriodoAsync(int id);
        Task<bool> AbrirPeriodoAsync(int id);
    }
}
using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IDocenteService
    {
        // CRUD básico
        Task<IEnumerable<DocenteDto>> GetAllAsync();
        Task<IEnumerable<DocenteDto>> GetAllActivosAsync();
        Task<DocenteDto?> GetByIdAsync(int id);
        Task<DocenteDetalleDto?> GetDetalleByIdAsync(int id);
        Task<DocenteDto> CreateAsync(CreateDocenteDto createDto);
        Task<DocenteDto?> UpdateAsync(int id, UpdateDocenteDto updateDto);
        Task<bool> DeleteAsync(int id);

        // Búsqueda y filtros
        Task<IEnumerable<DocenteDto>> SearchAsync(DocenteFiltrosDto filtros);
        Task<DocenteDto?> GetByCodigoAsync(string codigo);
        Task<IEnumerable<DocenteDto>> GetByEspecialidadAsync(string especialidad);

        // Horario y sesiones
        Task<HorarioDocenteDto?> GetHorarioSemanalAsync(int docenteId, DateTime fecha);
        Task<IEnumerable<SesionDto>> GetSesionesAsync(int docenteId, DateTime? fecha = null);

        // Grupos asignados
        Task<IEnumerable<GrupoCursoDto>> GetGruposAsignadosAsync(int docenteId, string? periodo = null);
        Task<CargaAcademicaDocenteDto?> GetCargaAcademicaAsync(int docenteId, string periodo);

        // Estadísticas
        Task<EstadisticasDocenteDto?> GetEstadisticasAsync(int docenteId, string periodo);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<bool> CodigoExisteAsync(string codigo, int? docenteId = null);
        Task<bool> EmailExisteAsync(string email, int? docenteId = null);

        /// Genera el siguiente código disponible en formato DOC-NNN
        Task<string> GenerarCodigoAsync();
    }
}
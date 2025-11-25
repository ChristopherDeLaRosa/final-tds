using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IGrupoCursoService
    {
        // CRUD básico
        Task<IEnumerable<GrupoCursoDto>> GetAllAsync();
        Task<GrupoCursoDto?> GetByIdAsync(int id);
        Task<GrupoCursoDetalleDto?> GetDetalleByIdAsync(int id);
        Task<GrupoCursoDto> CreateAsync(CreateGrupoCursoDto createDto);
        Task<GrupoCursoDto?> UpdateAsync(int id, UpdateGrupoCursoDto updateDto);
        Task<bool> DeleteAsync(int id);

        // Consultas específicas escolares
        Task<IEnumerable<GrupoCursoDto>> GetByPeriodoAsync(string periodo);
        Task<IEnumerable<GrupoCursoDto>> GetByGradoSeccionAsync(int grado, string seccion, string periodo);
        Task<IEnumerable<GrupoCursoDto>> GetByCursoAsync(int cursoId);
        Task<IEnumerable<GrupoCursoDto>> GetByDocenteAsync(int docenteId);

        // Horarios
        Task<HorarioGradoDto?> GetHorarioByGradoSeccionAsync(int grado, string seccion, string periodo);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<bool> CodigoExistsAsync(string codigo);
    }
}


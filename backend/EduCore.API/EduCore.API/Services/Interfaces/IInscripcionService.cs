using EduCore.API.DTOs;

namespace EduCore.API.Services.Interfaces
{
    public interface IInscripcionService
    {
        // CRUD básico
        Task<InscripcionDto?> GetByIdAsync(int id);
        Task<InscripcionDetalleDto?> GetDetalleByIdAsync(int id);
        Task<InscripcionDto> CreateAsync(CreateInscripcionDto createDto);
        Task<InscripcionDto?> UpdateAsync(int id, UpdateInscripcionDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<InscripcionDto>> GetAllAsync(
        string? periodo = null,
        int? grado = null,
        string? seccion = null,
        string? estado = null);
        // Consultas por estudiante
        Task<IEnumerable<InscripcionDto>> GetByEstudianteAsync(int estudianteId);
        Task<HorarioEstudianteDto?> GetHorarioEstudianteAsync(int estudianteId, string periodo);

        // Consultas por grupo-curso
        Task<IEnumerable<InscripcionDto>> GetByGrupoCursoAsync(int grupoCursoId);
        Task<ListaEstudiantesGrupoDto?> GetListaEstudiantesGrupoAsync(int grupoCursoId);

        // Inscripción masiva
        Task<ResultadoInscripcionMasivaDto> InscribirEstudianteCompletoAsync(
            InscripcionMasivaEstudianteDto inscripcionDto);
        Task<ResultadoInscripcionMasivaDto> InscribirGrupoCompletoAsync(
            InscripcionMasivaGrupoDto inscripcionDto);
        Task<ResultadoInscripcionMasivaDto> InscribirGradoSeccionCompletoAsync(
            InscripcionMasivaGradoSeccionDto inscripcionDto);

        // Retirar estudiante
        Task<InscripcionDto?> RetirarEstudianteAsync(int inscripcionId, string motivo);

        // Estadísticas
        Task<EstadisticasInscripcionesDto> GetEstadisticasAsync(string periodo);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<bool> YaInscritoAsync(int estudianteId, int grupoCursoId);
        Task<bool> GrupoTieneCupoAsync(int grupoCursoId);

    }
}
using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class PeriodoService : IPeriodoService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<PeriodoService> _logger;

        public PeriodoService(EduCoreDbContext context, ILogger<PeriodoService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<PeriodoDto>> GetAllAsync()
        {
            var periodos = await _context.Periodos
                .Where(p => p.Activo)
                .OrderByDescending(p => p.FechaInicio)
                .ToListAsync();

            var periodosDto = new List<PeriodoDto>();

            foreach (var periodo in periodos)
            {
                var totalGrupos = await _context.GruposCursos
                    .CountAsync(g => g.PeriodoId == periodo.Id && g.Activo);

                periodosDto.Add(MapToDto(periodo, totalGrupos));
            }

            return periodosDto;
        }

        public async Task<PeriodoDto?> GetByIdAsync(int id)
        {
            var periodo = await _context.Periodos.FindAsync(id);

            if (periodo == null)
                return null;

            var totalGrupos = await _context.GruposCursos
                .CountAsync(g => g.PeriodoId == periodo.Id && g.Activo);

            return MapToDto(periodo, totalGrupos);
        }

        public async Task<PeriodoDto?> GetPeriodoActualAsync()
        {
            var periodo = await _context.Periodos
                .FirstOrDefaultAsync(p => p.EsActual && p.Activo);

            if (periodo == null)
                return null;

            var totalGrupos = await _context.GruposCursos
                .CountAsync(g => g.PeriodoId == periodo.Id && g.Activo);

            return MapToDto(periodo, totalGrupos);
        }

        public async Task<PeriodoDto> CreateAsync(CreatePeriodoDto createDto)
        {
            // Validar fechas
            if (createDto.FechaFin <= createDto.FechaInicio)
            {
                throw new InvalidOperationException("La fecha de fin debe ser posterior a la fecha de inicio");
            }

            // Validar solapamiento
            var tieneSolapamiento = await TieneSolapamientoAsync(
                createDto.FechaInicio,
                createDto.FechaFin
            );

            if (tieneSolapamiento)
            {
                throw new InvalidOperationException(
                    "Ya existe un período que se solapa con las fechas indicadas"
                );
            }

            var periodo = new Periodo
            {
                Nombre = createDto.Nombre,
                Trimestre = createDto.Trimestre,
                FechaInicio = createDto.FechaInicio,
                FechaFin = createDto.FechaFin,
                Observaciones = createDto.Observaciones,
                EsActual = false,
                Activo = true
            };

            _context.Periodos.Add(periodo);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Período creado: {Nombre} - Trimestre: {Trimestre}",
                periodo.Nombre, periodo.Trimestre
            );

            return MapToDto(periodo, 0);
        }

        public async Task<PeriodoDto?> UpdateAsync(int id, UpdatePeriodoDto updateDto)
        {
            var periodo = await _context.Periodos.FindAsync(id);

            if (periodo == null)
                return null;

            // Validar fechas
            if (updateDto.FechaFin <= updateDto.FechaInicio)
            {
                throw new InvalidOperationException("La fecha de fin debe ser posterior a la fecha de inicio");
            }

            // Validar solapamiento (excluyendo el período actual)
            var tieneSolapamiento = await TieneSolapamientoAsync(
                updateDto.FechaInicio,
                updateDto.FechaFin,
                id
            );

            if (tieneSolapamiento)
            {
                throw new InvalidOperationException(
                    "Ya existe un período que se solapa con las fechas indicadas"
                );
            }

            periodo.Nombre = updateDto.Nombre;
            periodo.FechaInicio = updateDto.FechaInicio;
            periodo.FechaFin = updateDto.FechaFin;
            periodo.Observaciones = updateDto.Observaciones;
            periodo.Activo = updateDto.Activo;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Período actualizado: {Id}", id);

            var totalGrupos = await _context.GruposCursos
                .CountAsync(g => g.PeriodoId == periodo.Id && g.Activo);

            return MapToDto(periodo, totalGrupos);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var periodo = await _context.Periodos.FindAsync(id);

            if (periodo == null)
                return false;

            // Verificar si puede eliminar
            var puedeEliminar = await PuedeEliminarAsync(id);

            if (!puedeEliminar)
            {
                _logger.LogWarning(
                    "No se puede eliminar el período {Id} porque tiene grupos asociados",
                    id
                );
                return false;
            }

            // Soft delete
            periodo.Activo = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Período eliminado (soft delete): {Id}", id);

            return true;
        }

        public async Task<bool> SetPeriodoActualAsync(int id)
        {
            var periodo = await _context.Periodos.FindAsync(id);

            if (periodo == null || !periodo.Activo)
                return false;

            // Desactivar todos los demás períodos actuales
            var periodosActuales = await _context.Periodos
                .Where(p => p.EsActual && p.Id != id)
                .ToListAsync();

            foreach (var p in periodosActuales)
            {
                p.EsActual = false;
            }

            // Activar el período seleccionado
            periodo.EsActual = true;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Período establecido como actual: {Id} - {Nombre}", id, periodo.Nombre);

            return true;
        }

        public async Task<IEnumerable<PeriodoDto>> GetByAnioEscolarAsync(string anioEscolar)
        {
            var periodos = await _context.Periodos
                .Where(p => p.Nombre == anioEscolar && p.Activo)
                .OrderBy(p => p.FechaInicio)
                .ToListAsync();

            var periodosDto = new List<PeriodoDto>();

            foreach (var periodo in periodos)
            {
                var totalGrupos = await _context.GruposCursos
                    .CountAsync(g => g.PeriodoId == periodo.Id && g.Activo);

                periodosDto.Add(MapToDto(periodo, totalGrupos));
            }

            return periodosDto;
        }

        public async Task<PeriodoDto?> GetPeriodoByFechaAsync(DateTime fecha)
        {
            var periodo = await _context.Periodos
                .FirstOrDefaultAsync(p =>
                    p.Activo &&
                    fecha >= p.FechaInicio &&
                    fecha <= p.FechaFin
                );

            if (periodo == null)
                return null;

            var totalGrupos = await _context.GruposCursos
                .CountAsync(g => g.PeriodoId == periodo.Id && g.Activo);

            return MapToDto(periodo, totalGrupos);
        }

        public async Task<ResumenPeriodoDto?> GetResumenPeriodoAsync(int periodoId)
        {
            var periodo = await _context.Periodos.FindAsync(periodoId);

            if (periodo == null)
                return null;

            // Obtener todos los grupos del período
            var gruposCursos = await _context.GruposCursos
                .Where(g => g.PeriodoId == periodo.Id && g.Activo)
                .ToListAsync();

            var grupoIds = gruposCursos.Select(g => g.Id).ToList();

            // Obtener inscripciones del período
            var inscripciones = await _context.Inscripciones
                .Where(i => grupoIds.Contains(i.GrupoCursoId) && i.Activo)
                .ToListAsync();

            var totalEstudiantes = inscripciones.Select(i => i.EstudianteId).Distinct().Count();
            var totalCursos = gruposCursos.Select(g => g.CursoId).Distinct().Count();

            // Calcular estadísticas de calificaciones
            var promedios = inscripciones
                .Where(i => i.PromedioFinal.HasValue)
                .Select(i => i.PromedioFinal!.Value)
                .ToList();

            var promedioGeneral = promedios.Any() ? Math.Round(promedios.Average(), 2) : 0;
            var aprobados = inscripciones.Count(i => i.Estado == "Aprobado");
            var reprobados = inscripciones.Count(i => i.Estado == "Reprobado");

            var porcentajeAprobacion = totalEstudiantes > 0
                ? Math.Round((decimal)aprobados / inscripciones.Count * 100, 2)
                : 0;

            var estado = DeterminarEstadoPeriodo(periodo.FechaInicio, periodo.FechaFin, periodo.EsActual);

            return new ResumenPeriodoDto
            {
                Id = periodo.Id,
                Nombre = periodo.Nombre,
                Trimestre = periodo.Trimestre,
                EsActual = periodo.EsActual,
                Estado = estado,
                TotalEstudiantes = totalEstudiantes,
                TotalCursos = totalCursos,
                PromedioGeneral = promedioGeneral,
                EstudiantesAprobados = aprobados,
                EstudiantesReprobados = reprobados,
                PorcentajeAprobacion = porcentajeAprobacion
            };
        }

        public async Task<List<ComparacionTrimestreDto>> GetComparacionTrimestresPorAnioAsync(string anioEscolar)
        {
            var periodos = await _context.Periodos
                .Where(p => p.Nombre == anioEscolar && p.Activo)
                .OrderBy(p => p.FechaInicio)
                .ToListAsync();

            var comparaciones = new List<ComparacionTrimestreDto>();

            foreach (var periodo in periodos)
            {
                var gruposCursos = await _context.GruposCursos
                    .Include(g => g.Curso)
                    .Where(g => g.PeriodoId == periodo.Id && g.Activo)
                    .ToListAsync();

                var grupoIds = gruposCursos.Select(g => g.Id).ToList();

                var inscripciones = await _context.Inscripciones
                    .Where(i => grupoIds.Contains(i.GrupoCursoId) && i.Activo)
                    .ToListAsync();

                var promedios = inscripciones
                    .Where(i => i.PromedioFinal.HasValue)
                    .Select(i => i.PromedioFinal!.Value)
                    .ToList();

                var promedioGeneral = promedios.Any() ? Math.Round(promedios.Average(), 2) : 0;
                var aprobados = inscripciones.Count(i => i.Estado == "Aprobado");
                var porcentajeAprobacion = inscripciones.Count > 0
                    ? Math.Round((decimal)aprobados / inscripciones.Count * 100, 2)
                    : 0;

                comparaciones.Add(new ComparacionTrimestreDto
                {
                    Trimestre = periodo.Trimestre,
                    PromedioGeneral = promedioGeneral,
                    PorcentajeAprobacion = porcentajeAprobacion,
                    TotalEstudiantes = inscripciones.Select(i => i.EstudianteId).Distinct().Count(),
                    Cursos = new List<ComparacionCursoDto>()
                });
            }

            return comparaciones;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Periodos.AnyAsync(p => p.Id == id);
        }

        public async Task<bool> TieneSolapamientoAsync(
            DateTime fechaInicio,
            DateTime fechaFin,
            int? periodoIdExcluir = null)
        {
            var query = _context.Periodos
                .Where(p => p.Activo);

            if (periodoIdExcluir.HasValue)
            {
                query = query.Where(p => p.Id != periodoIdExcluir.Value);
            }

            return await query.AnyAsync(p =>
                (fechaInicio >= p.FechaInicio && fechaInicio <= p.FechaFin) ||
                (fechaFin >= p.FechaInicio && fechaFin <= p.FechaFin) ||
                (fechaInicio <= p.FechaInicio && fechaFin >= p.FechaFin)
            );
        }

        public async Task<bool> PuedeEliminarAsync(int id)
        {
            var periodo = await _context.Periodos.FindAsync(id);

            if (periodo == null)
                return false;

            // Verificar si tiene grupos asociados
            var tieneGrupos = await _context.GruposCursos
                .AnyAsync(g => g.PeriodoId == periodo.Id);

            return !tieneGrupos;
        }

        public async Task<bool> CerrarPeriodoAsync(int id)
        {
            var periodo = await _context.Periodos.FindAsync(id);

            if (periodo == null)
                return false;

            periodo.EsActual = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Período cerrado: {Id} - {Nombre}", id, periodo.Nombre);

            return true;
        }

        public async Task<bool> AbrirPeriodoAsync(int id)
        {
            return await SetPeriodoActualAsync(id);
        }

        private PeriodoDto MapToDto(Periodo periodo, int totalGrupos)
        {
            var diasRestantes = (periodo.FechaFin - DateTime.UtcNow).Days;
            var estado = DeterminarEstadoPeriodo(periodo.FechaInicio, periodo.FechaFin, periodo.EsActual);

            return new PeriodoDto
            {
                Id = periodo.Id,
                Nombre = periodo.Nombre,
                Trimestre = periodo.Trimestre,
                FechaInicio = periodo.FechaInicio,
                FechaFin = periodo.FechaFin,
                EsActual = periodo.EsActual,
                Activo = periodo.Activo,
                Observaciones = periodo.Observaciones,
                TotalGrupos = totalGrupos,
                DiasRestantes = diasRestantes > 0 ? diasRestantes : 0,
                Estado = estado
            };
        }

        private string DeterminarEstadoPeriodo(DateTime fechaInicio, DateTime fechaFin, bool esActual)
        {
            var ahora = DateTime.UtcNow;

            if (esActual && ahora >= fechaInicio && ahora <= fechaFin)
                return "Activo";

            if (ahora > fechaFin)
                return "Finalizado";

            if (ahora < fechaInicio)
                return "Próximo";

            return "Inactivo";
        }
    }
}
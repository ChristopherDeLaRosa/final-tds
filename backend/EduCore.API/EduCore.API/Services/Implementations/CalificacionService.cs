using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class CalificacionService : ICalificacionService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<CalificacionService> _logger;

        public CalificacionService(EduCoreDbContext context, ILogger<CalificacionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<CalificacionDto>> GetAllAsync()
        {
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Estudiante)
                .Include(c => c.Rubro)
                .OrderByDescending(c => c.FechaRegistro)
                .ToListAsync();

            return calificaciones.Select(c => MapToDto(c));
        }

        public async Task<CalificacionDto?> GetByIdAsync(int id)
        {
            var calificacion = await _context.Calificaciones
                .Include(c => c.Estudiante)
                .Include(c => c.Rubro)
                .FirstOrDefaultAsync(c => c.Id == id);

            return calificacion != null ? MapToDto(calificacion) : null;
        }

        public async Task<IEnumerable<CalificacionDto>> GetByEstudianteAsync(int estudianteId)
        {
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Estudiante)
                .Include(c => c.Rubro)
                .Where(c => c.EstudianteId == estudianteId)
                .OrderByDescending(c => c.FechaRegistro)
                .ToListAsync();

            return calificaciones.Select(c => MapToDto(c));
        }

        public async Task<IEnumerable<CalificacionDto>> GetByRubroAsync(int rubroId)
        {
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Estudiante)
                .Include(c => c.Rubro)
                .Where(c => c.RubroId == rubroId)
                .OrderBy(c => c.Estudiante.Apellidos)
                .ThenBy(c => c.Estudiante.Nombres)
                .ToListAsync();

            return calificaciones.Select(c => MapToDto(c));
        }

        public async Task<IEnumerable<CalificacionDto>> GetBySeccionAsync(int seccionId)
        {
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Estudiante)
                .Include(c => c.Rubro)
                .Where(c => c.Rubro.SeccionId == seccionId)
                .OrderBy(c => c.Estudiante.Apellidos)
                .ThenBy(c => c.Estudiante.Nombres)
                .ThenBy(c => c.Rubro.Orden)
                .ToListAsync();

            return calificaciones.Select(c => MapToDto(c));
        }

        public async Task<CalificacionDto> CreateAsync(CreateCalificacionDto createDto, int usuarioId)
        {
            var calificacion = new Calificacion
            {
                EstudianteId = createDto.EstudianteId,
                RubroId = createDto.RubroId,
                Nota = createDto.Nota,
                Observaciones = createDto.Observaciones,
                FechaRegistro = DateTime.UtcNow,
                UsuarioModificacionId = usuarioId
            };

            _context.Calificaciones.Add(calificacion);
            await _context.SaveChangesAsync();

            // Actualizar promedio final del estudiante
            var rubro = await _context.Rubros.FindAsync(createDto.RubroId);
            if (rubro != null)
            {
                await ActualizarPromedioFinalAsync(rubro.SeccionId, createDto.EstudianteId);
            }

            // Recargar con relaciones
            await _context.Entry(calificacion)
                .Reference(c => c.Estudiante)
                .LoadAsync();
            await _context.Entry(calificacion)
                .Reference(c => c.Rubro)
                .LoadAsync();

            _logger.LogInformation("Calificación creada para estudiante {EstudianteId} en rubro {RubroId}",
                createDto.EstudianteId, createDto.RubroId);

            return MapToDto(calificacion);
        }

        public async Task<CalificacionDto?> UpdateAsync(int id, UpdateCalificacionDto updateDto, int usuarioId)
        {
            var calificacion = await _context.Calificaciones
                .Include(c => c.Estudiante)
                .Include(c => c.Rubro)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (calificacion == null)
                return null;

            calificacion.Nota = updateDto.Nota;
            calificacion.Observaciones = updateDto.Observaciones;
            calificacion.FechaModificacion = DateTime.UtcNow;
            calificacion.UsuarioModificacionId = usuarioId;

            await _context.SaveChangesAsync();

            // Actualizar promedio final
            await ActualizarPromedioFinalAsync(calificacion.Rubro.SeccionId, calificacion.EstudianteId);

            _logger.LogInformation("Calificación actualizada: {Id}", id);

            return MapToDto(calificacion);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var calificacion = await _context.Calificaciones
                .Include(c => c.Rubro)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (calificacion == null)
                return false;

            var seccionId = calificacion.Rubro.SeccionId;
            var estudianteId = calificacion.EstudianteId;

            _context.Calificaciones.Remove(calificacion);
            await _context.SaveChangesAsync();

            // Actualizar promedio final
            await ActualizarPromedioFinalAsync(seccionId, estudianteId);

            _logger.LogInformation("Calificación eliminada: {Id}", id);

            return true;
        }

        public async Task<bool> CargaMasivaAsync(int rubroId, CargaCalificacionesDto cargaDto, int usuarioId)
        {
            var rubro = await _context.Rubros.FindAsync(rubroId);
            if (rubro == null)
                return false;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var calificacionDto in cargaDto.Calificaciones)
                {
                    // Verificar si ya existe una calificación
                    var existente = await _context.Calificaciones
                        .FirstOrDefaultAsync(c => c.EstudianteId == calificacionDto.EstudianteId && c.RubroId == rubroId);

                    if (existente != null)
                    {
                        // Actualizar
                        existente.Nota = calificacionDto.Nota;
                        existente.Observaciones = calificacionDto.Observaciones;
                        existente.FechaModificacion = DateTime.UtcNow;
                        existente.UsuarioModificacionId = usuarioId;
                    }
                    else
                    {
                        // Crear nueva
                        var nueva = new Calificacion
                        {
                            EstudianteId = calificacionDto.EstudianteId,
                            RubroId = rubroId,
                            Nota = calificacionDto.Nota,
                            Observaciones = calificacionDto.Observaciones,
                            FechaRegistro = DateTime.UtcNow,
                            UsuarioModificacionId = usuarioId
                        };
                        _context.Calificaciones.Add(nueva);
                    }

                    // Actualizar promedio final
                    await ActualizarPromedioFinalAsync(rubro.SeccionId, calificacionDto.EstudianteId);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Carga masiva de calificaciones completada para rubro {RubroId}. Total: {Total}",
                    rubroId, cargaDto.Calificaciones.Count);

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error en carga masiva de calificaciones para rubro {RubroId}", rubroId);
                return false;
            }
        }

        public async Task<PromedioEstudianteDto?> GetPromedioEstudianteAsync(int seccionId, int estudianteId)
        {
            var estudiante = await _context.Estudiantes.FindAsync(estudianteId);
            if (estudiante == null)
                return null;

            var rubros = await _context.Rubros
                .Where(r => r.SeccionId == seccionId && r.Activo)
                .OrderBy(r => r.Orden)
                .ToListAsync();

            var calificaciones = await _context.Calificaciones
                .Where(c => c.EstudianteId == estudianteId && c.Rubro.SeccionId == seccionId)
                .Include(c => c.Rubro)
                .ToListAsync();

            var notas = new List<NotaRubroDto>();
            decimal sumaNotas = 0;
            decimal sumaPorcentajes = 0;

            foreach (var rubro in rubros)
            {
                var calificacion = calificaciones.FirstOrDefault(c => c.RubroId == rubro.Id);
                decimal? notaPonderada = null;

                if (calificacion != null)
                {
                    notaPonderada = calificacion.Nota * (rubro.Porcentaje / 100);
                    sumaNotas += notaPonderada.Value;
                    sumaPorcentajes += rubro.Porcentaje;
                }

                notas.Add(new NotaRubroDto
                {
                    NombreRubro = rubro.Nombre,
                    Porcentaje = rubro.Porcentaje,
                    Nota = calificacion?.Nota,
                    NotaPonderada = notaPonderada
                });
            }

            var promedioFinal = Math.Round(sumaNotas, 2);
            var estado = sumaPorcentajes < 100 ? "Pendiente" : promedioFinal >= 70 ? "Aprobado" : "Reprobado";

            return new PromedioEstudianteDto
            {
                SeccionId = seccionId,
                EstudianteId = estudianteId,
                Matricula = estudiante.Matricula,
                NombreCompleto = $"{estudiante.Nombres} {estudiante.Apellidos}",
                Notas = notas,
                PromedioFinal = promedioFinal,
                Estado = estado
            };
        }

        public async Task<ActaCalificacionesDto?> GenerarActaAsync(int seccionId)
        {
            var seccion = await _context.Secciones
                .Include(s => s.Curso)
                .Include(s => s.Docente)
                .Include(s => s.Inscripciones)
                    .ThenInclude(i => i.Estudiante)
                .FirstOrDefaultAsync(s => s.Id == seccionId);

            if (seccion == null)
                return null;

            var rubros = await _context.Rubros
                .Where(r => r.SeccionId == seccionId && r.Activo)
                .OrderBy(r => r.Orden)
                .ToListAsync();

            var estudiantes = new List<EstudianteCalificacionesDto>();

            foreach (var inscripcion in seccion.Inscripciones.Where(i => i.Activo))
            {
                var promedio = await GetPromedioEstudianteAsync(seccionId, inscripcion.EstudianteId);
                if (promedio == null) continue;

                var notasPorRubro = new Dictionary<string, decimal?>();
                foreach (var nota in promedio.Notas)
                {
                    notasPorRubro[nota.NombreRubro] = nota.Nota;
                }

                estudiantes.Add(new EstudianteCalificacionesDto
                {
                    EstudianteId = inscripcion.EstudianteId,
                    Matricula = inscripcion.Estudiante.Matricula,
                    NombreCompleto = $"{inscripcion.Estudiante.Nombres} {inscripcion.Estudiante.Apellidos}",
                    NotasPorRubro = notasPorRubro,
                    PromedioFinal = promedio.PromedioFinal,
                    Estado = promedio.Estado
                });
            }

            return new ActaCalificacionesDto
            {
                SeccionId = seccionId,
                CodigoSeccion = seccion.Codigo,
                CodigoCurso = seccion.Curso.Codigo,
                NombreCurso = seccion.Curso.Nombre,
                Periodo = seccion.Periodo,
                Docente = $"{seccion.Docente.Nombres} {seccion.Docente.Apellidos}",
                FechaGeneracion = DateTime.UtcNow,
                Rubros = rubros.Select(r => new RubroDto
                {
                    Id = r.Id,
                    SeccionId = r.SeccionId,
                    Nombre = r.Nombre,
                    Descripcion = r.Descripcion,
                    Porcentaje = r.Porcentaje,
                    Orden = r.Orden,
                    Activo = r.Activo
                }).ToList(),
                Estudiantes = estudiantes
            };
        }

        public async Task<bool> ActualizarPromedioFinalAsync(int seccionId, int estudianteId)
        {
            var inscripcion = await _context.Inscripciones
                .FirstOrDefaultAsync(i => i.SeccionId == seccionId && i.EstudianteId == estudianteId);

            if (inscripcion == null)
                return false;

            var promedio = await GetPromedioEstudianteAsync(seccionId, estudianteId);
            if (promedio == null)
                return false;

            inscripcion.PromedioFinal = promedio.PromedioFinal;
            inscripcion.Estado = promedio.Estado == "Aprobado" ? "Completado" :
                                promedio.Estado == "Reprobado" ? "Completado" : "Activo";

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Calificaciones.AnyAsync(c => c.Id == id);
        }

        private CalificacionDto MapToDto(Calificacion calificacion)
        {
            return new CalificacionDto
            {
                Id = calificacion.Id,
                EstudianteId = calificacion.EstudianteId,
                MatriculaEstudiante = calificacion.Estudiante.Matricula,
                NombreEstudiante = $"{calificacion.Estudiante.Nombres} {calificacion.Estudiante.Apellidos}",
                RubroId = calificacion.RubroId,
                NombreRubro = calificacion.Rubro.Nombre,
                Nota = calificacion.Nota,
                Observaciones = calificacion.Observaciones,
                FechaRegistro = calificacion.FechaRegistro,
                FechaModificacion = calificacion.FechaModificacion
            };
        }
    }
}


using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class AsistenciaService : IAsistenciaService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<AsistenciaService> _logger;

        public AsistenciaService(EduCoreDbContext context, ILogger<AsistenciaService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<AsistenciaDto>> GetAllAsync()
        {
            var asistencias = await _context.Asistencias
                .Include(a => a.Sesion)
                .Include(a => a.Estudiante)
                .OrderByDescending(a => a.FechaRegistro)
                .ToListAsync();

            return asistencias.Select(a => MapToDto(a));
        }

        public async Task<AsistenciaDto?> GetByIdAsync(int id)
        {
            var asistencia = await _context.Asistencias
                .Include(a => a.Sesion)
                .Include(a => a.Estudiante)
                .FirstOrDefaultAsync(a => a.Id == id);

            return asistencia != null ? MapToDto(asistencia) : null;
        }

        public async Task<IEnumerable<AsistenciaDto>> GetBySesionAsync(int sesionId)
        {
            var asistencias = await _context.Asistencias
                .Include(a => a.Sesion)
                .Include(a => a.Estudiante)
                .Where(a => a.SesionId == sesionId)
                .OrderBy(a => a.Estudiante.Apellidos)
                .ThenBy(a => a.Estudiante.Nombres)
                .ToListAsync();

            return asistencias.Select(a => MapToDto(a));
        }

        public async Task<IEnumerable<AsistenciaDto>> GetByEstudianteAsync(int estudianteId)
        {
            var asistencias = await _context.Asistencias
                .Include(a => a.Sesion)
                .Include(a => a.Estudiante)
                .Where(a => a.EstudianteId == estudianteId)
                .OrderByDescending(a => a.Sesion.Fecha)
                .ToListAsync();

            return asistencias.Select(a => MapToDto(a));
        }

        public async Task<AsistenciaDto> CreateAsync(CreateAsistenciaDto createDto, int usuarioId)
        {
            var asistencia = new Asistencia
            {
                SesionId = createDto.SesionId,
                EstudianteId = createDto.EstudianteId,
                Estado = createDto.Estado,
                Observaciones = createDto.Observaciones,
                FechaRegistro = DateTime.UtcNow,
                UsuarioRegistroId = usuarioId
            };

            _context.Asistencias.Add(asistencia);
            await _context.SaveChangesAsync();

            // Recargar con relaciones
            await _context.Entry(asistencia)
                .Reference(a => a.Sesion)
                .LoadAsync();
            await _context.Entry(asistencia)
                .Reference(a => a.Estudiante)
                .LoadAsync();

            _logger.LogInformation("Asistencia registrada: Estudiante {EstudianteId}, Sesión {SesionId}, Estado {Estado}",
                createDto.EstudianteId, createDto.SesionId, createDto.Estado);

            return MapToDto(asistencia);
        }

        public async Task<AsistenciaDto?> UpdateAsync(int id, UpdateAsistenciaDto updateDto, int usuarioId)
        {
            var asistencia = await _context.Asistencias
                .Include(a => a.Sesion)
                .Include(a => a.Estudiante)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (asistencia == null)
                return null;

            asistencia.Estado = updateDto.Estado;
            asistencia.Observaciones = updateDto.Observaciones;
            asistencia.UsuarioRegistroId = usuarioId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Asistencia actualizada: {Id}", id);

            return MapToDto(asistencia);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var asistencia = await _context.Asistencias.FindAsync(id);

            if (asistencia == null)
                return false;

            _context.Asistencias.Remove(asistencia);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Asistencia eliminada: {Id}", id);

            return true;
        }

        public async Task<bool> RegistrarAsistenciaSesionAsync(int sesionId, RegistroAsistenciaSesionDto registroDto, int usuarioId)
        {
            var sesion = await _context.Sesiones.FindAsync(sesionId);
            if (sesion == null)
                return false;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var asistenciaDto in registroDto.Asistencias)
                {
                    // Verificar si ya existe registro de asistencia
                    var existente = await _context.Asistencias
                        .FirstOrDefaultAsync(a => a.SesionId == sesionId && a.EstudianteId == asistenciaDto.EstudianteId);

                    if (existente != null)
                    {
                        // Actualizar
                        existente.Estado = asistenciaDto.Estado;
                        existente.Observaciones = asistenciaDto.Observaciones;
                        existente.UsuarioRegistroId = usuarioId;
                    }
                    else
                    {
                        // Crear nueva
                        var nueva = new Asistencia
                        {
                            SesionId = sesionId,
                            EstudianteId = asistenciaDto.EstudianteId,
                            Estado = asistenciaDto.Estado,
                            Observaciones = asistenciaDto.Observaciones,
                            FechaRegistro = DateTime.UtcNow,
                            UsuarioRegistroId = usuarioId
                        };
                        _context.Asistencias.Add(nueva);
                    }
                }

                // Marcar sesión como realizada
                sesion.Realizada = true;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Asistencia registrada para sesión {SesionId}. Total: {Total}",
                    sesionId, registroDto.Asistencias.Count);

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error al registrar asistencia de sesión {SesionId}", sesionId);
                return false;
            }
        }

        public async Task<ListaAsistenciaSesionDto?> GetListaAsistenciaSesionAsync(int sesionId)
        {
            var sesion = await _context.Sesiones
                .Include(s => s.Seccion)
                    .ThenInclude(sec => sec.Curso)
                .Include(s => s.Asistencias)
                    .ThenInclude(a => a.Estudiante)
                .FirstOrDefaultAsync(s => s.Id == sesionId);

            if (sesion == null)
                return null;

            // Obtener todos los estudiantes inscritos en la sección
            var estudiantesInscritos = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Where(i => i.SeccionId == sesion.SeccionId && i.Activo)
                .Select(i => i.Estudiante)
                .ToListAsync();

            var asistencias = new List<AsistenciaEstudianteDto>();

            foreach (var estudiante in estudiantesInscritos)
            {
                var asistencia = sesion.Asistencias.FirstOrDefault(a => a.EstudianteId == estudiante.Id);

                asistencias.Add(new AsistenciaEstudianteDto
                {
                    EstudianteId = estudiante.Id,
                    Matricula = estudiante.Matricula,
                    NombreCompleto = $"{estudiante.Nombres} {estudiante.Apellidos}",
                    Estado = asistencia?.Estado ?? "Sin registrar",
                    Observaciones = asistencia?.Observaciones
                });
            }

            return new ListaAsistenciaSesionDto
            {
                SesionId = sesion.Id,
                SeccionId = sesion.SeccionId,
                CodigoSeccion = sesion.Seccion.Codigo,
                NombreCurso = sesion.Seccion.Curso.Nombre,
                Fecha = sesion.Fecha,
                Tema = sesion.Tema,
                Asistencias = asistencias
            };
        }

        public async Task<ResumenAsistenciaSeccionDto?> GetResumenAsistenciaSeccionAsync(int seccionId)
        {
            var seccion = await _context.Secciones
                .Include(s => s.Curso)
                .Include(s => s.Inscripciones)
                    .ThenInclude(i => i.Estudiante)
                .FirstOrDefaultAsync(s => s.Id == seccionId);

            if (seccion == null)
                return null;

            var sesiones = await _context.Sesiones
                .Where(s => s.SeccionId == seccionId)
                .ToListAsync();

            var sesionesRealizadas = sesiones.Where(s => s.Realizada).ToList();

            var estudiantes = new List<EstudianteAsistenciaDto>();

            foreach (var inscripcion in seccion.Inscripciones.Where(i => i.Activo))
            {
                var asistencias = await _context.Asistencias
                    .Include(a => a.Sesion)
                    .Where(a => a.EstudianteId == inscripcion.EstudianteId &&
                               a.Sesion.SeccionId == seccionId)
                    .ToListAsync();

                var totalPresente = asistencias.Count(a => a.Estado == "Presente");
                var totalAusente = asistencias.Count(a => a.Estado == "Ausente");
                var totalTardanza = asistencias.Count(a => a.Estado == "Tardanza");
                var totalJustificado = asistencias.Count(a => a.Estado == "Justificado");

                var porcentaje = sesionesRealizadas.Count > 0
                    ? (decimal)(totalPresente + totalTardanza) / sesionesRealizadas.Count * 100
                    : 0;

                var estadoAsistencia = porcentaje >= 90 ? "Excelente" :
                                      porcentaje >= 75 ? "Bueno" :
                                      porcentaje >= 60 ? "Regular" : "Bajo";

                estudiantes.Add(new EstudianteAsistenciaDto
                {
                    EstudianteId = inscripcion.EstudianteId,
                    Matricula = inscripcion.Estudiante.Matricula,
                    NombreCompleto = $"{inscripcion.Estudiante.Nombres} {inscripcion.Estudiante.Apellidos}",
                    TotalPresente = totalPresente,
                    TotalAusente = totalAusente,
                    TotalTardanza = totalTardanza,
                    TotalJustificado = totalJustificado,
                    PorcentajeAsistencia = Math.Round(porcentaje, 2),
                    EstadoAsistencia = estadoAsistencia
                });
            }

            return new ResumenAsistenciaSeccionDto
            {
                SeccionId = seccion.Id,
                CodigoSeccion = seccion.Codigo,
                CodigoCurso = seccion.Curso.Codigo,
                NombreCurso = seccion.Curso.Nombre,
                Periodo = seccion.Periodo,
                TotalSesiones = sesiones.Count,
                SesionesRealizadas = sesionesRealizadas.Count,
                Estudiantes = estudiantes
            };
        }

        public async Task<ResumenAsistenciaEstudianteDto?> GetResumenAsistenciaEstudianteAsync(int estudianteId)
        {
            var estudiante = await _context.Estudiantes.FindAsync(estudianteId);
            if (estudiante == null)
                return null;

            var inscripciones = await _context.Inscripciones
                .Include(i => i.Seccion)
                    .ThenInclude(s => s.Curso)
                .Where(i => i.EstudianteId == estudianteId && i.Activo)
                .ToListAsync();

            var secciones = new List<SeccionAsistenciaDto>();

            foreach (var inscripcion in inscripciones)
            {
                var sesiones = await _context.Sesiones
                    .Where(s => s.SeccionId == inscripcion.SeccionId && s.Realizada)
                    .CountAsync();

                var asistencias = await _context.Asistencias
                    .Include(a => a.Sesion)
                    .Where(a => a.EstudianteId == estudianteId &&
                               a.Sesion.SeccionId == inscripcion.SeccionId)
                    .ToListAsync();

                var totalPresente = asistencias.Count(a => a.Estado == "Presente");
                var totalAusente = asistencias.Count(a => a.Estado == "Ausente");
                var totalTardanza = asistencias.Count(a => a.Estado == "Tardanza");
                var totalJustificado = asistencias.Count(a => a.Estado == "Justificado");

                var porcentaje = sesiones > 0
                    ? (decimal)(totalPresente + totalTardanza) / sesiones * 100
                    : 0;

                secciones.Add(new SeccionAsistenciaDto
                {
                    SeccionId = inscripcion.SeccionId,
                    CodigoSeccion = inscripcion.Seccion.Codigo,
                    NombreCurso = inscripcion.Seccion.Curso.Nombre,
                    Periodo = inscripcion.Seccion.Periodo,
                    TotalSesiones = sesiones,
                    TotalPresente = totalPresente,
                    TotalAusente = totalAusente,
                    TotalTardanza = totalTardanza,
                    TotalJustificado = totalJustificado,
                    PorcentajeAsistencia = Math.Round(porcentaje, 2)
                });
            }

            var promedioGeneral = secciones.Any()
                ? secciones.Average(s => s.PorcentajeAsistencia)
                : 0;

            return new ResumenAsistenciaEstudianteDto
            {
                EstudianteId = estudiante.Id,
                Matricula = estudiante.Matricula,
                NombreCompleto = $"{estudiante.Nombres} {estudiante.Apellidos}",
                Secciones = secciones,
                PromedioAsistenciaGeneral = Math.Round(promedioGeneral, 2)
            };
        }

        public async Task<List<AsistenciaRegistroDto>> GenerarPlantillaAsistenciaAsync(int sesionId)
        {
            var sesion = await _context.Sesiones
                .Include(s => s.Seccion)
                .FirstOrDefaultAsync(s => s.Id == sesionId);

            if (sesion == null)
                return new List<AsistenciaRegistroDto>();

            // Obtener estudiantes inscritos en la sección
            var estudiantes = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Where(i => i.SeccionId == sesion.SeccionId && i.Activo)
                .Select(i => i.Estudiante)
                .OrderBy(e => e.Apellidos)
                .ThenBy(e => e.Nombres)
                .ToListAsync();

            // Generar plantilla con estado "Presente" por defecto
            var plantilla = estudiantes.Select(e => new AsistenciaRegistroDto
            {
                EstudianteId = e.Id,
                Estado = "Presente", // Por defecto todos presentes, el docente cambia los ausentes
                Observaciones = null
            }).ToList();

            return plantilla;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Asistencias.AnyAsync(a => a.Id == id);
        }

        private AsistenciaDto MapToDto(Asistencia asistencia)
        {
            return new AsistenciaDto
            {
                Id = asistencia.Id,
                SesionId = asistencia.SesionId,
                FechaSesion = asistencia.Sesion.Fecha,
                TemaClase = asistencia.Sesion.Tema ?? "Sin tema",
                EstudianteId = asistencia.EstudianteId,
                MatriculaEstudiante = asistencia.Estudiante.Matricula,
                NombreEstudiante = $"{asistencia.Estudiante.Nombres} {asistencia.Estudiante.Apellidos}",
                Estado = asistencia.Estado,
                Observaciones = asistencia.Observaciones,
                FechaRegistro = asistencia.FechaRegistro
            };
        }
    }
}


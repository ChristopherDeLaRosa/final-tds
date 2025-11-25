using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace EduCore.API.Services.Implementations
{
    public class SesionService : ISesionService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<SesionService> _logger;

        public SesionService(EduCoreDbContext context, ILogger<SesionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<SesionDto?> GetByIdAsync(int id)
        {
            var sesion = await _context.Sesiones
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(s => s.Asistencias)
                .FirstOrDefaultAsync(s => s.Id == id);

            return sesion != null ? MapToDto(sesion) : null;
        }

        public async Task<SesionDetalleDto?> GetDetalleByIdAsync(int id)
        {
            var sesion = await _context.Sesiones
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Docente)
                .Include(s => s.Asistencias)
                    .ThenInclude(a => a.Estudiante)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sesion == null)
                return null;

            var asistencias = sesion.Asistencias.Select(a => new AsistenciaDto
            {
                Id = a.Id,
                SesionId = a.SesionId,
                FechaSesion = sesion.Fecha,
                TemaSesion = sesion.Tema ?? string.Empty,
                EstudianteId = a.EstudianteId,
                MatriculaEstudiante = a.Estudiante.Matricula,
                NombreEstudiante = $"{a.Estudiante.Nombres} {a.Estudiante.Apellidos}",
                Estado = a.Estado,
                Observaciones = a.Observaciones,
                FechaRegistro = a.FechaRegistro,
                NotificacionEnviada = a.NotificacionEnviada
            }).ToList();

            var totalEstudiantes = await _context.Inscripciones
                .CountAsync(i => i.GrupoCursoId == sesion.GrupoCursoId && i.Activo);

            var presentes = sesion.Asistencias.Count(a => a.Estado == "Presente");
            var ausentes = sesion.Asistencias.Count(a => a.Estado == "Ausente");
            var tardanzas = sesion.Asistencias.Count(a => a.Estado == "Tardanza");
            var justificados = sesion.Asistencias.Count(a => a.Estado == "Justificado");

            var porcentajeAsistencia = totalEstudiantes > 0
                ? Math.Round((decimal)presentes / totalEstudiantes * 100, 2)
                : 0;

            var duracionMinutos = (int)(sesion.HoraFin - sesion.HoraInicio).TotalMinutes;

            return new SesionDetalleDto
            {
                Id = sesion.Id,
                GrupoCursoId = sesion.GrupoCursoId,
                CodigoGrupo = sesion.GrupoCurso.Codigo,
                NombreCurso = sesion.GrupoCurso.Curso.Nombre,
                AreaConocimiento = sesion.GrupoCurso.Curso.AreaConocimiento,
                Grado = sesion.GrupoCurso.Grado,
                Seccion = sesion.GrupoCurso.Seccion,
                Docente = $"{sesion.GrupoCurso.Docente.Nombres} {sesion.GrupoCurso.Docente.Apellidos}",
                Fecha = sesion.Fecha,
                HoraInicio = sesion.HoraInicio,
                HoraFin = sesion.HoraFin,
                DuracionMinutos = duracionMinutos,
                Tema = sesion.Tema,
                Observaciones = sesion.Observaciones,
                Realizada = sesion.Realizada,
                Asistencias = asistencias,
                TotalEstudiantes = totalEstudiantes,
                Presentes = presentes,
                Ausentes = ausentes,
                Tardanzas = tardanzas,
                Justificados = justificados,
                PorcentajeAsistencia = porcentajeAsistencia
            };
        }

        public async Task<IEnumerable<SesionDto>> GetByGrupoCursoAsync(int grupoCursoId)
        {
            var sesiones = await _context.Sesiones
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(s => s.Asistencias)
                .Where(s => s.GrupoCursoId == grupoCursoId)
                .OrderBy(s => s.Fecha)
                .ThenBy(s => s.HoraInicio)
                .ToListAsync();

            return sesiones.Select(s => MapToDto(s));
        }

        public async Task<IEnumerable<SesionDto>> GetByGrupoCursoFechasAsync(
            int grupoCursoId,
            DateTime fechaInicio,
            DateTime fechaFin)
        {
            var sesiones = await _context.Sesiones
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(s => s.Asistencias)
                .Where(s => s.GrupoCursoId == grupoCursoId &&
                           s.Fecha >= fechaInicio &&
                           s.Fecha <= fechaFin)
                .OrderBy(s => s.Fecha)
                .ThenBy(s => s.HoraInicio)
                .ToListAsync();

            return sesiones.Select(s => MapToDto(s));
        }

        public async Task<IEnumerable<SesionDto>> GetByFechaAsync(DateTime fecha)
        {
            var fechaSolo = fecha.Date;

            var sesiones = await _context.Sesiones
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(s => s.Asistencias)
                .Where(s => s.Fecha.Date == fechaSolo)
                .OrderBy(s => s.HoraInicio)
                .ToListAsync();

            return sesiones.Select(s => MapToDto(s));
        }

        public async Task<IEnumerable<SesionDto>> GetByRangoFechasAsync(
            DateTime fechaInicio,
            DateTime fechaFin)
        {
            var sesiones = await _context.Sesiones
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(s => s.Asistencias)
                .Where(s => s.Fecha >= fechaInicio && s.Fecha <= fechaFin)
                .OrderBy(s => s.Fecha)
                .ThenBy(s => s.HoraInicio)
                .ToListAsync();

            return sesiones.Select(s => MapToDto(s));
        }

        public async Task<IEnumerable<SesionDto>> GetByDocenteAsync(int docenteId, DateTime? fecha = null)
        {
            var query = _context.Sesiones
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(s => s.Asistencias)
                .Where(s => s.GrupoCurso.DocenteId == docenteId);

            if (fecha.HasValue)
            {
                var fechaSolo = fecha.Value.Date;
                query = query.Where(s => s.Fecha.Date == fechaSolo);
            }

            var sesiones = await query
                .OrderBy(s => s.Fecha)
                .ThenBy(s => s.HoraInicio)
                .ToListAsync();

            return sesiones.Select(s => MapToDto(s));
        }

        public async Task<SesionDto> CreateAsync(CreateSesionDto createDto)
        {
            // Validar conflicto de horario
            if (await ExisteConflictoHorarioAsync(
                createDto.GrupoCursoId,
                createDto.Fecha,
                createDto.HoraInicio,
                createDto.HoraFin))
            {
                throw new InvalidOperationException(
                    "Ya existe una sesión programada en ese horario para este grupo"
                );
            }

            // Validar que hora fin sea mayor que hora inicio
            if (createDto.HoraFin <= createDto.HoraInicio)
            {
                throw new InvalidOperationException(
                    "La hora de fin debe ser posterior a la hora de inicio"
                );
            }

            var sesion = new Sesion
            {
                GrupoCursoId = createDto.GrupoCursoId,
                Fecha = createDto.Fecha.Date,
                HoraInicio = createDto.HoraInicio,
                HoraFin = createDto.HoraFin,
                Tema = createDto.Tema,
                Observaciones = createDto.Observaciones,
                Realizada = false
            };

            _context.Sesiones.Add(sesion);
            await _context.SaveChangesAsync();

            // Recargar con relaciones
            await _context.Entry(sesion)
                .Reference(s => s.GrupoCurso)
                .LoadAsync();
            await _context.Entry(sesion.GrupoCurso)
                .Reference(g => g.Curso)
                .LoadAsync();

            _logger.LogInformation(
                "Sesión creada: GrupoCurso {GrupoCursoId} - Fecha: {Fecha}",
                sesion.GrupoCursoId, sesion.Fecha.ToShortDateString()
            );

            return MapToDto(sesion);
        }

        public async Task<SesionDto?> UpdateAsync(int id, UpdateSesionDto updateDto)
        {
            var sesion = await _context.Sesiones
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(s => s.Asistencias)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sesion == null)
                return null;

            // Validar conflicto de horario (excluyendo esta sesión)
            if (await ExisteConflictoHorarioAsync(
                sesion.GrupoCursoId,
                updateDto.Fecha,
                updateDto.HoraInicio,
                updateDto.HoraFin,
                id))
            {
                throw new InvalidOperationException(
                    "Ya existe una sesión programada en ese horario para este grupo"
                );
            }

            // Validar que hora fin sea mayor que hora inicio
            if (updateDto.HoraFin <= updateDto.HoraInicio)
            {
                throw new InvalidOperationException(
                    "La hora de fin debe ser posterior a la hora de inicio"
                );
            }

            sesion.Fecha = updateDto.Fecha.Date;
            sesion.HoraInicio = updateDto.HoraInicio;
            sesion.HoraFin = updateDto.HoraFin;
            sesion.Tema = updateDto.Tema;
            sesion.Observaciones = updateDto.Observaciones;
            sesion.Realizada = updateDto.Realizada;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Sesión actualizada: {Id}", id);

            return MapToDto(sesion);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sesion = await _context.Sesiones
                .Include(s => s.Asistencias)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sesion == null)
                return false;

            // Verificar si tiene asistencias registradas
            if (sesion.Asistencias.Any())
            {
                _logger.LogWarning(
                    "No se puede eliminar la sesión {Id} porque tiene asistencias registradas",
                    id
                );
                return false;
            }

            _context.Sesiones.Remove(sesion);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Sesión eliminada: {Id}", id);

            return true;
        }

        public async Task<List<SesionDto>> CrearSesionesRecurrentesAsync(
            CrearSesionesRecurrentesDto recurrenteDto)
        {
            // Validar fechas
            if (recurrenteDto.FechaFin <= recurrenteDto.FechaInicio)
            {
                throw new InvalidOperationException(
                    "La fecha de fin debe ser posterior a la fecha de inicio"
                );
            }

            // Validar horas
            if (recurrenteDto.HoraFin <= recurrenteDto.HoraInicio)
            {
                throw new InvalidOperationException(
                    "La hora de fin debe ser posterior a la hora de inicio"
                );
            }

            var sesionesCreadas = new List<Sesion>();
            var fechaActual = recurrenteDto.FechaInicio.Date;

            while (fechaActual <= recurrenteDto.FechaFin.Date)
            {
                // Si el día de la semana está en la lista
                if (recurrenteDto.DiasSemana.Contains(fechaActual.DayOfWeek))
                {
                    // Verificar que no exista conflicto
                    var existeConflicto = await ExisteConflictoHorarioAsync(
                        recurrenteDto.GrupoCursoId,
                        fechaActual,
                        recurrenteDto.HoraInicio,
                        recurrenteDto.HoraFin
                    );

                    if (!existeConflicto)
                    {
                        var sesion = new Sesion
                        {
                            GrupoCursoId = recurrenteDto.GrupoCursoId,
                            Fecha = fechaActual,
                            HoraInicio = recurrenteDto.HoraInicio,
                            HoraFin = recurrenteDto.HoraFin,
                            Tema = recurrenteDto.TemaBase,
                            Realizada = false
                        };

                        _context.Sesiones.Add(sesion);
                        sesionesCreadas.Add(sesion);
                    }
                    else
                    {
                        _logger.LogWarning(
                            "Conflicto de horario en fecha {Fecha}, sesión omitida",
                            fechaActual.ToShortDateString()
                        );
                    }
                }

                fechaActual = fechaActual.AddDays(1);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Sesiones recurrentes creadas: {Cantidad} sesiones para grupo {GrupoCursoId}",
                sesionesCreadas.Count, recurrenteDto.GrupoCursoId
            );

            // Recargar con relaciones
            foreach (var sesion in sesionesCreadas)
            {
                await _context.Entry(sesion)
                    .Reference(s => s.GrupoCurso)
                    .LoadAsync();
                await _context.Entry(sesion.GrupoCurso)
                    .Reference(g => g.Curso)
                    .LoadAsync();
            }

            return sesionesCreadas.Select(s => MapToDto(s)).ToList();
        }

        public async Task<SesionDto?> MarcarComoRealizadaAsync(int id)
        {
            var sesion = await _context.Sesiones
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(s => s.Asistencias)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sesion == null)
                return null;

            sesion.Realizada = true;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Sesión marcada como realizada: {Id}", id);

            return MapToDto(sesion);
        }

        public async Task<HorarioSemanalGrupoDto?> GetHorarioSemanalAsync(
            int grupoCursoId,
            DateTime fecha)
        {
            var grupoCurso = await _context.GruposCursos
                .Include(g => g.Curso)
                .FirstOrDefaultAsync(g => g.Id == grupoCursoId);

            if (grupoCurso == null)
                return null;

            // Calcular inicio y fin de la semana
            var diaSemana = (int)fecha.DayOfWeek;
            var inicioSemana = fecha.AddDays(-(diaSemana == 0 ? 6 : diaSemana - 1)).Date;
            var finSemana = inicioSemana.AddDays(6);

            var sesiones = await _context.Sesiones
                .Include(s => s.Asistencias)
                .Where(s => s.GrupoCursoId == grupoCursoId &&
                           s.Fecha >= inicioSemana &&
                           s.Fecha <= finSemana)
                .OrderBy(s => s.Fecha)
                .ThenBy(s => s.HoraInicio)
                .ToListAsync();

            var culture = new CultureInfo("es-ES");
            var sesionesSemana = sesiones.Select(s => new SesionSemanalDto
            {
                Id = s.Id,
                DiaSemana = s.Fecha.DayOfWeek,
                DiaSemanaTexto = culture.DateTimeFormat.GetDayName(s.Fecha.DayOfWeek),
                Fecha = s.Fecha,
                HoraInicio = s.HoraInicio,
                HoraFin = s.HoraFin,
                Tema = s.Tema,
                Realizada = s.Realizada,
                TotalAsistencias = s.Asistencias.Count
            }).ToList();

            return new HorarioSemanalGrupoDto
            {
                GrupoCursoId = grupoCurso.Id,
                CodigoGrupo = grupoCurso.Codigo,
                NombreCurso = grupoCurso.Curso.Nombre,
                Grado = grupoCurso.Grado,
                Seccion = grupoCurso.Seccion,
                SemanaInicio = inicioSemana,
                SemanaFin = finSemana,
                Sesiones = sesionesSemana
            };
        }

        public async Task<CalendarioMensualDto> GetCalendarioMensualAsync(
            int grado,
            string seccion,
            int anio,
            int mes)
        {
            var primerDia = new DateTime(anio, mes, 1);
            var ultimoDia = primerDia.AddMonths(1).AddDays(-1);

            var sesiones = await _context.Sesiones
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Where(s => s.GrupoCurso.Grado == grado &&
                           s.GrupoCurso.Seccion == seccion &&
                           s.Fecha >= primerDia &&
                           s.Fecha <= ultimoDia)
                .OrderBy(s => s.Fecha)
                .ThenBy(s => s.HoraInicio)
                .ToListAsync();

            var dias = new List<CalendarioDiaDto>();
            var fechaActual = primerDia;

            while (fechaActual <= ultimoDia)
            {
                var sesionesDia = sesiones
                    .Where(s => s.Fecha.Date == fechaActual.Date)
                    .Select(s => new SesionCalendarioDto
                    {
                        Id = s.Id,
                        GrupoCursoId = s.GrupoCursoId,
                        NombreCurso = s.GrupoCurso.Curso.Nombre,
                        Grado = s.GrupoCurso.Grado,
                        Seccion = s.GrupoCurso.Seccion,
                        HoraInicio = s.HoraInicio,
                        HoraFin = s.HoraFin,
                        Tema = s.Tema,
                        Realizada = s.Realizada
                    }).ToList();

                dias.Add(new CalendarioDiaDto
                {
                    Fecha = fechaActual,
                    DiaMes = fechaActual.Day,
                    DiaSemana = fechaActual.DayOfWeek,
                    Sesiones = sesionesDia
                });

                fechaActual = fechaActual.AddDays(1);
            }

            var culture = new CultureInfo("es-ES");
            var nombreMes = culture.DateTimeFormat.GetMonthName(mes);

            return new CalendarioMensualDto
            {
                Anio = anio,
                Mes = mes,
                NombreMes = nombreMes,
                Dias = dias
            };
        }

        public async Task<EstadisticasSesionesDto?> GetEstadisticasGrupoCursoAsync(
            int grupoCursoId,
            string? periodo = null)
        {
            var grupoCurso = await _context.GruposCursos
                .Include(g => g.Curso)
                .FirstOrDefaultAsync(g => g.Id == grupoCursoId);

            if (grupoCurso == null)
                return null;

            var query = _context.Sesiones
                .Include(s => s.Asistencias)
                .Where(s => s.GrupoCursoId == grupoCursoId);

            var sesiones = await query.ToListAsync();

            var totalSesiones = sesiones.Count;
            var realizadas = sesiones.Count(s => s.Realizada);
            var pendientes = totalSesiones - realizadas;

            var porcentajeAvance = totalSesiones > 0
                ? Math.Round((decimal)realizadas / totalSesiones * 100, 2)
                : 0;

            // Calcular promedio de asistencia
            var sesionesConAsistencia = sesiones.Where(s => s.Asistencias.Any()).ToList();
            decimal promedioAsistencia = 0;

            if (sesionesConAsistencia.Any())
            {
                var porcentajes = sesionesConAsistencia.Select(s =>
                {
                    var totalEstudiantes = _context.Inscripciones
                        .Count(i => i.GrupoCursoId == grupoCursoId && i.Activo);
                    var presentes = s.Asistencias.Count(a => a.Estado == "Presente");
                    return totalEstudiantes > 0 ? (decimal)presentes / totalEstudiantes * 100 : 0;
                }).ToList();

                promedioAsistencia = Math.Round(porcentajes.Average(), 2);
            }

            // Calcular total de horas
            var totalMinutos = sesiones
                .Where(s => s.Realizada)
                .Sum(s => (s.HoraFin - s.HoraInicio).TotalMinutes);
            var totalHoras = (int)(totalMinutos / 60);

            return new EstadisticasSesionesDto
            {
                GrupoCursoId = grupoCurso.Id,
                NombreCurso = grupoCurso.Curso.Nombre,
                Periodo = periodo ?? grupoCurso.Periodo,
                TotalSesionesProgramadas = totalSesiones,
                SesionesRealizadas = realizadas,
                SesionesPendientes = pendientes,
                PorcentajeAvance = porcentajeAvance,
                PromedioAsistencia = promedioAsistencia,
                TotalHorasImpartidas = totalHoras
            };
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Sesiones.AnyAsync(s => s.Id == id);
        }

        public async Task<bool> ExisteConflictoHorarioAsync(
            int grupoCursoId,
            DateTime fecha,
            TimeSpan horaInicio,
            TimeSpan horaFin,
            int? sesionId = null)
        {
            var query = _context.Sesiones
                .Where(s => s.GrupoCursoId == grupoCursoId &&
                           s.Fecha.Date == fecha.Date &&
                           ((s.HoraInicio < horaFin && s.HoraFin > horaInicio)));

            if (sesionId.HasValue)
            {
                query = query.Where(s => s.Id != sesionId.Value);
            }

            return await query.AnyAsync();
        }

        private SesionDto MapToDto(Sesion sesion)
        {
            var totalAsistencias = sesion.Asistencias?.Count ?? 0;
            var presentes = sesion.Asistencias?.Count(a => a.Estado == "Presente") ?? 0;
            var ausentes = sesion.Asistencias?.Count(a => a.Estado == "Ausente") ?? 0;

            var porcentajeAsistencia = totalAsistencias > 0
                ? Math.Round((decimal)presentes / totalAsistencias * 100, 2)
                : 0;

            return new SesionDto
            {
                Id = sesion.Id,
                GrupoCursoId = sesion.GrupoCursoId,
                CodigoGrupo = sesion.GrupoCurso.Codigo,
                NombreCurso = sesion.GrupoCurso.Curso.Nombre,
                Grado = sesion.GrupoCurso.Grado,
                Seccion = sesion.GrupoCurso.Seccion,
                Fecha = sesion.Fecha,
                HoraInicio = sesion.HoraInicio,
                HoraFin = sesion.HoraFin,
                Tema = sesion.Tema,
                Observaciones = sesion.Observaciones,
                Realizada = sesion.Realizada,
                TotalAsistencias = totalAsistencias,
                Presentes = presentes,
                Ausentes = ausentes,
                PorcentajeAsistencia = porcentajeAsistencia
            };
        }
    }
}

using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace EduCore.API.Services.Implementations
{
    public class HorarioAulaService : IHorarioAulaService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<HorarioAulaService> _logger;

        public HorarioAulaService(EduCoreDbContext context, ILogger<HorarioAulaService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Consultas

        public async Task<IEnumerable<HorarioAulaDto>> GetHorariosAulaAsync(int aulaId)
        {
            var horarios = await _context.HorariosAulas
                .Include(h => h.Curso)
                .Include(h => h.Docente)
                .Where(h => h.AulaId == aulaId && h.Activo)
                .OrderBy(h => h.DiaSemana)
                .ThenBy(h => h.HoraInicio)
                .ThenBy(h => h.Orden)
                .ToListAsync();

            var culture = new CultureInfo("es-DO");

            return horarios.Select(h => MapToDto(h, culture));
        }

        public async Task<HorarioAulaDto?> GetHorarioByIdAsync(int horarioId)
        {
            var horario = await _context.HorariosAulas
                .Include(h => h.Curso)
                .Include(h => h.Docente)
                .FirstOrDefaultAsync(h => h.Id == horarioId);

            if (horario == null)
                return null;

            var culture = new CultureInfo("es-DO");
            return MapToDto(horario, culture);
        }

        #endregion

        #region CRUD de Horarios

        public async Task<HorarioAulaDto> CreateHorarioAsync(CreateHorarioAulaDto createDto)
        {
            // Validar conflicto de horario
            if (await ExisteConflictoHorarioAsync(
                createDto.AulaId,
                createDto.DiaSemana,
                createDto.HoraInicio,
                createDto.HoraFin))
            {
                throw new InvalidOperationException(
                    "Ya existe un horario en ese día y hora para esta aula"
                );
            }

            // Validar que hora fin sea mayor que hora inicio
            if (createDto.HoraFin <= createDto.HoraInicio)
            {
                throw new InvalidOperationException(
                    "La hora de fin debe ser posterior a la hora de inicio"
                );
            }

            var horario = new HorarioAula
            {
                AulaId = createDto.AulaId,
                CursoId = createDto.CursoId,
                DocenteId = createDto.DocenteId,
                DiaSemana = createDto.DiaSemana,
                HoraInicio = createDto.HoraInicio,
                HoraFin = createDto.HoraFin,
                Orden = createDto.Orden,
                Activo = true
            };

            _context.HorariosAulas.Add(horario);
            await _context.SaveChangesAsync();

            // Recargar con relaciones
            await _context.Entry(horario).Reference(h => h.Curso).LoadAsync();
            await _context.Entry(horario).Reference(h => h.Docente).LoadAsync();

            _logger.LogInformation(
                "Horario creado: Aula {AulaId} - {DiaSemana} {HoraInicio}-{HoraFin}",
                horario.AulaId, horario.DiaSemana, horario.HoraInicio, horario.HoraFin
            );

            var culture = new CultureInfo("es-DO");
            return MapToDto(horario, culture);
        }

        public async Task<HorarioAulaDto?> UpdateHorarioAsync(int horarioId, UpdateHorarioAulaDto updateDto)
        {
            var horario = await _context.HorariosAulas
                .Include(h => h.Curso)
                .Include(h => h.Docente)
                .FirstOrDefaultAsync(h => h.Id == horarioId);

            if (horario == null)
                return null;

            // Validar conflicto de horario (excluyendo este horario)
            if (await ExisteConflictoHorarioAsync(
                horario.AulaId,
                horario.DiaSemana,
                updateDto.HoraInicio,
                updateDto.HoraFin,
                horarioId))
            {
                throw new InvalidOperationException(
                    "Ya existe un horario en ese día y hora para esta aula"
                );
            }

            // Validar que hora fin sea mayor que hora inicio
            if (updateDto.HoraFin <= updateDto.HoraInicio)
            {
                throw new InvalidOperationException(
                    "La hora de fin debe ser posterior a la hora de inicio"
                );
            }

            horario.DocenteId = updateDto.DocenteId;
            horario.HoraInicio = updateDto.HoraInicio;
            horario.HoraFin = updateDto.HoraFin;
            horario.Orden = updateDto.Orden;
            horario.Activo = updateDto.Activo;

            await _context.SaveChangesAsync();

            // Recargar docente si cambió
            await _context.Entry(horario).Reference(h => h.Docente).LoadAsync();

            _logger.LogInformation("Horario actualizado: {Id}", horarioId);

            var culture = new CultureInfo("es-DO");
            return MapToDto(horario, culture);
        }

        public async Task<bool> DeleteHorarioAsync(int horarioId)
        {
            var horario = await _context.HorariosAulas.FindAsync(horarioId);

            if (horario == null)
                return false;

            _context.HorariosAulas.Remove(horario);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Horario eliminado: {Id}", horarioId);

            return true;
        }

        #endregion

        #region Configuración Completa

        public async Task<ResultadoConfiguracionAulaDto> ConfigurarHorarioCompletoAsync(
            ConfigurarHorarioCompletoDto configDto)
        {
            var resultado = new ResultadoConfiguracionAulaDto();

            try
            {
                var aula = await _context.Aulas.FindAsync(configDto.AulaId);
                if (aula == null)
                {
                    resultado.Errores.Add("Aula no encontrada");
                    return resultado;
                }

                // 1. Crear todos los horarios
                foreach (var horarioDto in configDto.Horarios)
                {
                    try
                    {
                        // Validar conflictos
                        if (await ExisteConflictoHorarioAsync(
                            configDto.AulaId,
                            horarioDto.DiaSemana,
                            horarioDto.HoraInicio,
                            horarioDto.HoraFin))
                        {
                            resultado.Errores.Add(
                                $"Conflicto de horario: {horarioDto.DiaSemana} {horarioDto.HoraInicio}-{horarioDto.HoraFin}"
                            );
                            continue;
                        }

                        var horario = new HorarioAula
                        {
                            AulaId = configDto.AulaId,
                            CursoId = horarioDto.CursoId,
                            DocenteId = horarioDto.DocenteId,
                            DiaSemana = horarioDto.DiaSemana,
                            HoraInicio = horarioDto.HoraInicio,
                            HoraFin = horarioDto.HoraFin,
                            Orden = horarioDto.Orden,
                            Activo = true
                        };

                        _context.HorariosAulas.Add(horario);
                        resultado.HorariosCreados++;
                    }
                    catch (Exception ex)
                    {
                        resultado.Errores.Add($"Error al crear horario: {ex.Message}");
                    }
                }

                await _context.SaveChangesAsync();

                // 2. Generar grupos-cursos automáticamente
                if (configDto.GenerarGruposAutomaticamente)
                {
                    var resultadoGrupos = await GenerarGruposCursosDesdeHorarioAsync(configDto.AulaId);
                    resultado.GruposCursosCreados = resultadoGrupos.GruposCursosCreados;
                    resultado.Errores.AddRange(resultadoGrupos.Errores);
                }

                // 3. Generar sesiones automáticamente
                if (configDto.GenerarSesionesAutomaticamente)
                {
                    var resultadoSesiones = await GenerarSesionesParaAulaAsync(configDto.AulaId);
                    resultado.SesionesGeneradas = resultadoSesiones.SesionesGeneradas;
                    resultado.Errores.AddRange(resultadoSesiones.Errores);
                }

                resultado.Exitoso = resultado.Errores.Count == 0;
                resultado.Mensaje = resultado.Exitoso
                    ? $"Configuración completada: {resultado.HorariosCreados} horarios, {resultado.GruposCursosCreados} grupos, {resultado.SesionesGeneradas} sesiones"
                    : $"Configuración completada con {resultado.Errores.Count} errores";

                _logger.LogInformation(
                    "Configuración de aula {AulaId}: {HorariosCreados} horarios, {GruposCreados} grupos, {SesionesGeneradas} sesiones",
                    configDto.AulaId, resultado.HorariosCreados, resultado.GruposCursosCreados, resultado.SesionesGeneradas
                );

                return resultado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al configurar horario completo para aula {AulaId}", configDto.AulaId);
                resultado.Errores.Add($"Error general: {ex.Message}");
                resultado.Exitoso = false;
                return resultado;
            }
        }

        #endregion

        #region Auto-generación

        public async Task<ResultadoConfiguracionAulaDto> GenerarGruposCursosDesdeHorarioAsync(int aulaId)
        {
            var resultado = new ResultadoConfiguracionAulaDto();

            try
            {
                var aula = await _context.Aulas
                    .Include(a => a.Horarios)
                        .ThenInclude(h => h.Curso)
                    .Include(a => a.Horarios)
                        .ThenInclude(h => h.Docente)
                    .FirstOrDefaultAsync(a => a.Id == aulaId);

                if (aula == null)
                {
                    resultado.Errores.Add("Aula no encontrada");
                    return resultado;
                }

                if (!aula.Horarios.Any())
                {
                    resultado.Errores.Add("El aula no tiene horarios configurados");
                    return resultado;
                }

                // Agrupar por curso (un curso puede tener varias sesiones semanales)
                var cursosUnicos = aula.Horarios
                    .Where(h => h.Activo)
                    .GroupBy(h => new { h.CursoId, h.DocenteId })
                    .ToList();

                foreach (var grupoCurso in cursosUnicos)
                {
                    var primerHorario = grupoCurso.First();
                    var curso = primerHorario.Curso;
                    var docente = primerHorario.Docente;

                    // Verificar si ya existe el grupo
                    var codigoGrupo = $"{aula.Grado}{aula.Seccion}-{curso.Codigo}";

                    var grupoExistente = await _context.GruposCursos
                        .AnyAsync(g => g.Codigo == codigoGrupo && g.Activo);

                    if (grupoExistente)
                    {
                        resultado.Errores.Add($"Grupo {codigoGrupo} ya existe");
                        continue;
                    }

                    // Construir horario en texto
                    var horariosTexto = string.Join(", ", grupoCurso.Select(h =>
                        $"{h.DiaSemana.ToString().Substring(0, 3)} {h.HoraInicio:hh\\:mm}-{h.HoraFin:hh\\:mm}"
                    ));

                    var nuevoGrupo = new GrupoCurso
                    {
                        Codigo = codigoGrupo,
                        CursoId = curso.Id,
                        DocenteId = docente.Id,
                        Grado = aula.Grado,
                        Seccion = aula.Seccion,
                        Anio = aula.Anio,
                        PeriodoId = aula.PeriodoId,
                        AulaId = aulaId,
                        Horario = horariosTexto,
                        CapacidadMaxima = aula.CapacidadMaxima,
                        CantidadEstudiantes = 0,
                        Activo = true
                    };

                    _context.GruposCursos.Add(nuevoGrupo);
                    resultado.GruposCursosCreados++;
                }

                await _context.SaveChangesAsync();

                resultado.Exitoso = true;
                resultado.Mensaje = $"{resultado.GruposCursosCreados} grupos-cursos creados";

                _logger.LogInformation(
                    "Generados {Cantidad} grupos-cursos para aula {AulaId}",
                    resultado.GruposCursosCreados, aulaId
                );

                return resultado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar grupos-cursos para aula {AulaId}", aulaId);
                resultado.Errores.Add($"Error: {ex.Message}");
                resultado.Exitoso = false;
                return resultado;
            }
        }

        public async Task<ResultadoConfiguracionAulaDto> GenerarSesionesParaAulaAsync(int aulaId)
        {
            var resultado = new ResultadoConfiguracionAulaDto();

            try
            {
                var aula = await _context.Aulas
                    .Include(a => a.Horarios)
                        .ThenInclude(h => h.Curso)
                    .Include(a => a.GruposCursos)
                    .FirstOrDefaultAsync(a => a.Id == aulaId);

                if (aula == null)
                {
                    resultado.Errores.Add("Aula no encontrada");
                    return resultado;
                }

                if (!aula.Horarios.Any(h => h.Activo))
                {
                    resultado.Errores.Add("El aula no tiene horarios configurados");
                    return resultado;
                }

                if (!aula.GruposCursos.Any(g => g.Activo))
                {
                    resultado.Errores.Add("El aula no tiene grupos-cursos creados. Genera los grupos primero.");
                    return resultado;
                }

                var fechaActual = aula.FechaInicio.Date;
                var fechaFin = aula.FechaFin.Date;

                // Iterar por cada día del periodo escolar
                while (fechaActual <= fechaFin)
                {
                    var diaSemana = fechaActual.DayOfWeek;

                    // Obtener horarios de ese día
                    var horariosDelDia = aula.Horarios
                        .Where(h => h.DiaSemana == diaSemana && h.Activo)
                        .ToList();

                    foreach (var horario in horariosDelDia)
                    {
                        // Buscar el grupo-curso correspondiente
                        var grupoCurso = aula.GruposCursos
                            .FirstOrDefault(g => g.CursoId == horario.CursoId &&
                                                g.DocenteId == horario.DocenteId &&
                                                g.Activo);

                        if (grupoCurso == null)
                        {
                            resultado.Errores.Add(
                                $"No se encontró grupo-curso para {horario.Curso.Nombre} el {diaSemana}"
                            );
                            continue;
                        }

                        // Verificar si ya existe la sesión
                        var sesionExiste = await _context.Sesiones
                            .AnyAsync(s => s.GrupoCursoId == grupoCurso.Id &&
                                          s.Fecha.Date == fechaActual &&
                                          s.HoraInicio == horario.HoraInicio);

                        if (sesionExiste)
                            continue;

                        // Crear sesión
                        var sesion = new Sesion
                        {
                            GrupoCursoId = grupoCurso.Id,
                            Fecha = fechaActual,
                            HoraInicio = horario.HoraInicio,
                            HoraFin = horario.HoraFin,
                            Tema = null,
                            Observaciones = null,
                            Realizada = false
                        };

                        _context.Sesiones.Add(sesion);
                        resultado.SesionesGeneradas++;
                    }

                    fechaActual = fechaActual.AddDays(1);
                }

                await _context.SaveChangesAsync();

                resultado.Exitoso = true;
                resultado.Mensaje = $"{resultado.SesionesGeneradas} sesiones generadas";

                _logger.LogInformation(
                    "Generadas {Cantidad} sesiones para aula {AulaId}",
                    resultado.SesionesGeneradas, aulaId
                );

                return resultado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar sesiones para aula {AulaId}", aulaId);
                resultado.Errores.Add($"Error: {ex.Message}");
                resultado.Exitoso = false;
                return resultado;
            }
        }

        #endregion

        #region Validaciones

        public async Task<bool> ExisteConflictoHorarioAsync(
            int aulaId,
            DayOfWeek dia,
            TimeSpan horaInicio,
            TimeSpan horaFin,
            int? horarioId = null)
        {
            var query = _context.HorariosAulas
                .Where(h => h.AulaId == aulaId &&
                           h.DiaSemana == dia &&
                           h.Activo &&
                           ((h.HoraInicio < horaFin && h.HoraFin > horaInicio)));

            if (horarioId.HasValue)
            {
                query = query.Where(h => h.Id != horarioId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<bool> ExistsAsync(int horarioId)
        {
            return await _context.HorariosAulas.AnyAsync(h => h.Id == horarioId);
        }

        #endregion

        #region Para eliminar en cascada

        public async Task<ResultadoEliminacionHorarioDto> DeleteHorarioConCascadaAsync(int horarioId)
        {
            var resultado = new ResultadoEliminacionHorarioDto();

            try
            {
                var horario = await _context.HorariosAulas
                    .Include(h => h.Aula)
                    .Include(h => h.Curso)
                    .Include(h => h.Docente)
                    .FirstOrDefaultAsync(h => h.Id == horarioId);

                if (horario == null)
                {
                    resultado.Exitoso = false;
                    resultado.Mensaje = "Horario no encontrado";
                    return resultado;
                }

                // Buscar grupo-curso asociado
                var grupoCurso = await _context.GruposCursos
                    .FirstOrDefaultAsync(g =>
                        g.AulaId == horario.AulaId &&
                        g.CursoId == horario.CursoId &&
                        g.DocenteId == horario.DocenteId &&
                        g.Activo);

                if (grupoCurso != null)
                {
                    // Contar inscripciones antes de eliminar
                    var inscripciones = await _context.Inscripciones
                        .Where(i => i.GrupoCursoId == grupoCurso.Id)
                        .ToListAsync();

                    resultado.InscripcionesEliminadas = inscripciones.Count;

                    // Contar sesiones antes de eliminar
                    var sesiones = await _context.Sesiones
                        .Where(s => s.GrupoCursoId == grupoCurso.Id)
                        .ToListAsync();

                    resultado.SesionesEliminadas = sesiones.Count;

                    // Eliminar inscripciones
                    _context.Inscripciones.RemoveRange(inscripciones);

                    // Eliminar asistencias de las sesiones
                    foreach (var sesion in sesiones)
                    {
                        var asistencias = await _context.Asistencias
                            .Where(a => a.SesionId == sesion.Id)
                            .ToListAsync();
                        _context.Asistencias.RemoveRange(asistencias);
                    }

                    // Eliminar sesiones
                    _context.Sesiones.RemoveRange(sesiones);

                    // Eliminar grupo-curso
                    _context.GruposCursos.Remove(grupoCurso);
                    resultado.GruposCursosEliminados = 1;

                    resultado.Detalles.Add($"Grupo-curso eliminado: {grupoCurso.Codigo}");
                    resultado.Detalles.Add($"Sesiones eliminadas: {resultado.SesionesEliminadas}");
                    resultado.Detalles.Add($"Inscripciones eliminadas: {resultado.InscripcionesEliminadas}");
                }

                // Eliminar el horario
                _context.HorariosAulas.Remove(horario);

                await _context.SaveChangesAsync();

                resultado.Exitoso = true;
                resultado.Mensaje = "Horario y datos relacionados eliminados correctamente";

                _logger.LogInformation(
                    "Horario {HorarioId} eliminado en cascada: {Grupos} grupos, {Sesiones} sesiones, {Inscripciones} inscripciones",
                    horarioId, resultado.GruposCursosEliminados, resultado.SesionesEliminadas, resultado.InscripcionesEliminadas
                );

                return resultado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar horario {HorarioId} en cascada", horarioId);
                resultado.Exitoso = false;
                resultado.Mensaje = $"Error al eliminar: {ex.Message}";
                return resultado;
            }
        }

        #endregion

        #region Para editar en cascada
        public async Task<ResultadoEdicionHorarioDto> UpdateHorarioConCascadaAsync(int horarioId, UpdateHorarioAulaDto updateDto)
        {
            var resultado = new ResultadoEdicionHorarioDto();

            try
            {
                var horario = await _context.HorariosAulas
                    .Include(h => h.Curso)
                    .Include(h => h.Docente)
                    .Include(h => h.Aula)
                    .FirstOrDefaultAsync(h => h.Id == horarioId);

                if (horario == null)
                {
                    resultado.Exitoso = false;
                    resultado.Mensaje = "Horario no encontrado";
                    return resultado;
                }

                // Validar conflicto de horario
                if (await ExisteConflictoHorarioAsync(
                    horario.AulaId,
                    horario.DiaSemana,
                    updateDto.HoraInicio,
                    updateDto.HoraFin,
                    horarioId))
                {
                    resultado.Exitoso = false;
                    resultado.Mensaje = "Ya existe un horario en ese día y hora para esta aula";
                    return resultado;
                }

                if (updateDto.HoraFin <= updateDto.HoraInicio)
                {
                    resultado.Exitoso = false;
                    resultado.Mensaje = "La hora de fin debe ser posterior a la hora de inicio";
                    return resultado;
                }

                var docenteAnterior = horario.DocenteId;
                var horaInicioAnterior = horario.HoraInicio;
                var horaFinAnterior = horario.HoraFin;

                // Actualizar horario
                horario.DocenteId = updateDto.DocenteId;
                horario.HoraInicio = updateDto.HoraInicio;
                horario.HoraFin = updateDto.HoraFin;
                horario.Orden = updateDto.Orden;
                horario.Activo = updateDto.Activo;

                await _context.SaveChangesAsync();

                // Buscar grupo-curso asociado
                var grupoCurso = await _context.GruposCursos
                    .FirstOrDefaultAsync(g =>
                        g.AulaId == horario.AulaId &&
                        g.CursoId == horario.CursoId &&
                        g.DocenteId == docenteAnterior &&
                        g.Activo);

                if (grupoCurso != null)
                {
                    // Actualizar docente del grupo
                    grupoCurso.DocenteId = updateDto.DocenteId;
                    resultado.GruposCursosActualizados = 1;
                    resultado.Detalles.Add($"Grupo-curso actualizado: {grupoCurso.Codigo}");

                    // Actualizar sesiones futuras
                    var hoy = DateTime.UtcNow.Date;
                    var sesionesFuturas = await _context.Sesiones
                        .Where(s => s.GrupoCursoId == grupoCurso.Id &&
                                   s.Fecha >= hoy &&
                                   s.HoraInicio == horaInicioAnterior &&
                                   s.HoraFin == horaFinAnterior &&
                                   !s.Realizada)
                        .ToListAsync();

                    foreach (var sesion in sesionesFuturas)
                    {
                        sesion.HoraInicio = updateDto.HoraInicio;
                        sesion.HoraFin = updateDto.HoraFin;
                    }

                    resultado.SesionesFuturasActualizadas = sesionesFuturas.Count;
                    resultado.Detalles.Add($"Sesiones futuras actualizadas: {resultado.SesionesFuturasActualizadas}");

                    await _context.SaveChangesAsync();
                }

                // Recargar horario con relaciones
                await _context.Entry(horario).Reference(h => h.Docente).LoadAsync();

                var culture = new CultureInfo("es-DO");
                resultado.HorarioActualizado = MapToDto(horario, culture);
                resultado.Exitoso = true;
                resultado.Mensaje = "Horario y datos relacionados actualizados correctamente";

                _logger.LogInformation(
                    "Horario {HorarioId} actualizado en cascada: {Grupos} grupos, {Sesiones} sesiones",
                    horarioId, resultado.GruposCursosActualizados, resultado.SesionesFuturasActualizadas
                );

                return resultado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar horario {HorarioId} en cascada", horarioId);
                resultado.Exitoso = false;
                resultado.Mensaje = $"Error al actualizar: {ex.Message}";
                return resultado;
            }
        }
        #endregion

        #region Mapper

        private HorarioAulaDto MapToDto(HorarioAula horario, CultureInfo culture)
        {
            return new HorarioAulaDto
            {
                Id = horario.Id,
                AulaId = horario.AulaId,
                CursoId = horario.CursoId,
                CodigoCurso = horario.Curso.Codigo,
                NombreCurso = horario.Curso.Nombre,
                AreaConocimiento = horario.Curso.AreaConocimiento,
                DocenteId = horario.DocenteId,
                CodigoDocente = horario.Docente.Codigo,
                NombreDocente = $"{horario.Docente.Nombres} {horario.Docente.Apellidos}",
                DiaSemana = horario.DiaSemana,
                DiaSemanaTexto = culture.DateTimeFormat.GetDayName(horario.DiaSemana),
                HoraInicio = horario.HoraInicio,
                HoraFin = horario.HoraFin,
                Orden = horario.Orden,
                Activo = horario.Activo
            };
        }

        #endregion
    }
}
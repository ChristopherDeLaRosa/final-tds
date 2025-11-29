using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace EduCore.API.Services.Implementations
{
    public class AulaService : IAulaService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<AulaService> _logger;

        public AulaService(EduCoreDbContext context, ILogger<AulaService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region CRUD Básico

        public async Task<IEnumerable<AulaDto>> GetAllAsync()
        {
            var aulas = await _context.Aulas
                .Include(a => a.Estudiantes)
                .Include(a => a.Horarios)
                .Where(a => a.Activo)
                .OrderBy(a => a.Grado)
                .ThenBy(a => a.Seccion)
                .ToListAsync();

            return aulas.Select(a => MapToDto(a));
        }

        public async Task<AulaDto?> GetByIdAsync(int id)
        {
            var aula = await _context.Aulas
                .Include(a => a.Estudiantes)
                .Include(a => a.Horarios)
                .FirstOrDefaultAsync(a => a.Id == id);

            return aula != null ? MapToDto(aula) : null;
        }

        public async Task<AulaDetalleDto?> GetDetalleByIdAsync(int id)
        {
            var aula = await _context.Aulas
                .Include(a => a.Estudiantes)
                .Include(a => a.Horarios)
                    .ThenInclude(h => h.Curso)
                .Include(a => a.Horarios)
                    .ThenInclude(h => h.Docente)
                .Include(a => a.GruposCursos)
                    .ThenInclude(g => g.Curso)
                .Include(a => a.GruposCursos)
                    .ThenInclude(g => g.Docente)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (aula == null)
                return null;

            var culture = new CultureInfo("es-DO");

            return new AulaDetalleDto
            {
                Aula = MapToDto(aula),
                Horarios = aula.Horarios
                    .Where(h => h.Activo)
                    .OrderBy(h => h.DiaSemana)
                    .ThenBy(h => h.HoraInicio)
                    .Select(h => new HorarioAulaDto
                    {
                        Id = h.Id,
                        AulaId = h.AulaId,
                        CursoId = h.CursoId,
                        CodigoCurso = h.Curso.Codigo,
                        NombreCurso = h.Curso.Nombre,
                        AreaConocimiento = h.Curso.AreaConocimiento,
                        DocenteId = h.DocenteId,
                        CodigoDocente = h.Docente.Codigo,
                        NombreDocente = $"{h.Docente.Nombres} {h.Docente.Apellidos}",
                        DiaSemana = h.DiaSemana,
                        DiaSemanaTexto = culture.DateTimeFormat.GetDayName(h.DiaSemana),
                        HoraInicio = h.HoraInicio,
                        HoraFin = h.HoraFin,
                        Orden = h.Orden,
                        Activo = h.Activo
                    }).ToList(),
                Estudiantes = aula.Estudiantes
                    .Where(e => e.Activo)
                    .OrderBy(e => e.Apellidos)
                    .ThenBy(e => e.Nombres)
                    .Select(e => new EstudianteDto
                    {
                        Id = e.Id,
                        Matricula = e.Matricula,
                        Nombres = e.Nombres,
                        Apellidos = e.Apellidos,
                        Email = e.Email,
                        Telefono = e.Telefono,
                        Direccion = e.Direccion,
                        FechaNacimiento = e.FechaNacimiento,
                        FechaIngreso = e.FechaIngreso,
                        GradoActual = e.GradoActual,
                        SeccionActual = e.SeccionActual,
                        NombreTutor = e.NombreTutor,
                        TelefonoTutor = e.TelefonoTutor,
                        EmailTutor = e.EmailTutor,
                        ObservacionesMedicas = e.ObservacionesMedicas,
                        Activo = e.Activo
                    }).ToList(),
                GruposCursos = aula.GruposCursos
                    .Where(g => g.Activo)
                    .OrderBy(g => g.Curso.Orden)
                    .Select(g => new GrupoCursoDto
                    {
                        Id = g.Id,
                        Codigo = g.Codigo,
                        CursoId = g.CursoId,
                        CodigoCurso = g.Curso.Codigo,
                        NombreCurso = g.Curso.Nombre,
                        DocenteId = g.DocenteId,
                        CodigoDocente = g.Docente.Codigo,
                        NombreDocente = $"{g.Docente.Nombres} {g.Docente.Apellidos}",
                        Grado = g.Grado,
                        Seccion = g.Seccion,
                        Anio = g.Anio,
                        Periodo = g.Periodo,
                        AulaId = g.AulaId,
                        AulaFisica = aula.AulaFisica,
                        Horario = g.Horario,
                        CapacidadMaxima = g.CapacidadMaxima,
                        CantidadEstudiantes = g.CantidadEstudiantes,
                        Activo = g.Activo
                    }).ToList()
            };
        }

        public async Task<AulaDto?> GetByGradoSeccionPeriodoAsync(int grado, string seccion, string periodo)
        {
            var aula = await _context.Aulas
                .Include(a => a.Estudiantes)
                .Include(a => a.Horarios)
                .FirstOrDefaultAsync(a => a.Grado == grado &&
                                         a.Seccion == seccion &&
                                         a.Periodo == periodo &&
                                         a.Activo);

            return aula != null ? MapToDto(aula) : null;
        }

        public async Task<IEnumerable<AulaDto>> GetByPeriodoAsync(string periodo)
        {
            var aulas = await _context.Aulas
                .Include(a => a.Estudiantes)
                .Include(a => a.Horarios)
                .Where(a => a.Periodo == periodo && a.Activo)
                .OrderBy(a => a.Grado)
                .ThenBy(a => a.Seccion)
                .ToListAsync();

            return aulas.Select(a => MapToDto(a));
        }

        public async Task<AulaDto> CreateAsync(CreateAulaDto createDto)
        {
            // Validar que no exista ya
            var existe = await _context.Aulas
                .AnyAsync(a => a.Grado == createDto.Grado &&
                              a.Seccion == createDto.Seccion &&
                              a.Periodo == createDto.Periodo &&
                              a.Activo);

            if (existe)
            {
                throw new InvalidOperationException(
                    $"Ya existe un aula para {createDto.Grado}° {createDto.Seccion} en el periodo {createDto.Periodo}"
                );
            }

            var codigo = $"{createDto.Grado}{createDto.Seccion}-{createDto.Anio}";

            var aula = new Aula
            {
                Codigo = codigo,
                Grado = createDto.Grado,
                Seccion = createDto.Seccion,
                Anio = createDto.Anio,
                Periodo = createDto.Periodo,
                AulaFisica = createDto.AulaFisica,
                CapacidadMaxima = createDto.CapacidadMaxima,
                FechaInicio = createDto.FechaInicio.Date,
                FechaFin = createDto.FechaFin.Date,
                CantidadEstudiantes = 0,
                Activo = true
            };

            _context.Aulas.Add(aula);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Aula creada: {Codigo} - {Grado}° {Seccion} - Periodo: {Periodo}",
                aula.Codigo, aula.Grado, aula.Seccion, aula.Periodo
            );

            return MapToDto(aula);
        }

        public async Task<AulaDto?> UpdateAsync(int id, UpdateAulaDto updateDto)
        {
            var aula = await _context.Aulas
                .Include(a => a.Estudiantes)
                .Include(a => a.Horarios)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (aula == null)
                return null;

            aula.AulaFisica = updateDto.AulaFisica;
            aula.CapacidadMaxima = updateDto.CapacidadMaxima;
            aula.FechaInicio = updateDto.FechaInicio.Date;
            aula.FechaFin = updateDto.FechaFin.Date;
            aula.Activo = updateDto.Activo;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Aula actualizada: {Id} - {Codigo}", id, aula.Codigo);

            return MapToDto(aula);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var aula = await _context.Aulas
                .Include(a => a.Estudiantes)
                .Include(a => a.GruposCursos)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (aula == null)
                return false;

            // Verificar si tiene estudiantes o grupos activos
            if (aula.Estudiantes.Any(e => e.Activo) || aula.GruposCursos.Any(g => g.Activo))
            {
                _logger.LogWarning(
                    "No se puede eliminar el aula {Id} porque tiene estudiantes o grupos activos",
                    id
                );
                return false;
            }

            // Soft delete
            aula.Activo = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Aula eliminada (soft delete): {Id} - {Codigo}", id, aula.Codigo);

            return true;
        }

        #endregion

        #region Gestión de Horarios

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

            return horarios.Select(h => new HorarioAulaDto
            {
                Id = h.Id,
                AulaId = h.AulaId,
                CursoId = h.CursoId,
                CodigoCurso = h.Curso.Codigo,
                NombreCurso = h.Curso.Nombre,
                AreaConocimiento = h.Curso.AreaConocimiento,
                DocenteId = h.DocenteId,
                CodigoDocente = h.Docente.Codigo,
                NombreDocente = $"{h.Docente.Nombres} {h.Docente.Apellidos}",
                DiaSemana = h.DiaSemana,
                DiaSemanaTexto = culture.DateTimeFormat.GetDayName(h.DiaSemana),
                HoraInicio = h.HoraInicio,
                HoraFin = h.HoraFin,
                Orden = h.Orden,
                Activo = h.Activo
            });
        }

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
                        Periodo = aula.Periodo,
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

        #region Gestión de Estudiantes

        public async Task<bool> AsignarEstudianteAsync(int estudianteId, int aulaId)
        {
            var estudiante = await _context.Estudiantes.FindAsync(estudianteId);
            var aula = await _context.Aulas.FindAsync(aulaId);

            if (estudiante == null || aula == null)
                return false;

            // Validar cupo
            if (!await TieneCupoAsync(aulaId))
            {
                throw new InvalidOperationException("El aula no tiene cupos disponibles");
            }

            // Remover de aula anterior si tiene
            if (estudiante.AulaId.HasValue)
            {
                var aulaAnterior = await _context.Aulas.FindAsync(estudiante.AulaId.Value);
                if (aulaAnterior != null && aulaAnterior.CantidadEstudiantes > 0)
                {
                    aulaAnterior.CantidadEstudiantes--;
                }
            }

            // Asignar a nueva aula
            estudiante.AulaId = aulaId;
            estudiante.GradoActual = aula.Grado;
            estudiante.SeccionActual = aula.Seccion;
            aula.CantidadEstudiantes++;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Estudiante {EstudianteId} asignado a aula {AulaId}",
                estudianteId, aulaId
            );

            return true;
        }

        public async Task<bool> RemoverEstudianteAsync(int estudianteId)
        {
            var estudiante = await _context.Estudiantes.FindAsync(estudianteId);

            if (estudiante == null || !estudiante.AulaId.HasValue)
                return false;

            var aula = await _context.Aulas.FindAsync(estudiante.AulaId.Value);
            if (aula != null && aula.CantidadEstudiantes > 0)
            {
                aula.CantidadEstudiantes--;
            }

            estudiante.AulaId = null;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Estudiante {EstudianteId} removido del aula", estudianteId);

            return true;
        }

        public async Task<ResultadoInscripcionMasivaDto> InscribirEstudiantesEnAulaAsync(
            int aulaId,
            List<int> estudiantesIds)
        {
            var resultado = new ResultadoInscripcionMasivaDto
            {
                TotalProcesados = estudiantesIds.Count
            };

            var aula = await _context.Aulas
                .Include(a => a.GruposCursos)
                .FirstOrDefaultAsync(a => a.Id == aulaId);

            if (aula == null)
            {
                resultado.Errores.Add(new ErrorInscripcionDto
                {
                    Motivo = "Aula no encontrada"
                });
                return resultado;
            }

            var gruposCursos = aula.GruposCursos.Where(g => g.Activo).ToList();

            if (!gruposCursos.Any())
            {
                resultado.Errores.Add(new ErrorInscripcionDto
                {
                    Motivo = "El aula no tiene grupos-cursos creados"
                });
                return resultado;
            }

            foreach (var estudianteId in estudiantesIds)
            {
                try
                {
                    var estudiante = await _context.Estudiantes.FindAsync(estudianteId);
                    if (estudiante == null)
                    {
                        resultado.Fallidos++;
                        resultado.Errores.Add(new ErrorInscripcionDto
                        {
                            EstudianteId = estudianteId,
                            Motivo = "Estudiante no encontrado"
                        });
                        continue;
                    }

                    // Asignar al aula
                    if (estudiante.AulaId.HasValue)
                    {
                        var aulaAnterior = await _context.Aulas.FindAsync(estudiante.AulaId.Value);
                        if (aulaAnterior != null && aulaAnterior.CantidadEstudiantes > 0)
                        {
                            aulaAnterior.CantidadEstudiantes--;
                        }
                    }

                    estudiante.AulaId = aulaId;
                    estudiante.GradoActual = aula.Grado;
                    estudiante.SeccionActual = aula.Seccion;
                    aula.CantidadEstudiantes++;

                    // Inscribir en todos los grupos-cursos del aula
                    foreach (var grupo in gruposCursos)
                    {
                        // Verificar si ya está inscrito
                        var yaInscrito = await _context.Inscripciones
                            .AnyAsync(i => i.EstudianteId == estudianteId &&
                                          i.GrupoCursoId == grupo.Id &&
                                          i.Activo);

                        if (yaInscrito)
                            continue;

                        var inscripcion = new Inscripcion
                        {
                            EstudianteId = estudianteId,
                            GrupoCursoId = grupo.Id,
                            FechaInscripcion = DateTime.UtcNow,
                            Estado = "Activo",
                            Activo = true
                        };

                        _context.Inscripciones.Add(inscripcion);
                        grupo.CantidadEstudiantes++;
                    }

                    resultado.Exitosos++;
                }
                catch (Exception ex)
                {
                    resultado.Fallidos++;
                    resultado.Errores.Add(new ErrorInscripcionDto
                    {
                        EstudianteId = estudianteId,
                        Motivo = ex.Message
                    });
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Inscripción masiva en aula {AulaId}: {Exitosos} exitosos, {Fallidos} fallidos",
                aulaId, resultado.Exitosos, resultado.Fallidos
            );

            return resultado;
        }

        #endregion

        #region Validaciones

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Aulas.AnyAsync(a => a.Id == id);
        }

        public async Task<bool> TieneCupoAsync(int aulaId)
        {
            var aula = await _context.Aulas.FindAsync(aulaId);
            return aula != null && aula.CantidadEstudiantes < aula.CapacidadMaxima;
        }

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

        #endregion

        #region Mappers

        private AulaDto MapToDto(Aula aula)
        {
            var cuposDisponibles = aula.CapacidadMaxima - aula.CantidadEstudiantes;

            return new AulaDto
            {
                Id = aula.Id,
                Codigo = aula.Codigo,
                Grado = aula.Grado,
                Seccion = aula.Seccion,
                Anio = aula.Anio,
                Periodo = aula.Periodo,
                AulaFisica = aula.AulaFisica,
                CapacidadMaxima = aula.CapacidadMaxima,
                CantidadEstudiantes = aula.CantidadEstudiantes,
                FechaInicio = aula.FechaInicio,
                FechaFin = aula.FechaFin,
                Activo = aula.Activo,
                CantidadCursos = aula.Horarios?.Count(h => h.Activo) ?? 0,
                CuposDisponibles = cuposDisponibles > 0 ? cuposDisponibles : 0
            };
        }

        #endregion
    }
}
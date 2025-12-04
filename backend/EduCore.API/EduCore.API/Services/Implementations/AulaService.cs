using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class AulaService : IAulaService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<AulaService> _logger;
        private readonly IHorarioAulaService _horarioService;

        public AulaService(
            EduCoreDbContext context,
            ILogger<AulaService> logger,
            IHorarioAulaService horarioService)
        {
            _context = context;
            _logger = logger;
            _horarioService = horarioService;
        }

        #region CRUD Básico

        public async Task<IEnumerable<AulaDto>> GetAllAsync()
        {
            var aulas = await _context.Aulas
                .Include(a => a.Periodo)
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
                .Include(a => a.Periodo)
                .Include(a => a.Estudiantes)
                .Include(a => a.Horarios)
                .FirstOrDefaultAsync(a => a.Id == id);

            return aula != null ? MapToDto(aula) : null;
        }

        public async Task<AulaDetalleDto?> GetDetalleByIdAsync(int id)
        {
            var aula = await _context.Aulas
                .Include(a => a.Periodo)
                .Include(a => a.Estudiantes)
                .Include(a => a.GruposCursos)
                    .ThenInclude(g => g.Curso)
                .Include(a => a.GruposCursos)
                    .ThenInclude(g => g.Docente)
                .Include(a => a.GruposCursos)
                    .ThenInclude(g => g.Periodo)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (aula == null)
                return null;

            // Obtener horarios del servicio dedicado
            var horarios = await _horarioService.GetHorariosAulaAsync(id);

            return new AulaDetalleDto
            {
                Aula = MapToDto(aula),
                Horarios = horarios.ToList(),
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
                        Periodo = g.Periodo.Nombre,
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
                .Include(a => a.Periodo)
                .Include(a => a.Estudiantes)
                .Include(a => a.Horarios)
                .FirstOrDefaultAsync(a => a.Grado == grado &&
                                         a.Seccion == seccion &&
                                         a.Periodo.Nombre == periodo &&
                                         a.Activo);

            return aula != null ? MapToDto(aula) : null;
        }

        public async Task<IEnumerable<AulaDto>> GetByPeriodoAsync(string periodo)
        {
            var aulas = await _context.Aulas
                .Include(a => a.Periodo)
                .Include(a => a.Estudiantes)
                .Include(a => a.Horarios)
                .Where(a => a.Periodo.Nombre == periodo && a.Activo)
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
                              a.PeriodoId == createDto.PeriodoId &&
                              a.Activo);

            if (existe)
            {
                throw new InvalidOperationException(
                    $"Ya existe un aula para {createDto.Grado}° {createDto.Seccion} en el periodo especificado"
                );
            }

            var codigo = $"{createDto.Grado}{createDto.Seccion}-{createDto.Anio}";

            var aula = new Aula
            {
                Codigo = codigo,
                Grado = createDto.Grado,
                Seccion = createDto.Seccion,
                Anio = createDto.Anio,
                PeriodoId = createDto.PeriodoId,
                AulaFisica = createDto.AulaFisica,
                CapacidadMaxima = createDto.CapacidadMaxima,
                FechaInicio = createDto.FechaInicio.Date,
                FechaFin = createDto.FechaFin.Date,
                CantidadEstudiantes = 0,
                Activo = true
            };

            _context.Aulas.Add(aula);
            await _context.SaveChangesAsync();

            // Cargar la relación con Periodo para el log
            await _context.Entry(aula)
                .Reference(a => a.Periodo)
                .LoadAsync();

            _logger.LogInformation(
                "Aula creada: {Codigo} - {Grado}° {Seccion} - Periodo: {Periodo}",
                aula.Codigo, aula.Grado, aula.Seccion, aula.Periodo.Nombre
            );

            return MapToDto(aula);
        }

        public async Task<AulaDto?> UpdateAsync(int id, UpdateAulaDto updateDto)
        {
            var aula = await _context.Aulas
                .Include(a => a.Periodo)
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

        #region Gestión de Horarios (Delegado)

        public async Task<IEnumerable<HorarioAulaDto>> GetHorariosAulaAsync(int aulaId)
        {
            return await _horarioService.GetHorariosAulaAsync(aulaId);
        }

        public async Task<HorarioAulaDto> CreateHorarioAsync(CreateHorarioAulaDto createDto)
        {
            return await _horarioService.CreateHorarioAsync(createDto);
        }

        public async Task<HorarioAulaDto?> UpdateHorarioAsync(int horarioId, UpdateHorarioAulaDto updateDto)
        {
            return await _horarioService.UpdateHorarioAsync(horarioId, updateDto);
        }

        public async Task<bool> DeleteHorarioAsync(int horarioId)
        {
            return await _horarioService.DeleteHorarioAsync(horarioId);
        }

        public async Task<ResultadoConfiguracionAulaDto> ConfigurarHorarioCompletoAsync(
            ConfigurarHorarioCompletoDto configDto)
        {
            return await _horarioService.ConfigurarHorarioCompletoAsync(configDto);
        }

        #endregion

        #region Auto-generación (Delegado)

        public async Task<ResultadoConfiguracionAulaDto> GenerarGruposCursosDesdeHorarioAsync(int aulaId)
        {
            return await _horarioService.GenerarGruposCursosDesdeHorarioAsync(aulaId);
        }

        public async Task<ResultadoConfiguracionAulaDto> GenerarSesionesParaAulaAsync(int aulaId)
        {
            return await _horarioService.GenerarSesionesParaAulaAsync(aulaId);
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
            return await _horarioService.ExisteConflictoHorarioAsync(
                aulaId, dia, horaInicio, horaFin, horarioId);
        }

        #endregion

        #region Aulas Masivas

        public async Task<ResultadoCreacionMasivaDto> CrearAulasMasivasAsync(CrearAulasMasivasDto dto)
        {
            var resultado = new ResultadoCreacionMasivaDto();

            try
            {
                // Buscar el periodo por nombre
                var periodo = await _context.Periodos
                    .FirstOrDefaultAsync(p => p.Nombre == dto.Periodo && p.Activo);

                if (periodo == null)
                {
                    resultado.Errores.Add($"Periodo {dto.Periodo} no encontrado");
                    resultado.Exitoso = false;
                    return resultado;
                }

                foreach (var gradoConfig in dto.Grados)
                {
                    foreach (var seccion in gradoConfig.Secciones)
                    {
                        try
                        {
                            // Verificar si ya existe
                            var existe = await _context.Aulas
                                .AnyAsync(a => a.Grado == gradoConfig.Grado &&
                                              a.Seccion == seccion &&
                                              a.PeriodoId == periodo.Id &&
                                              a.Activo);

                            if (existe)
                            {
                                resultado.AulasExistentes++;
                                resultado.Errores.Add(
                                    $"El aula {gradoConfig.Grado}° {seccion} ya existe para el periodo {dto.Periodo}"
                                );
                                continue;
                            }

                            // Crear código
                            var codigo = $"{gradoConfig.Grado}{seccion}-{dto.Anio}";

                            // Determinar aula física
                            var aulaFisica = string.IsNullOrWhiteSpace(gradoConfig.AulaFisicaBase)
                                ? $"Aula {gradoConfig.Grado}{seccion}"
                                : $"{gradoConfig.AulaFisicaBase} - {gradoConfig.Grado}{seccion}";

                            // Determinar capacidad
                            var capacidad = gradoConfig.CapacidadMaxima ?? dto.CapacidadMaximaPorDefecto;

                            var aula = new Aula
                            {
                                Codigo = codigo,
                                Grado = gradoConfig.Grado,
                                Seccion = seccion,
                                Anio = dto.Anio,
                                PeriodoId = periodo.Id,
                                AulaFisica = aulaFisica,
                                CapacidadMaxima = capacidad,
                                FechaInicio = dto.FechaInicio.Date,
                                FechaFin = dto.FechaFin.Date,
                                CantidadEstudiantes = 0,
                                Activo = true
                            };

                            _context.Aulas.Add(aula);
                            resultado.AulasCreadas++;

                            _logger.LogInformation(
                                "Aula masiva creada: {Codigo} - {Grado}° {Seccion}",
                                aula.Codigo, aula.Grado, aula.Seccion
                            );
                        }
                        catch (Exception ex)
                        {
                            resultado.Errores.Add(
                                $"Error al crear {gradoConfig.Grado}° {seccion}: {ex.Message}"
                            );
                        }
                    }
                }

                await _context.SaveChangesAsync();

                // Cargar las aulas creadas con sus relaciones para el resultado
                var aulasCreadas = await _context.Aulas
                    .Include(a => a.Periodo)
                    .Where(a => a.PeriodoId == periodo.Id &&
                               dto.Grados.Select(g => g.Grado).Contains(a.Grado))
                    .ToListAsync();

                resultado.AulasNuevas = aulasCreadas
                    .Where(a => !resultado.AulasNuevas.Any(an => an.Id == a.Id))
                    .Select(a => MapToDto(a))
                    .ToList();

                resultado.Exitoso = resultado.AulasCreadas > 0;
                resultado.Mensaje = resultado.Exitoso
                    ? $"Se crearon {resultado.AulasCreadas} aulas exitosamente. {resultado.AulasExistentes} ya existían."
                    : "No se pudo crear ninguna aula";

                _logger.LogInformation(
                    "Creación masiva completada: {Creadas} creadas, {Existentes} existentes, {Errores} errores",
                    resultado.AulasCreadas, resultado.AulasExistentes, resultado.Errores.Count
                );

                return resultado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en creación masiva de aulas");
                resultado.Errores.Add($"Error general: {ex.Message}");
                resultado.Exitoso = false;
                return resultado;
            }
        }

        #endregion

        #region Mapper

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
                Periodo = aula.Periodo?.Nombre ?? string.Empty,
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
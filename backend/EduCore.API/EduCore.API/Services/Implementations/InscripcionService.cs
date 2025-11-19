using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class InscripcionService : IInscripcionService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<InscripcionService> _logger;

        public InscripcionService(EduCoreDbContext context, ILogger<InscripcionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<InscripcionDto?> GetByIdAsync(int id)
        {
            var inscripcion = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Docente)
                .FirstOrDefaultAsync(i => i.Id == id);

            return inscripcion != null ? MapToDto(inscripcion) : null;
        }

        public async Task<InscripcionDetalleDto?> GetDetalleByIdAsync(int id)
        {
            var inscripcion = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Docente)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inscripcion == null)
                return null;

            // Obtener estadísticas de asistencia
            var asistencias = await _context.Asistencias
                .Include(a => a.Sesion)
                .Where(a => a.EstudianteId == inscripcion.EstudianteId &&
                           a.Sesion.GrupoCursoId == inscripcion.GrupoCursoId)
                .ToListAsync();

            var totalAsistencias = asistencias.Count;
            var presentes = asistencias.Count(a => a.Estado == "Presente");
            var porcentajeAsistencia = totalAsistencias > 0
                ? Math.Round((decimal)presentes / totalAsistencias * 100, 2)
                : 0;

            // Obtener total de calificaciones
            var totalCalificaciones = await _context.Calificaciones
                .Include(c => c.Rubro)
                .Where(c => c.EstudianteId == inscripcion.EstudianteId &&
                           c.Rubro.GrupoCursoId == inscripcion.GrupoCursoId)
                .CountAsync();

            return new InscripcionDetalleDto
            {
                Id = inscripcion.Id,
                Estudiante = new EstudianteDto
                {
                    Id = inscripcion.Estudiante.Id,
                    Matricula = inscripcion.Estudiante.Matricula,
                    Nombres = inscripcion.Estudiante.Nombres,
                    Apellidos = inscripcion.Estudiante.Apellidos,
                    Email = inscripcion.Estudiante.Email,
                    Telefono = inscripcion.Estudiante.Telefono,
                    Direccion = inscripcion.Estudiante.Direccion,
                    FechaNacimiento = inscripcion.Estudiante.FechaNacimiento,
                    FechaIngreso = inscripcion.Estudiante.FechaIngreso,
                    GradoActual = inscripcion.Estudiante.GradoActual,
                    SeccionActual = inscripcion.Estudiante.SeccionActual,
                    NombreTutor = inscripcion.Estudiante.NombreTutor,
                    TelefonoTutor = inscripcion.Estudiante.TelefonoTutor,
                    EmailTutor = inscripcion.Estudiante.EmailTutor,
                    ObservacionesMedicas = inscripcion.Estudiante.ObservacionesMedicas,
                    Activo = inscripcion.Estudiante.Activo
                },
                GrupoCurso = new GrupoCursoDto
                {
                    Id = inscripcion.GrupoCurso.Id,
                    Codigo = inscripcion.GrupoCurso.Codigo,
                    CursoId = inscripcion.GrupoCurso.CursoId,
                    CodigoCurso = inscripcion.GrupoCurso.Curso.Codigo,
                    NombreCurso = inscripcion.GrupoCurso.Curso.Nombre,
                    DocenteId = inscripcion.GrupoCurso.DocenteId,
                    CodigoDocente = inscripcion.GrupoCurso.Docente.Codigo,
                    NombreDocente = $"{inscripcion.GrupoCurso.Docente.Nombres} {inscripcion.GrupoCurso.Docente.Apellidos}",
                    Grado = inscripcion.GrupoCurso.Grado,
                    Seccion = inscripcion.GrupoCurso.Seccion,
                    Anio = inscripcion.GrupoCurso.Anio,
                    Periodo = inscripcion.GrupoCurso.Periodo,
                    Aula = inscripcion.GrupoCurso.Aula,
                    Horario = inscripcion.GrupoCurso.Horario,
                    CapacidadMaxima = inscripcion.GrupoCurso.CapacidadMaxima,
                    CantidadEstudiantes = inscripcion.GrupoCurso.CantidadEstudiantes,
                    Activo = inscripcion.GrupoCurso.Activo
                },
                FechaInscripcion = inscripcion.FechaInscripcion,
                Estado = inscripcion.Estado,
                PromedioFinal = inscripcion.PromedioFinal,
                Activo = inscripcion.Activo,
                TotalAsistencias = totalAsistencias,
                Presentes = presentes,
                PorcentajeAsistencia = porcentajeAsistencia,
                TotalCalificaciones = totalCalificaciones
            };
        }

        public async Task<IEnumerable<InscripcionDto>> GetByEstudianteAsync(int estudianteId)
        {
            var inscripciones = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Docente)
                .Where(i => i.EstudianteId == estudianteId && i.Activo)
                .OrderByDescending(i => i.FechaInscripcion)
                .ToListAsync();

            return inscripciones.Select(i => MapToDto(i));
        }

        public async Task<HorarioEstudianteDto?> GetHorarioEstudianteAsync(int estudianteId, string periodo)
        {
            var estudiante = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.Id == estudianteId);

            if (estudiante == null)
                return null;

            var inscripciones = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Docente)
                .Where(i => i.EstudianteId == estudianteId &&
                           i.GrupoCurso.Periodo == periodo &&
                           i.Activo)
                .OrderBy(i => i.GrupoCurso.Curso.Orden)
                .ToListAsync();

            var totalMaterias = inscripciones.Count;
            var aprobadas = inscripciones.Count(i => i.PromedioFinal >= 70);
            var reprobadas = inscripciones.Count(i => i.PromedioFinal < 70 && i.PromedioFinal.HasValue);

            var promedios = inscripciones
                .Where(i => i.PromedioFinal.HasValue)
                .Select(i => i.PromedioFinal!.Value)
                .ToList();

            var promedioGeneral = promedios.Any() ? Math.Round(promedios.Average(), 2) : 0;

            return new HorarioEstudianteDto
            {
                EstudianteId = estudiante.Id,
                Matricula = estudiante.Matricula,
                NombreCompleto = $"{estudiante.Nombres} {estudiante.Apellidos}",
                GradoActual = estudiante.GradoActual,
                SeccionActual = estudiante.SeccionActual,
                Periodo = periodo,
                Inscripciones = inscripciones.Select(i => MapToDto(i)).ToList(),
                TotalMaterias = totalMaterias,
                MateriasAprobadas = aprobadas,
                MateriasReprobadas = reprobadas,
                PromedioGeneral = promedioGeneral
            };
        }

        public async Task<IEnumerable<InscripcionDto>> GetByGrupoCursoAsync(int grupoCursoId)
        {
            var inscripciones = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Docente)
                .Where(i => i.GrupoCursoId == grupoCursoId && i.Activo)
                .OrderBy(i => i.Estudiante.Apellidos)
                .ThenBy(i => i.Estudiante.Nombres)
                .ToListAsync();

            return inscripciones.Select(i => MapToDto(i));
        }

        public async Task<ListaEstudiantesGrupoDto?> GetListaEstudiantesGrupoAsync(int grupoCursoId)
        {
            var grupoCurso = await _context.GruposCursos
                .Include(g => g.Curso)
                .FirstOrDefaultAsync(g => g.Id == grupoCursoId);

            if (grupoCurso == null)
                return null;

            var inscripciones = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Where(i => i.GrupoCursoId == grupoCursoId && i.Activo)
                .OrderBy(i => i.Estudiante.Apellidos)
                .ThenBy(i => i.Estudiante.Nombres)
                .ToListAsync();

            var estudiantes = inscripciones.Select(i => new EstudianteInscritoGrupoDto
            {
                InscripcionId = i.Id,
                EstudianteId = i.EstudianteId,
                Matricula = i.Estudiante.Matricula,
                NombreCompleto = $"{i.Estudiante.Nombres} {i.Estudiante.Apellidos}",
                Estado = i.Estado,
                FechaInscripcion = i.FechaInscripcion,
                PromedioFinal = i.PromedioFinal
            }).ToList();

            var cuposDisponibles = grupoCurso.CapacidadMaxima - grupoCurso.CantidadEstudiantes;

            return new ListaEstudiantesGrupoDto
            {
                GrupoCursoId = grupoCurso.Id,
                CodigoGrupo = grupoCurso.Codigo,
                NombreCurso = grupoCurso.Curso.Nombre,
                Grado = grupoCurso.Grado,
                Seccion = grupoCurso.Seccion,
                Periodo = grupoCurso.Periodo,
                CapacidadMaxima = grupoCurso.CapacidadMaxima,
                CantidadEstudiantes = grupoCurso.CantidadEstudiantes,
                CuposDisponibles = cuposDisponibles > 0 ? cuposDisponibles : 0,
                Estudiantes = estudiantes
            };
        }

        public async Task<InscripcionDto> CreateAsync(CreateInscripcionDto createDto)
        {
            // Validar que no esté ya inscrito
            if (await YaInscritoAsync(createDto.EstudianteId, createDto.GrupoCursoId))
            {
                throw new InvalidOperationException(
                    "El estudiante ya está inscrito en este grupo-curso"
                );
            }

            // Validar que haya cupo
            if (!await GrupoTieneCupoAsync(createDto.GrupoCursoId))
            {
                throw new InvalidOperationException(
                    "El grupo-curso ha alcanzado su capacidad máxima"
                );
            }

            var inscripcion = new Inscripcion
            {
                EstudianteId = createDto.EstudianteId,
                GrupoCursoId = createDto.GrupoCursoId,
                FechaInscripcion = DateTime.UtcNow,
                Estado = "Activo",
                Activo = true
            };

            _context.Inscripciones.Add(inscripcion);

            // Actualizar contador en GrupoCurso
            var grupoCurso = await _context.GruposCursos.FindAsync(createDto.GrupoCursoId);
            if (grupoCurso != null)
            {
                grupoCurso.CantidadEstudiantes++;
            }

            await _context.SaveChangesAsync();

            // Recargar con relaciones
            await _context.Entry(inscripcion)
                .Reference(i => i.Estudiante)
                .LoadAsync();
            await _context.Entry(inscripcion)
                .Reference(i => i.GrupoCurso)
                .LoadAsync();
            await _context.Entry(inscripcion.GrupoCurso)
                .Reference(g => g.Curso)
                .LoadAsync();
            await _context.Entry(inscripcion.GrupoCurso)
                .Reference(g => g.Docente)
                .LoadAsync();

            _logger.LogInformation(
                "Inscripción creada: Estudiante {EstudianteId} en GrupoCurso {GrupoCursoId}",
                inscripcion.EstudianteId, inscripcion.GrupoCursoId
            );

            return MapToDto(inscripcion);
        }

        public async Task<InscripcionDto?> UpdateAsync(int id, UpdateInscripcionDto updateDto)
        {
            var inscripcion = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Docente)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inscripcion == null)
                return null;

            inscripcion.Estado = updateDto.Estado;
            inscripcion.Activo = updateDto.Activo;

            // Si se desactiva, actualizar contador
            if (!updateDto.Activo && inscripcion.Activo)
            {
                var grupoCurso = await _context.GruposCursos.FindAsync(inscripcion.GrupoCursoId);
                if (grupoCurso != null && grupoCurso.CantidadEstudiantes > 0)
                {
                    grupoCurso.CantidadEstudiantes--;
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Inscripción actualizada: {Id}", id);

            return MapToDto(inscripcion);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var inscripcion = await _context.Inscripciones.FindAsync(id);

            if (inscripcion == null)
                return false;

            // Actualizar contador en GrupoCurso
            var grupoCurso = await _context.GruposCursos.FindAsync(inscripcion.GrupoCursoId);
            if (grupoCurso != null && grupoCurso.CantidadEstudiantes > 0)
            {
                grupoCurso.CantidadEstudiantes--;
            }

            _context.Inscripciones.Remove(inscripcion);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Inscripción eliminada: {Id}", id);

            return true;
        }

        public async Task<ResultadoInscripcionMasivaDto> InscribirEstudianteCompletoAsync(
            InscripcionMasivaEstudianteDto inscripcionDto)
        {
            var resultado = new ResultadoInscripcionMasivaDto();
            var estudiante = await _context.Estudiantes.FindAsync(inscripcionDto.EstudianteId);

            if (estudiante == null)
            {
                resultado.Fallidos++;
                resultado.Errores.Add(new ErrorInscripcionDto
                {
                    EstudianteId = inscripcionDto.EstudianteId,
                    Motivo = "Estudiante no encontrado"
                });
                return resultado;
            }

            // Obtener todos los grupos del grado/sección del estudiante en el periodo
            var gruposCursos = await _context.GruposCursos
                .Where(g => g.Grado == estudiante.GradoActual &&
                           g.Seccion == estudiante.SeccionActual &&
                           g.Periodo == inscripcionDto.Periodo &&
                           g.Activo)
                .ToListAsync();

            resultado.TotalProcesados = gruposCursos.Count;

            foreach (var grupo in gruposCursos)
            {
                try
                {
                    // Validar que no esté inscrito
                    if (await YaInscritoAsync(estudiante.Id, grupo.Id))
                    {
                        resultado.Fallidos++;
                        resultado.Errores.Add(new ErrorInscripcionDto
                        {
                            EstudianteId = estudiante.Id,
                            GrupoCursoId = grupo.Id,
                            Motivo = "Ya está inscrito"
                        });
                        continue;
                    }

                    // Validar cupo
                    if (!await GrupoTieneCupoAsync(grupo.Id))
                    {
                        resultado.Fallidos++;
                        resultado.Errores.Add(new ErrorInscripcionDto
                        {
                            EstudianteId = estudiante.Id,
                            GrupoCursoId = grupo.Id,
                            Motivo = "Sin cupo disponible"
                        });
                        continue;
                    }

                    var inscripcion = new Inscripcion
                    {
                        EstudianteId = estudiante.Id,
                        GrupoCursoId = grupo.Id,
                        FechaInscripcion = DateTime.UtcNow,
                        Estado = "Activo",
                        Activo = true
                    };

                    _context.Inscripciones.Add(inscripcion);
                    grupo.CantidadEstudiantes++;

                    resultado.Exitosos++;
                }
                catch (Exception ex)
                {
                    resultado.Fallidos++;
                    resultado.Errores.Add(new ErrorInscripcionDto
                    {
                        EstudianteId = estudiante.Id,
                        GrupoCursoId = grupo.Id,
                        Motivo = ex.Message
                    });
                }
            }

            await _context.SaveChangesAsync();

            // Recargar inscripciones creadas con relaciones
            var inscripcionesCreadas = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Docente)
                .Where(i => i.EstudianteId == estudiante.Id &&
                           gruposCursos.Select(g => g.Id).Contains(i.GrupoCursoId))
                .ToListAsync();

            resultado.InscripcionesCreadas = inscripcionesCreadas.Select(i => MapToDto(i)).ToList();

            _logger.LogInformation(
                "Inscripción masiva estudiante: {Exitosos} exitosos, {Fallidos} fallidos",
                resultado.Exitosos, resultado.Fallidos
            );

            return resultado;
        }

        public async Task<ResultadoInscripcionMasivaDto> InscribirGrupoCompletoAsync(
            InscripcionMasivaGrupoDto inscripcionDto)
        {
            var resultado = new ResultadoInscripcionMasivaDto();
            var grupoCurso = await _context.GruposCursos.FindAsync(inscripcionDto.GrupoCursoId);

            if (grupoCurso == null)
            {
                resultado.Fallidos = inscripcionDto.EstudiantesIds.Count;
                resultado.Errores.Add(new ErrorInscripcionDto
                {
                    GrupoCursoId = inscripcionDto.GrupoCursoId,
                    Motivo = "Grupo-curso no encontrado"
                });
                return resultado;
            }

            resultado.TotalProcesados = inscripcionDto.EstudiantesIds.Count;

            foreach (var estudianteId in inscripcionDto.EstudiantesIds)
            {
                try
                {
                    // Validar que el estudiante exista
                    var estudiante = await _context.Estudiantes.FindAsync(estudianteId);
                    if (estudiante == null)
                    {
                        resultado.Fallidos++;
                        resultado.Errores.Add(new ErrorInscripcionDto
                        {
                            EstudianteId = estudianteId,
                            GrupoCursoId = inscripcionDto.GrupoCursoId,
                            Motivo = "Estudiante no encontrado"
                        });
                        continue;
                    }

                    // Validar que no esté inscrito
                    if (await YaInscritoAsync(estudianteId, inscripcionDto.GrupoCursoId))
                    {
                        resultado.Fallidos++;
                        resultado.Errores.Add(new ErrorInscripcionDto
                        {
                            EstudianteId = estudianteId,
                            GrupoCursoId = inscripcionDto.GrupoCursoId,
                            Motivo = "Ya está inscrito"
                        });
                        continue;
                    }

                    // Validar cupo
                    if (!await GrupoTieneCupoAsync(inscripcionDto.GrupoCursoId))
                    {
                        resultado.Fallidos++;
                        resultado.Errores.Add(new ErrorInscripcionDto
                        {
                            EstudianteId = estudianteId,
                            GrupoCursoId = inscripcionDto.GrupoCursoId,
                            Motivo = "Sin cupo disponible"
                        });
                        continue;
                    }

                    var inscripcion = new Inscripcion
                    {
                        EstudianteId = estudianteId,
                        GrupoCursoId = inscripcionDto.GrupoCursoId,
                        FechaInscripcion = DateTime.UtcNow,
                        Estado = "Activo",
                        Activo = true
                    };

                    _context.Inscripciones.Add(inscripcion);
                    grupoCurso.CantidadEstudiantes++;

                    resultado.Exitosos++;
                }
                catch (Exception ex)
                {
                    resultado.Fallidos++;
                    resultado.Errores.Add(new ErrorInscripcionDto
                    {
                        EstudianteId = estudianteId,
                        GrupoCursoId = inscripcionDto.GrupoCursoId,
                        Motivo = ex.Message
                    });
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Inscripción masiva grupo: {Exitosos} exitosos, {Fallidos} fallidos",
                resultado.Exitosos, resultado.Fallidos
            );

            return resultado;
        }

        public async Task<ResultadoInscripcionMasivaDto> InscribirGradoSeccionCompletoAsync(
            InscripcionMasivaGradoSeccionDto inscripcionDto)
        {
            var resultado = new ResultadoInscripcionMasivaDto();

            // Obtener todos los estudiantes del grado/sección
            var estudiantes = await _context.Estudiantes
                .Where(e => e.GradoActual == inscripcionDto.Grado &&
                           e.SeccionActual == inscripcionDto.Seccion &&
                           e.Activo)
                .ToListAsync();

            if (!estudiantes.Any())
            {
                resultado.Errores.Add(new ErrorInscripcionDto
                {
                    Motivo = "No se encontraron estudiantes para el grado y sección especificados"
                });
                return resultado;
            }

            // Obtener todos los grupos del grado/sección en el periodo
            var gruposCursos = await _context.GruposCursos
                .Where(g => g.Grado == inscripcionDto.Grado &&
                           g.Seccion == inscripcionDto.Seccion &&
                           g.Periodo == inscripcionDto.Periodo &&
                           g.Activo)
                .ToListAsync();

            if (!gruposCursos.Any())
            {
                resultado.Errores.Add(new ErrorInscripcionDto
                {
                    Motivo = "No se encontraron grupos-cursos para el grado, sección y periodo especificados"
                });
                return resultado;
            }

            resultado.TotalProcesados = estudiantes.Count * gruposCursos.Count;

            foreach (var estudiante in estudiantes)
            {
                foreach (var grupo in gruposCursos)
                {
                    try
                    {
                        // Validar que no esté inscrito
                        if (await YaInscritoAsync(estudiante.Id, grupo.Id))
                        {
                            resultado.Fallidos++;
                            continue;
                        }

                        // Validar cupo
                        if (!await GrupoTieneCupoAsync(grupo.Id))
                        {
                            resultado.Fallidos++;
                            resultado.Errores.Add(new ErrorInscripcionDto
                            {
                                EstudianteId = estudiante.Id,
                                GrupoCursoId = grupo.Id,
                                Motivo = "Sin cupo disponible"
                            });
                            continue;
                        }

                        var inscripcion = new Inscripcion
                        {
                            EstudianteId = estudiante.Id,
                            GrupoCursoId = grupo.Id,
                            FechaInscripcion = DateTime.UtcNow,
                            Estado = "Activo",
                            Activo = true
                        };

                        _context.Inscripciones.Add(inscripcion);
                        grupo.CantidadEstudiantes++;

                        resultado.Exitosos++;
                    }
                    catch (Exception ex)
                    {
                        resultado.Fallidos++;
                        resultado.Errores.Add(new ErrorInscripcionDto
                        {
                            EstudianteId = estudiante.Id,
                            GrupoCursoId = grupo.Id,
                            Motivo = ex.Message
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Inscripción masiva grado/sección: {Grado}{Seccion} - {Exitosos} exitosos, {Fallidos} fallidos",
                inscripcionDto.Grado, inscripcionDto.Seccion, resultado.Exitosos, resultado.Fallidos
            );

            return resultado;
        }

        public async Task<InscripcionDto?> RetirarEstudianteAsync(int inscripcionId, string motivo)
        {
            var inscripcion = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Docente)
                .FirstOrDefaultAsync(i => i.Id == inscripcionId);

            if (inscripcion == null)
                return null;

            inscripcion.Estado = "Retirado";
            inscripcion.Activo = false;

            // Actualizar contador
            var grupoCurso = await _context.GruposCursos.FindAsync(inscripcion.GrupoCursoId);
            if (grupoCurso != null && grupoCurso.CantidadEstudiantes > 0)
            {
                grupoCurso.CantidadEstudiantes--;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Estudiante retirado: Inscripción {Id} - Motivo: {Motivo}",
                inscripcionId, motivo
            );

            return MapToDto(inscripcion);
        }

        public async Task<EstadisticasInscripcionesDto> GetEstadisticasAsync(string periodo)
        {
            var inscripciones = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Include(i => i.GrupoCurso)
                .Where(i => i.GrupoCurso.Periodo == periodo)
                .ToListAsync();

            var totalEstudiantes = inscripciones.Select(i => i.EstudianteId).Distinct().Count();
            var totalInscripciones = inscripciones.Count;
            var activas = inscripciones.Count(i => i.Activo);
            var retirados = inscripciones.Count(i => i.Estado == "Retirado");
            var completados = inscripciones.Count(i => i.Estado == "Completado");

            var promedioPorEstudiante = totalEstudiantes > 0
                ? Math.Round((decimal)totalInscripciones / totalEstudiantes, 2)
                : 0;

            var inscripcionesPorGrado = inscripciones
                .GroupBy(i => i.Estudiante.GradoActual)
                .Select(g => new InscripcionesPorGradoDto
                {
                    Grado = g.Key,
                    TotalEstudiantes = g.Select(i => i.EstudianteId).Distinct().Count(),
                    TotalInscripciones = g.Count()
                })
                .OrderBy(g => g.Grado)
                .ToList();

            return new EstadisticasInscripcionesDto
            {
                Periodo = periodo,
                TotalEstudiantes = totalEstudiantes,
                TotalInscripciones = totalInscripciones,
                InscripcionesActivas = activas,
                EstudiantesRetirados = retirados,
                CursosCompletados = completados,
                PromedioInscripcionesPorEstudiante = promedioPorEstudiante,
                InscripcionesPorGrado = inscripcionesPorGrado
            };
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Inscripciones.AnyAsync(i => i.Id == id);
        }

        public async Task<bool> YaInscritoAsync(int estudianteId, int grupoCursoId)
        {
            return await _context.Inscripciones
                .AnyAsync(i => i.EstudianteId == estudianteId &&
                              i.GrupoCursoId == grupoCursoId &&
                              i.Activo);
        }

        public async Task<bool> GrupoTieneCupoAsync(int grupoCursoId)
        {
            var grupoCurso = await _context.GruposCursos.FindAsync(grupoCursoId);
            return grupoCurso != null && grupoCurso.CantidadEstudiantes < grupoCurso.CapacidadMaxima;
        }

        private InscripcionDto MapToDto(Inscripcion inscripcion)
        {
            return new InscripcionDto
            {
                Id = inscripcion.Id,
                EstudianteId = inscripcion.EstudianteId,
                MatriculaEstudiante = inscripcion.Estudiante.Matricula,
                NombreEstudiante = $"{inscripcion.Estudiante.Nombres} {inscripcion.Estudiante.Apellidos}",
                GradoEstudiante = inscripcion.Estudiante.GradoActual,
                SeccionEstudiante = inscripcion.Estudiante.SeccionActual,
                GrupoCursoId = inscripcion.GrupoCursoId,
                CodigoGrupo = inscripcion.GrupoCurso.Codigo,
                NombreCurso = inscripcion.GrupoCurso.Curso.Nombre,
                AreaConocimiento = inscripcion.GrupoCurso.Curso.AreaConocimiento,
                Docente = $"{inscripcion.GrupoCurso.Docente.Nombres} {inscripcion.GrupoCurso.Docente.Apellidos}",
                FechaInscripcion = inscripcion.FechaInscripcion,
                Estado = inscripcion.Estado,
                PromedioFinal = inscripcion.PromedioFinal,
                Activo = inscripcion.Activo
            };
        }
    }
}
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

        public async Task<CalificacionDto?> GetByIdAsync(int id)
        {
            var calificacion = await _context.Calificaciones
                .Include(c => c.Estudiante)
                .Include(c => c.Rubro)
                    .ThenInclude(r => r.GrupoCurso)
                        .ThenInclude(g => g.Curso)
                .FirstOrDefaultAsync(c => c.Id == id);

            return calificacion != null ? MapToDto(calificacion) : null;
        }

        public async Task<IEnumerable<CalificacionDto>> GetByEstudianteAsync(int estudianteId)
        {
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Estudiante)
                .Include(c => c.Rubro)
                    .ThenInclude(r => r.GrupoCurso)
                        .ThenInclude(g => g.Curso)
                .Where(c => c.EstudianteId == estudianteId)
                .OrderByDescending(c => c.FechaRegistro)
                .ToListAsync();

            return calificaciones.Select(c => MapToDto(c));
        }

        public async Task<IEnumerable<CalificacionDto>> GetByEstudianteGrupoCursoAsync(
            int estudianteId,
            int grupoCursoId)
        {
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Estudiante)
                .Include(c => c.Rubro)
                    .ThenInclude(r => r.GrupoCurso)
                        .ThenInclude(g => g.Curso)
                .Where(c => c.EstudianteId == estudianteId &&
                           c.Rubro.GrupoCursoId == grupoCursoId)
                .OrderBy(c => c.Rubro.Orden)
                .ToListAsync();

            return calificaciones.Select(c => MapToDto(c));
        }

        public async Task<IEnumerable<CalificacionDto>> GetByRubroAsync(int rubroId)
        {
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Estudiante)
                .Include(c => c.Rubro)
                    .ThenInclude(r => r.GrupoCurso)
                        .ThenInclude(g => g.Curso)
                .Where(c => c.RubroId == rubroId)
                .OrderBy(c => c.Estudiante.Apellidos)
                .ThenBy(c => c.Estudiante.Nombres)
                .ToListAsync();

            return calificaciones.Select(c => MapToDto(c));
        }

        public async Task<CalificacionDto> CreateAsync(CreateCalificacionDto createDto)
        {
            // Verificar si ya existe calificación (si no es recuperación)
            if (!createDto.Recuperacion)
            {
                var yaRegistrada = await YaRegistradaAsync(createDto.EstudianteId, createDto.RubroId);
                if (yaRegistrada)
                {
                    throw new InvalidOperationException(
                        "Ya existe una calificación registrada para este estudiante en este rubro"
                    );
                }
            }

            var calificacion = new Calificacion
            {
                EstudianteId = createDto.EstudianteId,
                RubroId = createDto.RubroId,
                Nota = createDto.Nota,
                Observaciones = createDto.Observaciones,
                Recuperacion = createDto.Recuperacion,
                FechaRegistro = DateTime.UtcNow
            };

            _context.Calificaciones.Add(calificacion);
            await _context.SaveChangesAsync();

            // Recargar con relaciones
            await _context.Entry(calificacion)
                .Reference(c => c.Estudiante)
                .LoadAsync();
            await _context.Entry(calificacion)
                .Reference(c => c.Rubro)
                .LoadAsync();
            await _context.Entry(calificacion.Rubro)
                .Reference(r => r.GrupoCurso)
                .LoadAsync();
            await _context.Entry(calificacion.Rubro.GrupoCurso)
                .Reference(g => g.Curso)
                .LoadAsync();

            // Actualizar promedio de inscripción
            await ActualizarPromediosInscripcionAsync(
                calificacion.EstudianteId,
                calificacion.Rubro.GrupoCursoId
            );

            _logger.LogInformation(
                "Calificación registrada: Estudiante {EstudianteId} - Rubro {RubroId} - Nota: {Nota}",
                calificacion.EstudianteId, calificacion.RubroId, calificacion.Nota
            );

            return MapToDto(calificacion);
        }

        public async Task<CalificacionDto?> UpdateAsync(int id, UpdateCalificacionDto updateDto)
        {
            var calificacion = await _context.Calificaciones
                .Include(c => c.Estudiante)
                .Include(c => c.Rubro)
                    .ThenInclude(r => r.GrupoCurso)
                        .ThenInclude(g => g.Curso)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (calificacion == null)
                return null;

            calificacion.Nota = updateDto.Nota;
            calificacion.Observaciones = updateDto.Observaciones;
            calificacion.FechaModificacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Actualizar promedio de inscripción
            await ActualizarPromediosInscripcionAsync(
                calificacion.EstudianteId,
                calificacion.Rubro.GrupoCursoId
            );

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

            var estudianteId = calificacion.EstudianteId;
            var grupoCursoId = calificacion.Rubro.GrupoCursoId;

            _context.Calificaciones.Remove(calificacion);
            await _context.SaveChangesAsync();

            // Actualizar promedio de inscripción
            await ActualizarPromediosInscripcionAsync(estudianteId, grupoCursoId);

            _logger.LogInformation("Calificación eliminada: {Id}", id);

            return true;
        }


        public async Task<List<CalificacionDto>> RegistrarCalificacionesGrupoAsync(
            RegistrarCalificacionesGrupoDto registroDto)
        {
            var calificacionesCreadas = new List<Calificacion>();
            var calificacionesActualizadas = new List<Calificacion>();
            var gruposCursosActualizar = new HashSet<(int estudianteId, int grupoCursoId)>();

            // Obtener el GrupoCursoId del rubro
            var rubro = await _context.Rubros.FindAsync(registroDto.RubroId);
            if (rubro == null)
                throw new InvalidOperationException("Rubro no encontrado");

            foreach (var calificacionDto in registroDto.Calificaciones)
            {
                // Buscar si ya existe la calificación (sin contar recuperaciones)
                var calificacionExistente = await _context.Calificaciones
                    .FirstOrDefaultAsync(c =>
                        c.EstudianteId == calificacionDto.EstudianteId &&
                        c.RubroId == registroDto.RubroId &&
                        !c.Recuperacion);

                if (calificacionExistente != null)
                {
                    // ACTUALIZAR calificación existente
                    calificacionExistente.Nota = calificacionDto.Nota;
                    calificacionExistente.Observaciones = calificacionDto.Observaciones;
                    calificacionExistente.FechaModificacion = DateTime.UtcNow;

                    calificacionesActualizadas.Add(calificacionExistente);

                    _logger.LogInformation(
                        "Calificación actualizada para estudiante {EstudianteId} en rubro {RubroId}",
                        calificacionDto.EstudianteId, registroDto.RubroId
                    );
                }
                else
                {
                    // CREAR nueva calificación
                    var calificacion = new Calificacion
                    {
                        EstudianteId = calificacionDto.EstudianteId,
                        RubroId = registroDto.RubroId,
                        Nota = calificacionDto.Nota,
                        Observaciones = calificacionDto.Observaciones,
                        FechaRegistro = DateTime.UtcNow,
                        Recuperacion = false
                    };

                    _context.Calificaciones.Add(calificacion);
                    calificacionesCreadas.Add(calificacion);
                }

                gruposCursosActualizar.Add((calificacionDto.EstudianteId, rubro.GrupoCursoId));
            }

            await _context.SaveChangesAsync();

            // Actualizar promedios de todas las inscripciones afectadas
            foreach (var (estudianteId, grupoCursoId) in gruposCursosActualizar)
            {
                await ActualizarPromediosInscripcionAsync(estudianteId, grupoCursoId);
            }

            _logger.LogInformation(
                "Calificaciones procesadas: {Creadas} creadas, {Actualizadas} actualizadas en rubro {RubroId}",
                calificacionesCreadas.Count,
                calificacionesActualizadas.Count,
                registroDto.RubroId
            );

            // Combinar todas las calificaciones procesadas
            var todasCalificaciones = calificacionesCreadas.Concat(calificacionesActualizadas).ToList();

            // Recargar con relaciones
            foreach (var calificacion in todasCalificaciones)
            {
                await _context.Entry(calificacion)
                    .Reference(c => c.Estudiante)
                    .LoadAsync();
                await _context.Entry(calificacion)
                    .Reference(c => c.Rubro)
                    .LoadAsync();
                await _context.Entry(calificacion.Rubro)
                    .Reference(r => r.GrupoCurso)
                    .LoadAsync();
                await _context.Entry(calificacion.Rubro.GrupoCurso)
                    .Reference(g => g.Curso)
                    .LoadAsync();
            }

            return todasCalificaciones.Select(c => MapToDto(c)).ToList();
        }

        public async Task<CalificacionesGrupoCursoDto?> GetCalificacionesGrupoCursoAsync(int grupoCursoId)
        {
            var grupoCurso = await _context.GruposCursos
                .Include(g => g.Curso)
                .FirstOrDefaultAsync(g => g.Id == grupoCursoId);

            if (grupoCurso == null)
                return null;

            // Obtener rubros del grupo
            var rubros = await _context.Rubros
                .Where(r => r.GrupoCursoId == grupoCursoId && r.Activo)
                .OrderBy(r => r.Orden)
                .ToListAsync();

            // Obtener estudiantes inscritos
            var estudiantes = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Where(i => i.GrupoCursoId == grupoCursoId && i.Activo)
                .OrderBy(i => i.Estudiante.Apellidos)
                .ThenBy(i => i.Estudiante.Nombres)
                .Select(i => i.Estudiante)
                .ToListAsync();

            // Obtener todas las calificaciones del grupo
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Rubro)
                .Where(c => c.Rubro.GrupoCursoId == grupoCursoId && !c.Recuperacion)
                .ToListAsync();

            var estudiantesCalificaciones = new List<EstudianteCalificacionesDto>();
            var promedios = new List<decimal>();

            foreach (var estudiante in estudiantes)
            {
                var notasPorRubro = new Dictionary<int, decimal?>();

                foreach (var rubro in rubros)
                {
                    var calificacion = calificaciones.FirstOrDefault(
                        c => c.EstudianteId == estudiante.Id && c.RubroId == rubro.Id
                    );
                    notasPorRubro[rubro.Id] = calificacion?.Nota;
                }

                var promedio = await CalcularPromedioGrupoCursoAsync(estudiante.Id, grupoCursoId);

                estudiantesCalificaciones.Add(new EstudianteCalificacionesDto
                {
                    EstudianteId = estudiante.Id,
                    Matricula = estudiante.Matricula,
                    NombreCompleto = $"{estudiante.Nombres} {estudiante.Apellidos}",
                    NotasPorRubro = notasPorRubro,
                    PromedioFinal = promedio
                });

                if (promedio.HasValue)
                    promedios.Add(promedio.Value);
            }

            var promedioGrupo = promedios.Any() ? promedios.Average() : 0;

            return new CalificacionesGrupoCursoDto
            {
                GrupoCursoId = grupoCurso.Id,
                CodigoGrupo = grupoCurso.Codigo,
                NombreCurso = grupoCurso.Curso.Nombre,
                Grado = grupoCurso.Grado,
                Seccion = grupoCurso.Seccion,
                Periodo = grupoCurso.Periodo?.Nombre ?? string.Empty,
                Rubros = rubros.Select(r => new RubroResumenDto
                {
                    RubroId = r.Id,
                    NombreRubro = r.Nombre,
                    Porcentaje = r.Porcentaje,
                    Orden = r.Orden
                }).ToList(),
                Estudiantes = estudiantesCalificaciones,
                PromedioGrupo = Math.Round(promedioGrupo, 2)
            };
        }

        public async Task<BoletinEstudianteDto?> GetBoletinEstudianteAsync(int estudianteId, string periodo)
        {
            var estudiante = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.Id == estudianteId);

            if (estudiante == null)
                return null;

            // Obtener inscripciones del periodo
            var inscripciones = await _context.Inscripciones
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(i => i.GrupoCurso)
                    .ThenInclude(g => g.Docente)
                .Where(i => i.EstudianteId == estudianteId &&
                           i.GrupoCurso.Periodo.Nombre == periodo &&
                           i.Activo)
                .ToListAsync();

            var gruposCursosDto = new List<CalificacionGrupoCursoDto>();
            var promediosFinales = new List<decimal>();
            int aprobadas = 0;
            int reprobadas = 0;

            foreach (var inscripcion in inscripciones)
            {
                // Obtener rubros del grupo
                var rubros = await _context.Rubros
                    .Where(r => r.GrupoCursoId == inscripcion.GrupoCursoId && r.Activo)
                    .OrderBy(r => r.Orden)
                    .ToListAsync();

                // Obtener calificaciones del estudiante
                var calificaciones = await _context.Calificaciones
                    .Where(c => c.EstudianteId == estudianteId &&
                               rubros.Select(r => r.Id).Contains(c.RubroId))
                    .ToListAsync();

                var rubrosDto = new List<CalificacionRubroDto>();
                decimal sumaPonderada = 0;
                decimal sumaPorcentajes = 0;

                foreach (var rubro in rubros)
                {
                    var calificacion = calificaciones
                        .Where(c => c.RubroId == rubro.Id)
                        .OrderByDescending(c => c.Recuperacion)
                        .FirstOrDefault();

                    decimal? notaPonderada = null;
                    if (calificacion != null)
                    {
                        notaPonderada = calificacion.Nota * (rubro.Porcentaje / 100);
                        sumaPonderada += notaPonderada.Value;
                        sumaPorcentajes += rubro.Porcentaje;
                    }

                    rubrosDto.Add(new CalificacionRubroDto
                    {
                        RubroId = rubro.Id,
                        NombreRubro = rubro.Nombre,
                        PorcentajeRubro = rubro.Porcentaje,
                        Nota = calificacion?.Nota,
                        NotaPonderada = notaPonderada.HasValue ? Math.Round(notaPonderada.Value, 2) : null,
                        Recuperacion = calificacion?.Recuperacion ?? false,
                        Observaciones = calificacion?.Observaciones
                    });
                }

                decimal? promedioFinal = sumaPorcentajes > 0 ? sumaPonderada : null;
                string estado = promedioFinal.HasValue
                    ? (promedioFinal.Value >= 70 ? "Aprobado" : "Reprobado")
                    : "Pendiente";

                if (promedioFinal.HasValue)
                {
                    promediosFinales.Add(promedioFinal.Value);
                    if (promedioFinal.Value >= 70)
                        aprobadas++;
                    else
                        reprobadas++;
                }

                gruposCursosDto.Add(new CalificacionGrupoCursoDto
                {
                    GrupoCursoId = inscripcion.GrupoCursoId,
                    CodigoCurso = inscripcion.GrupoCurso.Curso.Codigo,
                    NombreCurso = inscripcion.GrupoCurso.Curso.Nombre,
                    AreaConocimiento = inscripcion.GrupoCurso.Curso.AreaConocimiento,
                    Docente = $"{inscripcion.GrupoCurso.Docente.Nombres} {inscripcion.GrupoCurso.Docente.Apellidos}",
                    Rubros = rubrosDto,
                    PromedioFinal = promedioFinal.HasValue ? Math.Round(promedioFinal.Value, 2) : null,
                    Estado = estado
                });
            }

            var promedioGeneral = promediosFinales.Any()
                ? Math.Round(promediosFinales.Average(), 2)
                : 0;

            // Calcular porcentaje de asistencia del periodo
            var asistencias = await _context.Asistencias
                .Include(a => a.Sesion)
                .Where(a => a.EstudianteId == estudianteId &&
                           inscripciones.Select(i => i.GrupoCursoId)
                               .Contains(a.Sesion.GrupoCursoId))
                .ToListAsync();

            var totalSesiones = asistencias.Count;
            var presentes = asistencias.Count(a => a.Estado == "Presente");
            var porcentajeAsistencia = totalSesiones > 0
                ? Math.Round((decimal)presentes / totalSesiones * 100, 2)
                : 0;

            return new BoletinEstudianteDto
            {
                EstudianteId = estudiante.Id,
                Matricula = estudiante.Matricula,
                NombreCompleto = $"{estudiante.Nombres} {estudiante.Apellidos}",
                GradoActual = estudiante.GradoActual,
                SeccionActual = estudiante.SeccionActual,
                Periodo = periodo,
                GruposCursos = gruposCursosDto.OrderBy(g => g.AreaConocimiento).ToList(),
                PromedioGeneral = promedioGeneral,
                TotalMateriasAprobadas = aprobadas,
                TotalMateriasReprobadas = reprobadas,
                PorcentajeAsistencia = porcentajeAsistencia
            };
        }

        public async Task<EstadisticasCalificacionesDto?> GetEstadisticasGrupoCursoAsync(int grupoCursoId)
        {
            var grupoCurso = await _context.GruposCursos
                .Include(g => g.Curso)
                .FirstOrDefaultAsync(g => g.Id == grupoCursoId);

            if (grupoCurso == null)
                return null;

            var estudiantes = await _context.Inscripciones
                .Where(i => i.GrupoCursoId == grupoCursoId && i.Activo)
                .Select(i => i.EstudianteId)
                .ToListAsync();

            var promedios = new List<decimal>();
            int aprobados = 0;
            int reprobados = 0;

            foreach (var estudianteId in estudiantes)
            {
                var promedio = await CalcularPromedioGrupoCursoAsync(estudianteId, grupoCursoId);
                if (promedio.HasValue)
                {
                    promedios.Add(promedio.Value);
                    if (promedio.Value >= 70)
                        aprobados++;
                    else
                        reprobados++;
                }
            }

            var totalEstudiantes = estudiantes.Count;
            var porcentajeAprobacion = totalEstudiantes > 0
                ? Math.Round((decimal)aprobados / totalEstudiantes * 100, 2)
                : 0;

            var promedioGrupo = promedios.Any() ? Math.Round(promedios.Average(), 2) : 0;
            var notaMaxima = promedios.Any() ? Math.Round(promedios.Max(), 2) : 0;
            var notaMinima = promedios.Any() ? Math.Round(promedios.Min(), 2) : 0;

            // Distribución de notas
            var distribucion = new List<DistribucionNotasDto>
            {
                new() { Rango = "90-100", Cantidad = promedios.Count(p => p >= 90 && p <= 100) },
                new() { Rango = "80-89", Cantidad = promedios.Count(p => p >= 80 && p < 90) },
                new() { Rango = "70-79", Cantidad = promedios.Count(p => p >= 70 && p < 80) },
                new() { Rango = "60-69", Cantidad = promedios.Count(p => p >= 60 && p < 70) },
                new() { Rango = "0-59", Cantidad = promedios.Count(p => p < 60) }
            };

            foreach (var dist in distribucion)
            {
                dist.Porcentaje = promedios.Any()
                    ? Math.Round((decimal)dist.Cantidad / promedios.Count * 100, 2)
                    : 0;
            }

            return new EstadisticasCalificacionesDto
            {
                GrupoCursoId = grupoCurso.Id,
                NombreCurso = grupoCurso.Curso.Nombre,
                TotalEstudiantes = totalEstudiantes,
                Aprobados = aprobados,
                Reprobados = reprobados,
                PorcentajeAprobacion = porcentajeAprobacion,
                PromedioGrupo = promedioGrupo,
                NotaMaxima = notaMaxima,
                NotaMinima = notaMinima,
                DistribucionNotas = distribucion
            };
        }

        public async Task<decimal?> CalcularPromedioGrupoCursoAsync(int estudianteId, int grupoCursoId)
        {
            var rubros = await _context.Rubros
                .Where(r => r.GrupoCursoId == grupoCursoId && r.Activo)
                .ToListAsync();

            if (!rubros.Any())
                return null;

            var calificaciones = await _context.Calificaciones
                .Where(c => c.EstudianteId == estudianteId &&
                           rubros.Select(r => r.Id).Contains(c.RubroId))
                .ToListAsync();

            decimal sumaPonderada = 0;
            decimal sumaPorcentajes = 0;

            foreach (var rubro in rubros)
            {
                var calificacion = calificaciones
                    .Where(c => c.RubroId == rubro.Id)
                    .OrderByDescending(c => c.Recuperacion)
                    .FirstOrDefault();

                if (calificacion != null)
                {
                    sumaPonderada += calificacion.Nota * (rubro.Porcentaje / 100);
                    sumaPorcentajes += rubro.Porcentaje;
                }
            }

            return sumaPorcentajes > 0 ? Math.Round(sumaPonderada, 2) : null;
        }

        public async Task ActualizarPromediosInscripcionAsync(int estudianteId, int grupoCursoId)
        {
            var inscripcion = await _context.Inscripciones
                .FirstOrDefaultAsync(i => i.EstudianteId == estudianteId &&
                                         i.GrupoCursoId == grupoCursoId);

            if (inscripcion == null)
                return;

            var promedio = await CalcularPromedioGrupoCursoAsync(estudianteId, grupoCursoId);
            inscripcion.PromedioFinal = promedio;

            if (promedio.HasValue)
            {
                inscripcion.Estado = promedio.Value >= 70 ? "Aprobado" : "Reprobado";
            }
            else
            {
                inscripcion.Estado = "Cursando";
            }

            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Calificaciones.AnyAsync(c => c.Id == id);
        }

        public async Task<bool> YaRegistradaAsync(int estudianteId, int rubroId)
        {
            return await _context.Calificaciones
                .AnyAsync(c => c.EstudianteId == estudianteId &&
                              c.RubroId == rubroId &&
                              !c.Recuperacion);
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
                PorcentajeRubro = calificacion.Rubro.Porcentaje,
                GrupoCursoId = calificacion.Rubro.GrupoCursoId,
                NombreCurso = calificacion.Rubro.GrupoCurso.Curso.Nombre,
                Nota = calificacion.Nota,
                Observaciones = calificacion.Observaciones,
                FechaRegistro = calificacion.FechaRegistro,
                FechaModificacion = calificacion.FechaModificacion,
                Recuperacion = calificacion.Recuperacion
            };
        }
    }
}

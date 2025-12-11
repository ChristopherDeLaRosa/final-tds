using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class EstudianteService : IEstudianteService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<EstudianteService> _logger;

        public EstudianteService(EduCoreDbContext context, ILogger<EstudianteService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<string> GenerarMatriculaAsync()
        {
            var anioActual = DateTime.Now.Year;

            // Obtener la última matrícula del año actual
            var ultimaMatricula = await _context.Estudiantes
                .Where(e => e.Matricula.StartsWith(anioActual.ToString()))
                .OrderByDescending(e => e.Matricula)
                .Select(e => e.Matricula)
                .FirstOrDefaultAsync();

            int siguienteNumero = 1;

            if (!string.IsNullOrEmpty(ultimaMatricula))
            {
                // Extraer el número de la última matrícula (formato: YYYY-NNN)
                var partes = ultimaMatricula.Split('-');
                if (partes.Length == 2 && int.TryParse(partes[1], out int numeroActual))
                {
                    siguienteNumero = numeroActual + 1;
                }
            }

            // Formato: YYYY-001, YYYY-002, etc.
            return $"{anioActual}-{siguienteNumero:D3}";
        }

        public async Task<IEnumerable<EstudianteDto>> GetAllAsync()
        {
            var estudiantes = await _context.Estudiantes
                .Where(e => e.Activo)
                .OrderBy(e => e.GradoActual)
                .ThenBy(e => e.SeccionActual)
                .ThenBy(e => e.Apellidos)
                .ThenBy(e => e.Nombres)
                .ToListAsync();

            return estudiantes.Select(e => MapToDto(e));
        }

        public async Task<EstudianteDto?> GetByIdAsync(int id)
        {
            var estudiante = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.Id == id);

            return estudiante != null ? MapToDto(estudiante) : null;
        }

        public async Task<EstudianteDto?> GetByMatriculaAsync(string matricula)
        {
            var estudiante = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.Matricula == matricula);

            return estudiante != null ? MapToDto(estudiante) : null;
        }

        public async Task<IEnumerable<EstudianteDto>> GetByGradoAsync(int grado)
        {
            var estudiantes = await _context.Estudiantes
                .Where(e => e.Activo && e.GradoActual == grado)
                .OrderBy(e => e.SeccionActual)
                .ThenBy(e => e.Apellidos)
                .ThenBy(e => e.Nombres)
                .ToListAsync();

            return estudiantes.Select(e => MapToDto(e));
        }

        public async Task<IEnumerable<EstudianteDto>> GetByGradoSeccionAsync(int grado, string seccion)
        {
            var estudiantes = await _context.Estudiantes
                .Where(e => e.Activo && e.GradoActual == grado && e.SeccionActual == seccion)
                .OrderBy(e => e.Apellidos)
                .ThenBy(e => e.Nombres)
                .ToListAsync();

            return estudiantes.Select(e => MapToDto(e));
        }

        public async Task<EstudiantesPorGradoDto?> GetEstudiantesPorGradoSeccionAsync(int grado, string seccion)
        {
            var estudiantes = await _context.Estudiantes
                .Where(e => e.Activo && e.GradoActual == grado && e.SeccionActual == seccion)
                .OrderBy(e => e.Apellidos)
                .ThenBy(e => e.Nombres)
                .ToListAsync();

            if (!estudiantes.Any())
                return null;

            return new EstudiantesPorGradoDto
            {
                Grado = grado,
                Seccion = seccion,
                TotalEstudiantes = estudiantes.Count,
                Estudiantes = estudiantes.Select(e => MapToDto(e)).ToList()
            };
        }

        public async Task<EstudianteDto> CreateAsync(CreateEstudianteDto createDto)
        {
            var estudiante = new Estudiante
            {
                Matricula = createDto.Matricula.Trim().ToUpper(),
                Nombres = createDto.Nombres.Trim(),
                Apellidos = createDto.Apellidos.Trim(),
                Email = createDto.Email.Trim().ToLower(),
                Telefono = createDto.Telefono?.Trim(),
                Direccion = createDto.Direccion?.Trim(),
                FechaNacimiento = createDto.FechaNacimiento,
                GradoActual = createDto.GradoActual,
                SeccionActual = createDto.SeccionActual.Trim().ToUpper(),
                AulaId = createDto.AulaId,
                NombreTutor = createDto.NombreTutor?.Trim(),
                TelefonoTutor = createDto.TelefonoTutor?.Trim(),
                EmailTutor = createDto.EmailTutor?.Trim().ToLower(),
                ObservacionesMedicas = createDto.ObservacionesMedicas?.Trim(),
                FechaIngreso = DateTime.UtcNow,
                Activo = true
            };

            _context.Estudiantes.Add(estudiante);
            await _context.SaveChangesAsync();

            if (createDto.AulaId.HasValue)
            {
                var aula = await _context.Aulas.FindAsync(createDto.AulaId.Value);
                if (aula != null)
                {
                    aula.CantidadEstudiantes++;
                    await _context.SaveChangesAsync();
                }
            }

            _logger.LogInformation(
                "Estudiante creado: {Matricula} - {Nombres} {Apellidos} - Grado: {Grado}{Seccion}",
                estudiante.Matricula, estudiante.Nombres, estudiante.Apellidos,
                estudiante.GradoActual, estudiante.SeccionActual
            );

            return MapToDto(estudiante);
        }

        public async Task<EstudianteDto?> UpdateAsync(int id, UpdateEstudianteDto updateDto)
        {
            var estudiante = await _context.Estudiantes.FindAsync(id);

            if (estudiante == null)
                return null;

            //Manejar cambio de aula
            if (updateDto.AulaId != estudiante.AulaId)
            {
                // Decrementar contador del aula anterior
                if (estudiante.AulaId.HasValue)
                {
                    var aulaAnterior = await _context.Aulas.FindAsync(estudiante.AulaId.Value);
                    if (aulaAnterior != null && aulaAnterior.CantidadEstudiantes > 0)
                    {
                        aulaAnterior.CantidadEstudiantes--;
                    }
                }

                // Incrementar contador del aula nueva
                if (updateDto.AulaId.HasValue)
                {
                    var aulaNueva = await _context.Aulas.FindAsync(updateDto.AulaId.Value);
                    if (aulaNueva != null)
                    {
                        aulaNueva.CantidadEstudiantes++;
                    }
                }

                estudiante.AulaId = updateDto.AulaId;
            }

            estudiante.Nombres = updateDto.Nombres;
            estudiante.Apellidos = updateDto.Apellidos;
            estudiante.Email = updateDto.Email;
            estudiante.Telefono = updateDto.Telefono;
            estudiante.Direccion = updateDto.Direccion;
            estudiante.FechaNacimiento = updateDto.FechaNacimiento;
            estudiante.GradoActual = updateDto.GradoActual;
            estudiante.SeccionActual = updateDto.SeccionActual;
            estudiante.NombreTutor = updateDto.NombreTutor;
            estudiante.TelefonoTutor = updateDto.TelefonoTutor;
            estudiante.EmailTutor = updateDto.EmailTutor;
            estudiante.ObservacionesMedicas = updateDto.ObservacionesMedicas;
            estudiante.Activo = updateDto.Activo;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Estudiante actualizado: {Id} - {Matricula}", id, estudiante.Matricula);

            return MapToDto(estudiante);
        }
        public async Task<bool> DeleteAsync(int id)
        {
            var estudiante = await _context.Estudiantes.FindAsync(id);

            if (estudiante == null)
                return false;

            // Soft delete
            estudiante.Activo = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Estudiante eliminado (soft delete): {Id} - {Matricula}", id, estudiante.Matricula);

            return true;
        }

        public async Task<EstudianteHistorialDto?> GetHistorialAsync(int id)
        {
            var estudiante = await _context.Estudiantes
                .Include(e => e.Inscripciones)
                    .ThenInclude(i => i.GrupoCurso)
                        .ThenInclude(g => g.Curso)
                .Include(e => e.Inscripciones)
                    .ThenInclude(i => i.GrupoCurso)
                        .ThenInclude(g => g.Docente)
                .Include(e => e.Asistencias)
                    .ThenInclude(a => a.Sesion)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (estudiante == null)
                return null;

            var gruposHistorial = new List<HistorialGrupoDto>();

            foreach (var inscripcion in estudiante.Inscripciones.Where(i => i.Activo))
            {
                // Obtener total de sesiones del grupo
                var totalSesiones = await _context.Sesiones
                    .Where(s => s.GrupoCursoId == inscripcion.GrupoCursoId && s.Realizada)
                    .CountAsync();

                // Contar asistencias del estudiante
                var asistencias = await _context.Asistencias
                    .Include(a => a.Sesion)
                    .Where(a => a.EstudianteId == id &&
                               a.Sesion.GrupoCursoId == inscripcion.GrupoCursoId &&
                               a.Estado == "Presente")
                    .CountAsync();

                var porcentajeAsistencia = totalSesiones > 0
                    ? (decimal)asistencias / totalSesiones * 100
                    : 0;

                gruposHistorial.Add(new HistorialGrupoDto
                {
                    CodigoCurso = inscripcion.GrupoCurso.Curso?.Codigo ?? "N/A",
                    NombreCurso = inscripcion.GrupoCurso.Curso?.Nombre ?? "Curso sin asignar",
                    AreaConocimiento = inscripcion.GrupoCurso.Curso?.AreaConocimiento ?? "N/A",

                    Grado = inscripcion.GrupoCurso.Grado,
                    Seccion = inscripcion.GrupoCurso.Seccion,

                    Periodo = inscripcion.GrupoCurso.Periodo?.Nombre ?? "Periodo no asignado",

                    Docente = inscripcion.GrupoCurso.Docente != null
        ? $"{inscripcion.GrupoCurso.Docente.Nombres} {inscripcion.GrupoCurso.Docente.Apellidos}"
        : "Docente no asignado",

                    PromedioFinal = inscripcion.PromedioFinal,
                    Estado = inscripcion.Estado,
                    PorcentajeAsistencia = Math.Round(porcentajeAsistencia, 2)
                });

            }

            // Calcular estadísticas generales
            var gruposConNota = gruposHistorial.Where(g => g.PromedioFinal.HasValue).ToList();
            var promedioGeneral = gruposConNota.Any()
                ? gruposConNota.Average(g => g.PromedioFinal!.Value)
                : 0;

            var gruposConAsistencia = gruposHistorial.Where(g => g.PorcentajeAsistencia.HasValue).ToList();
            var porcentajeAsistenciaGeneral = gruposConAsistencia.Any()
                ? gruposConAsistencia.Average(g => g.PorcentajeAsistencia!.Value)
                : 0;

            return new EstudianteHistorialDto
            {
                EstudianteId = estudiante.Id,
                Matricula = estudiante.Matricula,
                NombreCompleto = $"{estudiante.Nombres} {estudiante.Apellidos}",
                GradoActual = estudiante.GradoActual,
                SeccionActual = estudiante.SeccionActual,
                Grupos = gruposHistorial.OrderByDescending(g => g.Periodo).ToList(),
                PromedioGeneral = Math.Round(promedioGeneral, 2),
                TotalMateriasAprobadas = gruposHistorial.Count(g => g.PromedioFinal >= 70),
                TotalMateriasReprobadas = gruposHistorial.Count(g => g.PromedioFinal < 70 && g.PromedioFinal > 0),
                PorcentajeAsistenciaGeneral = Math.Round(porcentajeAsistenciaGeneral, 2)
            };
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Estudiantes.AnyAsync(e => e.Id == id);
        }

        public async Task<bool> MatriculaExistsAsync(string matricula)
        {
            return await _context.Estudiantes.AnyAsync(e => e.Matricula == matricula);
        }

        #region Asignación Masiva a Aula

        public async Task<ResultadoOperacionMasivaDto> BulkAssignToAulaAsync(int aulaId, List<int> estudianteIds)
        {
            var resultado = new ResultadoOperacionMasivaDto
            {
                TotalProcesados = estudianteIds.Count
            };

            var aula = await _context.Aulas.FindAsync(aulaId);
            if (aula == null)
            {
                throw new InvalidOperationException("Aula no encontrada");
            }

            _logger.LogInformation("INICIANDO ASIGNACIÓN MASIVA");
            _logger.LogInformation("Aula ID: {AulaId} - {Grado}° {Seccion}",
                aulaId, aula.Grado, aula.Seccion);
            _logger.LogInformation("Total estudiantes a procesar: {Total}", estudianteIds.Count);

            foreach (var estudianteId in estudianteIds)
            {
                try
                {
                    var estudiante = await _context.Estudiantes.FindAsync(estudianteId);

                    if (estudiante == null)
                    {
                        resultado.Fallidos.Add(new ErrorOperacionDto
                        {
                            Id = estudianteId,
                            Error = "Estudiante no encontrado"
                        });
                        _logger.LogWarning("Estudiante {Id} no encontrado", estudianteId);
                        continue;
                    }

                    if (!estudiante.Activo)
                    {
                        resultado.Fallidos.Add(new ErrorOperacionDto
                        {
                            Id = estudianteId,
                            Error = "Estudiante inactivo"
                        });
                        _logger.LogWarning("Estudiante {Id} está inactivo", estudianteId);
                        continue;
                    }

                    _logger.LogInformation(
                        "Procesando estudiante: {Id} - {Nombre} - AulaId actual: {AulaActual}",
                        estudiante.Id,
                        $"{estudiante.Nombres} {estudiante.Apellidos}",
                        estudiante.AulaId?.ToString() ?? "null"
                    );

                    // Remover de aula anterior si tiene
                    if (estudiante.AulaId.HasValue)
                    {
                        var aulaAnterior = await _context.Aulas.FindAsync(estudiante.AulaId.Value);
                        if (aulaAnterior != null && aulaAnterior.CantidadEstudiantes > 0)
                        {
                            aulaAnterior.CantidadEstudiantes--;
                            _logger.LogInformation(
                                "Decrementado contador aula anterior {AulaId}: {Cantidad}",
                                aulaAnterior.Id,
                                aulaAnterior.CantidadEstudiantes
                            );
                        }
                    }

                    // Asignar a nueva aula
                    estudiante.AulaId = aulaId;
                    estudiante.GradoActual = aula.Grado;
                    estudiante.SeccionActual = aula.Seccion;

                    // Incrementar contador del aula
                    aula.CantidadEstudiantes++;

                    resultado.Exitosos.Add(estudianteId);

                    _logger.LogInformation(
                        "Estudiante {Id} asignado exitosamente - Nuevo AulaId: {AulaId}",
                        estudianteId, aulaId
                    );
                }
                catch (Exception ex)
                {
                    resultado.Fallidos.Add(new ErrorOperacionDto
                    {
                        Id = estudianteId,
                        Error = ex.Message
                    });
                    _logger.LogError(ex, "Error asignando estudiante {EstudianteId}", estudianteId);
                }
            }

            // Guardar cambios
            await _context.SaveChangesAsync();
            _logger.LogInformation("Cambios guardados en la base de datos");

            _logger.LogInformation(
                "ASIGNACIÓN MASIVA COMPLETADA — Exitosos: {Exitosos} | Fallidos: {Fallidos}",
                resultado.Exitosos.Count, resultado.Fallidos.Count
            );

            return resultado;
        }

        public async Task<ResultadoOperacionMasivaDto> BulkUnassignFromAulaAsync(List<int> estudianteIds)
        {
            var resultado = new ResultadoOperacionMasivaDto
            {
                TotalProcesados = estudianteIds.Count
            };

            _logger.LogInformation("INICIANDO DESASIGNACIÓN MASIVA");
            _logger.LogInformation("Total estudiantes a procesar: {Total}", estudianteIds.Count);

            foreach (var estudianteId in estudianteIds)
            {
                try
                {
                    var estudiante = await _context.Estudiantes.FindAsync(estudianteId);

                    if (estudiante == null)
                    {
                        resultado.Fallidos.Add(new ErrorOperacionDto
                        {
                            Id = estudianteId,
                            Error = "Estudiante no encontrado"
                        });
                        _logger.LogWarning("Estudiante {Id} no encontrado", estudianteId);
                        continue;
                    }

                    if (!estudiante.AulaId.HasValue)
                    {
                        resultado.Fallidos.Add(new ErrorOperacionDto
                        {
                            Id = estudianteId,
                            Error = "Estudiante no tiene aula asignada"
                        });
                        _logger.LogWarning("Estudiante {Id} no tiene aula asignada", estudianteId);
                        continue;
                    }

                    var aulaId = estudiante.AulaId.Value;

                    _logger.LogInformation(
                        "Procesando estudiante: {Id} - {Nombre} - AulaId actual: {AulaId}",
                        estudiante.Id,
                        $"{estudiante.Nombres} {estudiante.Apellidos}",
                        aulaId
                    );

                    // Decrementar contador del aula
                    var aula = await _context.Aulas.FindAsync(aulaId);
                    if (aula != null && aula.CantidadEstudiantes > 0)
                    {
                        aula.CantidadEstudiantes--;
                        _logger.LogInformation(
                            "Decrementado contador aula {AulaId}: {Cantidad}",
                            aula.Id,
                            aula.CantidadEstudiantes
                        );
                    }

                    // Remover asignación
                    estudiante.AulaId = null;

                    resultado.Exitosos.Add(estudianteId);

                    _logger.LogInformation(
                        "Estudiante {Id} desasignado exitosamente",
                        estudianteId
                    );
                }
                catch (Exception ex)
                {
                    resultado.Fallidos.Add(new ErrorOperacionDto
                    {
                        Id = estudianteId,
                        Error = ex.Message
                    });
                    _logger.LogError(ex, "Error desasignando estudiante {EstudianteId}", estudianteId);
                }
            }

            // Guardar cambios
            await _context.SaveChangesAsync();
            _logger.LogInformation("Cambios guardados en la base de datos");

            _logger.LogInformation(
                "DESASIGNACIÓN MASIVA COMPLETADA — Exitosos: {Exitosos} | Fallidos: {Fallidos}",
                resultado.Exitosos.Count, resultado.Fallidos.Count
            );

            return resultado;
        }

        #endregion




        private EstudianteDto MapToDto(Estudiante estudiante)
        {
            return new EstudianteDto
            {
                Id = estudiante.Id,
                Matricula = estudiante.Matricula,
                Nombres = estudiante.Nombres,
                Apellidos = estudiante.Apellidos,
                Email = estudiante.Email,
                Telefono = estudiante.Telefono,
                Direccion = estudiante.Direccion,
                FechaNacimiento = estudiante.FechaNacimiento,
                FechaIngreso = estudiante.FechaIngreso,
                GradoActual = estudiante.GradoActual,
                SeccionActual = estudiante.SeccionActual,
                AulaId = estudiante.AulaId,
                NombreTutor = estudiante.NombreTutor,
                TelefonoTutor = estudiante.TelefonoTutor,
                EmailTutor = estudiante.EmailTutor,
                ObservacionesMedicas = estudiante.ObservacionesMedicas,
                Activo = estudiante.Activo
            };
        }
        public async Task<int> GetTotalAsync()
        {
            return await _context.Estudiantes.CountAsync(e => e.Activo);
        }

    }
}
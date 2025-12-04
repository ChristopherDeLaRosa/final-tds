using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace EduCore.API.Services.Implementations
{
    public class DocenteService : IDocenteService
    {
        private readonly EduCoreDbContext _context;
        private readonly ILogger<DocenteService> _logger;

        public DocenteService(EduCoreDbContext context, ILogger<DocenteService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<DocenteDto>> GetAllAsync()
        {
            var docentes = await _context.Docentes
                .Include(d => d.GrupoCursos)
                .OrderBy(d => d.Apellidos)
                .ThenBy(d => d.Nombres)
                .ToListAsync();

            return docentes.Select(d => MapToDto(d));
        }

        public async Task<IEnumerable<DocenteDto>> GetAllActivosAsync()
        {
            var docentes = await _context.Docentes
                .Include(d => d.GrupoCursos)
                .Where(d => d.Activo)
                .OrderBy(d => d.Apellidos)
                .ThenBy(d => d.Nombres)
                .ToListAsync();

            return docentes.Select(d => MapToDto(d));
        }

        public async Task<DocenteDto?> GetByIdAsync(int id)
        {
            var docente = await _context.Docentes
                .Include(d => d.GrupoCursos)
                .FirstOrDefaultAsync(d => d.Id == id);

            return docente != null ? MapToDto(docente) : null;
        }

        public async Task<DocenteDetalleDto?> GetDetalleByIdAsync(int id)
        {
            var docente = await _context.Docentes
                .Include(d => d.GrupoCursos)
                    .ThenInclude(g => g.Curso)
                .Include(d => d.GrupoCursos)
                    .ThenInclude(g => g.Aula) 
                .FirstOrDefaultAsync(d => d.Id == id);

            if (docente == null)
                return null;

            // Calcular años de servicio
            var añosServicio = (DateTime.UtcNow - docente.FechaContratacion).Days / 365;

            // Obtener grupos asignados
            var gruposAsignados = docente.GrupoCursos
                .Where(g => g.Activo)
                .Select(g => new GrupoCursoDocenteDto
                {
                    Id = g.Id,
                    Codigo = g.Codigo,
                    NombreCurso = g.Curso.Nombre,
                    Grado = g.Grado,
                    Seccion = g.Seccion,
                    Periodo = g.Periodo.Nombre,
                    CantidadEstudiantes = g.CantidadEstudiantes,
                    CapacidadMaxima = g.CapacidadMaxima,
                    Aula = g.Aula?.AulaFisica,
                    Horario = g.Horario
                })
                .ToList();

            var totalGrupos = gruposAsignados.Count;
            var totalEstudiantes = gruposAsignados.Sum(g => g.CantidadEstudiantes);

            // Obtener sesiones impartidas
            var totalSesiones = await _context.Sesiones
                .Where(s => docente.GrupoCursos.Select(g => g.Id).Contains(s.GrupoCursoId) && s.Realizada)
                .CountAsync();

            // Calcular promedio de asistencia
            var gruposIds = docente.GrupoCursos.Select(g => g.Id).ToList();
            var sesionesConAsistencia = await _context.Sesiones
                .Include(s => s.Asistencias)
                .Where(s => gruposIds.Contains(s.GrupoCursoId) && s.Asistencias.Any())
                .ToListAsync();

            decimal promedioAsistencia = 0;
            if (sesionesConAsistencia.Any())
            {
                var porcentajes = sesionesConAsistencia.Select(s =>
                {
                    var total = s.Asistencias.Count;
                    var presentes = s.Asistencias.Count(a => a.Estado == "Presente");
                    return total > 0 ? (decimal)presentes / total * 100 : 0;
                }).ToList();

                promedioAsistencia = Math.Round(porcentajes.Average(), 2);
            }

            return new DocenteDetalleDto
            {
                Id = docente.Id,
                Codigo = docente.Codigo,
                Nombres = docente.Nombres,
                Apellidos = docente.Apellidos,
                NombreCompleto = $"{docente.Nombres} {docente.Apellidos}",
                Email = docente.Email,
                Telefono = docente.Telefono,
                Especialidad = docente.Especialidad,
                FechaContratacion = docente.FechaContratacion,
                AñosServicio = añosServicio,
                Activo = docente.Activo,
                TotalGrupos = totalGrupos,
                TotalEstudiantes = totalEstudiantes,
                TotalSesionesImpartidas = totalSesiones,
                PromedioAsistenciaGrupos = promedioAsistencia,
                GruposAsignados = gruposAsignados
            };
        }

        public async Task<DocenteDto> CreateAsync(CreateDocenteDto createDto)
        {
            // Validar código único
            if (await CodigoExisteAsync(createDto.Codigo))
            {
                throw new InvalidOperationException($"El código '{createDto.Codigo}' ya existe");
            }

            // Validar email único
            if (await EmailExisteAsync(createDto.Email))
            {
                throw new InvalidOperationException($"El email '{createDto.Email}' ya está registrado");
            }

            var docente = new Docente
            {
                Codigo = createDto.Codigo,
                Nombres = createDto.Nombres,
                Apellidos = createDto.Apellidos,
                Email = createDto.Email,
                Telefono = createDto.Telefono,
                Especialidad = createDto.Especialidad,
                FechaContratacion = createDto.FechaContratacion ?? DateTime.UtcNow,
                Activo = true
            };

            _context.Docentes.Add(docente);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Docente creado: {Codigo} - {Nombres} {Apellidos}",
                docente.Codigo, docente.Nombres, docente.Apellidos
            );

            return MapToDto(docente);
        }

        public async Task<DocenteDto?> UpdateAsync(int id, UpdateDocenteDto updateDto)
        {
            var docente = await _context.Docentes
                .Include(d => d.GrupoCursos)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (docente == null)
                return null;

            // Validar email único (excepto el actual)
            if (await EmailExisteAsync(updateDto.Email, id))
            {
                throw new InvalidOperationException($"El email '{updateDto.Email}' ya está registrado");
            }

            docente.Nombres = updateDto.Nombres;
            docente.Apellidos = updateDto.Apellidos;
            docente.Email = updateDto.Email;
            docente.Telefono = updateDto.Telefono;
            docente.Especialidad = updateDto.Especialidad;
            docente.Activo = updateDto.Activo;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Docente actualizado: {Id} - {Nombres} {Apellidos}", id, docente.Nombres, docente.Apellidos);

            return MapToDto(docente);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var docente = await _context.Docentes
                .Include(d => d.GrupoCursos)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (docente == null)
                return false;

            // Verificar si tiene grupos asignados activos
            if (docente.GrupoCursos.Any(g => g.Activo))
            {
                _logger.LogWarning(
                    "No se puede eliminar el docente {Id} porque tiene grupos asignados",
                    id
                );
                return false;
            }

            _context.Docentes.Remove(docente);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Docente eliminado: {Id} - {Nombres} {Apellidos}", id, docente.Nombres, docente.Apellidos);

            return true;
        }

        public async Task<IEnumerable<DocenteDto>> SearchAsync(DocenteFiltrosDto filtros)
        {
            var query = _context.Docentes
                .Include(d => d.GrupoCursos)
                .AsQueryable();

            // Filtro por búsqueda general
            if (!string.IsNullOrWhiteSpace(filtros.Busqueda))
            {
                var busqueda = filtros.Busqueda.ToLower();
                query = query.Where(d =>
                    d.Codigo.ToLower().Contains(busqueda) ||
                    d.Nombres.ToLower().Contains(busqueda) ||
                    d.Apellidos.ToLower().Contains(busqueda) ||
                    d.Email.ToLower().Contains(busqueda)
                );
            }

            // Filtro por especialidad
            if (!string.IsNullOrWhiteSpace(filtros.Especialidad))
            {
                query = query.Where(d => d.Especialidad != null &&
                                        d.Especialidad.ToLower().Contains(filtros.Especialidad.ToLower()));
            }

            // Filtro por estado activo
            if (filtros.Activo.HasValue)
            {
                query = query.Where(d => d.Activo == filtros.Activo.Value);
            }

            // Filtro por periodo
            if (!string.IsNullOrWhiteSpace(filtros.Periodo))
            {
                query = query.Where(d => d.GrupoCursos.Any(g => g.Periodo.Nombre == filtros.Periodo && g.Activo));
            }

            var docentes = await query
                .OrderBy(d => d.Apellidos)
                .ThenBy(d => d.Nombres)
                .ToListAsync();

            return docentes.Select(d => MapToDto(d));
        }

        public async Task<DocenteDto?> GetByCodigoAsync(string codigo)
        {
            var docente = await _context.Docentes
                .Include(d => d.GrupoCursos)
                .FirstOrDefaultAsync(d => d.Codigo == codigo);

            return docente != null ? MapToDto(docente) : null;
        }

        public async Task<IEnumerable<DocenteDto>> GetByEspecialidadAsync(string especialidad)
        {
            var docentes = await _context.Docentes
                .Include(d => d.GrupoCursos)
                .Where(d => d.Especialidad != null &&
                           d.Especialidad.ToLower().Contains(especialidad.ToLower()) &&
                           d.Activo)
                .OrderBy(d => d.Apellidos)
                .ThenBy(d => d.Nombres)
                .ToListAsync();

            return docentes.Select(d => MapToDto(d));
        }

        public async Task<HorarioDocenteDto?> GetHorarioSemanalAsync(int docenteId, DateTime fecha)
        {
            var docente = await _context.Docentes.FindAsync(docenteId);

            if (docente == null)
                return null;

            // Calcular inicio y fin de la semana
            var diaSemana = (int)fecha.DayOfWeek;
            var inicioSemana = fecha.AddDays(-(diaSemana == 0 ? 6 : diaSemana - 1)).Date;
            var finSemana = inicioSemana.AddDays(6);

            // Obtener grupos del docente
            var gruposIds = await _context.GruposCursos
                .Where(g => g.DocenteId == docenteId && g.Activo)
                .Select(g => g.Id)
                .ToListAsync();

            // Obtener sesiones de la semana
            var sesiones = await _context.Sesiones
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Aula)
                .Where(s => gruposIds.Contains(s.GrupoCursoId) &&
                           s.Fecha >= inicioSemana &&
                           s.Fecha <= finSemana)
                .OrderBy(s => s.Fecha)
                .ThenBy(s => s.HoraInicio)
                .ToListAsync();

            var culture = new CultureInfo("es-ES");
            var sesionesSemana = sesiones.Select(s => new SesionDocenteSemanalDto
            {
                Id = s.Id,
                DiaSemana = s.Fecha.DayOfWeek,
                DiaSemanaTexto = culture.DateTimeFormat.GetDayName(s.Fecha.DayOfWeek),
                Fecha = s.Fecha,
                HoraInicio = s.HoraInicio,
                HoraFin = s.HoraFin,
                NombreCurso = s.GrupoCurso.Curso.Nombre,
                Grado = s.GrupoCurso.Grado,
                Seccion = s.GrupoCurso.Seccion,
                Tema = s.Tema,
                Aula = s.GrupoCurso.Aula?.AulaFisica,
                Realizada = s.Realizada
            }).ToList();

            return new HorarioDocenteDto
            {
                DocenteId = docente.Id,
                CodigoDocente = docente.Codigo,
                NombreCompleto = $"{docente.Nombres} {docente.Apellidos}",
                SemanaInicio = inicioSemana,
                SemanaFin = finSemana,
                Sesiones = sesionesSemana
            };
        }

        public async Task<IEnumerable<SesionDto>> GetSesionesAsync(int docenteId, DateTime? fecha = null)
        {
            var gruposIds = await _context.GruposCursos
                .Where(g => g.DocenteId == docenteId && g.Activo)
                .Select(g => g.Id)
                .ToListAsync();

            var query = _context.Sesiones
                .Include(s => s.GrupoCurso)
                    .ThenInclude(g => g.Curso)
                .Include(s => s.Asistencias)
                .Where(s => gruposIds.Contains(s.GrupoCursoId));

            if (fecha.HasValue)
            {
                var fechaSolo = fecha.Value.Date;
                query = query.Where(s => s.Fecha.Date == fechaSolo);
            }

            var sesiones = await query
                .OrderBy(s => s.Fecha)
                .ThenBy(s => s.HoraInicio)
                .ToListAsync();

            return sesiones.Select(s => new SesionDto
            {
                Id = s.Id,
                GrupoCursoId = s.GrupoCursoId,
                CodigoGrupo = s.GrupoCurso.Codigo,
                NombreCurso = s.GrupoCurso.Curso.Nombre,
                Grado = s.GrupoCurso.Grado,
                Seccion = s.GrupoCurso.Seccion,
                Fecha = s.Fecha,
                HoraInicio = s.HoraInicio,
                HoraFin = s.HoraFin,
                Tema = s.Tema,
                Observaciones = s.Observaciones,
                Realizada = s.Realizada,
                TotalAsistencias = s.Asistencias.Count,
                Presentes = s.Asistencias.Count(a => a.Estado == "Presente"),
                Ausentes = s.Asistencias.Count(a => a.Estado == "Ausente"),
                PorcentajeAsistencia = s.Asistencias.Any()
                    ? Math.Round((decimal)s.Asistencias.Count(a => a.Estado == "Presente") / s.Asistencias.Count * 100, 2)
                    : 0
            });
        }

        public async Task<IEnumerable<GrupoCursoDto>> GetGruposAsignadosAsync(int docenteId, string? periodo = null)
        {
            var query = _context.GruposCursos
                .Include(g => g.Curso)
                .Include(g => g.Docente)
                .Include(g => g.Aula)
                .Where(g => g.DocenteId == docenteId && g.Activo);

            if (!string.IsNullOrWhiteSpace(periodo))
            {
                query = query.Where(g => g.Periodo.Nombre == periodo);
            }

            var grupos = await query
                .OrderBy(g => g.Grado)
                .ThenBy(g => g.Seccion)
                .ThenBy(g => g.Curso.Orden)
                .ToListAsync();

            return grupos.Select(g => new GrupoCursoDto
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
                AulaFisica = g.Aula?.AulaFisica,
                Horario = g.Horario,
                CapacidadMaxima = g.CapacidadMaxima,
                CantidadEstudiantes = g.CantidadEstudiantes,
                Activo = g.Activo
            });
        }
        public async Task<CargaAcademicaDocenteDto?> GetCargaAcademicaAsync(int docenteId, string periodo)
        {
            var docente = await _context.Docentes.FindAsync(docenteId);

            if (docente == null)
                return null;

            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Where(g => g.DocenteId == docenteId && g.Periodo.Nombre == periodo && g.Activo)
                .ToListAsync();

            // Obtener sesiones para calcular horas semanales
            var gruposIds = grupos.Select(g => g.Id).ToList();

            // Obtener una semana representativa (primera semana del periodo con sesiones)
            var primeraSesion = await _context.Sesiones
                .Where(s => gruposIds.Contains(s.GrupoCursoId))
                .OrderBy(s => s.Fecha)
                .FirstOrDefaultAsync();

            int horasSemanales = 0;
            if (primeraSesion != null)
            {
                var inicioSemana = primeraSesion.Fecha.AddDays(-(int)primeraSesion.Fecha.DayOfWeek + 1);
                var finSemana = inicioSemana.AddDays(6);

                var sesionesSemana = await _context.Sesiones
                    .Where(s => gruposIds.Contains(s.GrupoCursoId) &&
                               s.Fecha >= inicioSemana &&
                               s.Fecha <= finSemana)
                    .ToListAsync();

                horasSemanales = (int)sesionesSemana.Sum(s => (s.HoraFin - s.HoraInicio).TotalHours);
            }

            var cargaGrupos = new List<CargaGrupoDto>();
            foreach (var grupo in grupos)
            {
                // Calcular horas semanales por grupo
                var sesionesGrupo = await _context.Sesiones
                    .Where(s => s.GrupoCursoId == grupo.Id)
                    .Take(7) // Primera semana
                    .ToListAsync();

                var horasGrupo = (int)sesionesGrupo.Sum(s => (s.HoraFin - s.HoraInicio).TotalHours);

                cargaGrupos.Add(new CargaGrupoDto
                {
                    NombreCurso = grupo.Curso.Nombre,
                    Grado = grupo.Grado,
                    Seccion = grupo.Seccion,
                    CantidadEstudiantes = grupo.CantidadEstudiantes,
                    HorasSemanales = horasGrupo
                });
            }

            return new CargaAcademicaDocenteDto
            {
                DocenteId = docente.Id,
                NombreCompleto = $"{docente.Nombres} {docente.Apellidos}",
                Especialidad = docente.Especialidad ?? "N/A",
                Periodo = periodo,
                HorasSemanales = horasSemanales,
                TotalGrupos = grupos.Count,
                TotalEstudiantes = grupos.Sum(g => g.CantidadEstudiantes),
                Grupos = cargaGrupos
            };
        }

        public async Task<EstadisticasDocenteDto?> GetEstadisticasAsync(int docenteId, string periodo)
        {
            var docente = await _context.Docentes.FindAsync(docenteId);

            if (docente == null)
                return null;

            var grupos = await _context.GruposCursos
                .Include(g => g.Curso)
                .Where(g => g.DocenteId == docenteId && g.Periodo.Nombre == periodo && g.Activo)
                .ToListAsync();

            var gruposIds = grupos.Select(g => g.Id).ToList();
            var totalEstudiantes = grupos.Sum(g => g.CantidadEstudiantes);
            var cursosImpartidos = grupos.Select(g => g.Curso.Nombre).Distinct().ToList();

            // Estadísticas de sesiones
            var sesiones = await _context.Sesiones
                .Where(s => gruposIds.Contains(s.GrupoCursoId))
                .ToListAsync();

            var totalSesiones = sesiones.Count;
            var realizadas = sesiones.Count(s => s.Realizada);
            var pendientes = totalSesiones - realizadas;
            var porcentajeAvance = totalSesiones > 0
                ? Math.Round((decimal)realizadas / totalSesiones * 100, 2)
                : 0;

            var totalMinutos = sesiones
                .Where(s => s.Realizada)
                .Sum(s => (s.HoraFin - s.HoraInicio).TotalMinutes);
            var totalHoras = (int)(totalMinutos / 60);

            // Estadísticas de rendimiento de estudiantes
            var inscripciones = await _context.Inscripciones
                .Where(i => gruposIds.Contains(i.GrupoCursoId) && i.Activo)
                .ToListAsync();

            var promedios = inscripciones
                .Where(i => i.PromedioFinal.HasValue)
                .Select(i => i.PromedioFinal!.Value)
                .ToList();

            var promedioGeneral = promedios.Any() ? Math.Round(promedios.Average(), 2) : 0;
            var aprobados = inscripciones.Count(i => i.PromedioFinal >= 70);
            var reprobados = inscripciones.Count(i => i.PromedioFinal < 70 && i.PromedioFinal.HasValue);
            var tasaAprobacion = inscripciones.Count > 0
                ? Math.Round((decimal)aprobados / inscripciones.Count * 100, 2)
                : 0;

            // Estadísticas de asistencia
            var sesionesConAsistencia = await _context.Sesiones
                .Include(s => s.Asistencias)
                .Where(s => gruposIds.Contains(s.GrupoCursoId) && s.Asistencias.Any())
                .ToListAsync();

            decimal promedioAsistencia = 0;
            if (sesionesConAsistencia.Any())
            {
                var porcentajes = sesionesConAsistencia.Select(s =>
                {
                    var total = s.Asistencias.Count;
                    var presentes = s.Asistencias.Count(a => a.Estado == "Presente");
                    return total > 0 ? (decimal)presentes / total * 100 : 0;
                }).ToList();

                promedioAsistencia = Math.Round(porcentajes.Average(), 2);
            }

            return new EstadisticasDocenteDto
            {
                DocenteId = docente.Id,
                NombreCompleto = $"{docente.Nombres} {docente.Apellidos}",
                Periodo = periodo,
                TotalGrupos = grupos.Count,
                TotalEstudiantes = totalEstudiantes,
                CursosImpartidos = cursosImpartidos,
                TotalSesionesProgramadas = totalSesiones,
                SesionesRealizadas = realizadas,
                SesionesPendientes = pendientes,
                PorcentajeAvance = porcentajeAvance,
                TotalHorasImpartidas = totalHoras,
                PromedioGeneralEstudiantes = promedioGeneral,
                EstudiantesAprobados = aprobados,
                EstudiantesReprobados = reprobados,
                TasaAprobacion = tasaAprobacion,
                PromedioAsistencia = promedioAsistencia
            };
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Docentes.AnyAsync(d => d.Id == id);
        }

        public async Task<bool> CodigoExisteAsync(string codigo, int? docenteId = null)
        {
            var query = _context.Docentes.Where(d => d.Codigo == codigo);

            if (docenteId.HasValue)
            {
                query = query.Where(d => d.Id != docenteId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<bool> EmailExisteAsync(string email, int? docenteId = null)
        {
            var query = _context.Docentes.Where(d => d.Email.ToLower() == email.ToLower());

            if (docenteId.HasValue)
            {
                query = query.Where(d => d.Id != docenteId.Value);
            }

            return await query.AnyAsync();
        }

        private DocenteDto MapToDto(Docente docente)
        {
            var gruposActivos = docente.GrupoCursos?.Where(g => g.Activo).ToList() ?? new List<GrupoCurso>();

            return new DocenteDto
            {
                Id = docente.Id,
                Codigo = docente.Codigo,
                Nombres = docente.Nombres,
                Apellidos = docente.Apellidos,
                NombreCompleto = $"{docente.Nombres} {docente.Apellidos}",
                Email = docente.Email,
                Telefono = docente.Telefono,
                Especialidad = docente.Especialidad,
                FechaContratacion = docente.FechaContratacion,
                Activo = docente.Activo,
                CantidadGrupos = gruposActivos.Count,
                CantidadEstudiantes = gruposActivos.Sum(g => g.CantidadEstudiantes)
            };
        }
    }
}

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
                Matricula = createDto.Matricula,
                Nombres = createDto.Nombres,
                Apellidos = createDto.Apellidos,
                Email = createDto.Email,
                Telefono = createDto.Telefono,
                Direccion = createDto.Direccion,
                FechaNacimiento = createDto.FechaNacimiento,
                GradoActual = createDto.GradoActual,
                SeccionActual = createDto.SeccionActual,
                NombreTutor = createDto.NombreTutor,
                TelefonoTutor = createDto.TelefonoTutor,
                EmailTutor = createDto.EmailTutor,
                ObservacionesMedicas = createDto.ObservacionesMedicas,
                FechaIngreso = DateTime.UtcNow,
                Activo = true
            };

            _context.Estudiantes.Add(estudiante);
            await _context.SaveChangesAsync();

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
                    .ThenInclude(i => i.GrupoCurso) // CAMBIO: Seccion -> GrupoCurso
                        .ThenInclude(g => g.Curso)
                .Include(e => e.Inscripciones)
                    .ThenInclude(i => i.GrupoCurso) // CAMBIO: Seccion -> GrupoCurso
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
                    .Where(s => s.GrupoCursoId == inscripcion.GrupoCursoId && s.Realizada) // CAMBIO
                    .CountAsync();

                // Contar asistencias del estudiante
                var asistencias = await _context.Asistencias
                    .Include(a => a.Sesion)
                    .Where(a => a.EstudianteId == id &&
                               a.Sesion.GrupoCursoId == inscripcion.GrupoCursoId && // CAMBIO
                               a.Estado == "Presente")
                    .CountAsync();

                var porcentajeAsistencia = totalSesiones > 0
                    ? (decimal)asistencias / totalSesiones * 100
                    : 0;

                gruposHistorial.Add(new HistorialGrupoDto
                {
                    CodigoCurso = inscripcion.GrupoCurso.Curso.Codigo,
                    NombreCurso = inscripcion.GrupoCurso.Curso.Nombre,
                    AreaConocimiento = inscripcion.GrupoCurso.Curso.AreaConocimiento,
                    Grado = inscripcion.GrupoCurso.Grado,
                    Seccion = inscripcion.GrupoCurso.Seccion,
                    Periodo = inscripcion.GrupoCurso.Periodo,
                    Docente = $"{inscripcion.GrupoCurso.Docente.Nombres} {inscripcion.GrupoCurso.Docente.Apellidos}",
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
                NombreTutor = estudiante.NombreTutor,
                TelefonoTutor = estudiante.TelefonoTutor,
                EmailTutor = estudiante.EmailTutor,
                ObservacionesMedicas = estudiante.ObservacionesMedicas,
                Activo = estudiante.Activo
            };
        }
    }
}
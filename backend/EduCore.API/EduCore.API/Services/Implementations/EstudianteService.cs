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
                .OrderBy(e => e.Apellidos)
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
                FechaIngreso = DateTime.UtcNow,
                Activo = true
            };

            _context.Estudiantes.Add(estudiante);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Estudiante creado: {Matricula} - {Nombres} {Apellidos}",
                estudiante.Matricula, estudiante.Nombres, estudiante.Apellidos);

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
                    .ThenInclude(i => i.Seccion)
                        .ThenInclude(s => s.Curso)
                .Include(e => e.Inscripciones)
                    .ThenInclude(i => i.Seccion)
                        .ThenInclude(s => s.Docente)
                .Include(e => e.Asistencias)
                    .ThenInclude(a => a.Sesion)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (estudiante == null)
                return null;

            var cursosHistorial = new List<HistorialCursoDto>();
            foreach (var inscripcion in estudiante.Inscripciones)
            {
                var totalSesiones = await _context.Sesiones
                    .Where(s => s.SeccionId == inscripcion.SeccionId && s.Realizada)
                    .CountAsync();

                var asistencias = await _context.Asistencias
                    .Include(a => a.Sesion)
                    .Where(a => a.EstudianteId == id &&
                               a.Sesion.SeccionId == inscripcion.SeccionId &&
                               a.Estado == "Presente")
                    .CountAsync();

                var porcentajeAsistencia = totalSesiones > 0
                    ? (decimal)asistencias / totalSesiones * 100
                    : 0;

                cursosHistorial.Add(new HistorialCursoDto
                {
                    CodigoCurso = inscripcion.Seccion.Curso.Codigo,
                    NombreCurso = inscripcion.Seccion.Curso.Nombre,
                    Periodo = inscripcion.Seccion.Periodo,
                    Docente = $"{inscripcion.Seccion.Docente.Nombres} {inscripcion.Seccion.Docente.Apellidos}",
                    PromedioFinal = inscripcion.PromedioFinal,
                    Estado = inscripcion.Estado,
                    PorcentajeAsistencia = Math.Round(porcentajeAsistencia, 2)
                });
            }

            var cursosConNota = cursosHistorial.Where(c => c.PromedioFinal.HasValue).ToList();
            var promedioGeneral = cursosConNota.Any()
                ? cursosConNota.Average(c => c.PromedioFinal!.Value)
                : 0;

            return new EstudianteHistorialDto
            {
                EstudianteId = estudiante.Id,
                Matricula = estudiante.Matricula,
                NombreCompleto = $"{estudiante.Nombres} {estudiante.Apellidos}",
                Cursos = cursosHistorial,
                PromedioGeneral = Math.Round(promedioGeneral, 2),
                TotalCursosAprobados = cursosHistorial.Count(c => c.PromedioFinal >= 70),
                TotalCursosReprobados = cursosHistorial.Count(c => c.PromedioFinal < 70 && c.PromedioFinal > 0)
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
                Activo = estudiante.Activo
            };
        }
    }
}
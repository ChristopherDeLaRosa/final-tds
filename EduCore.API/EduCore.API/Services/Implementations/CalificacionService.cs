using EduCore.API.Data;
using EduCore.API.DTOs.GradeDTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services.Implementations
{
    public class CalificacionService : ICalificacionService
    {
        private readonly EduCoreDbContext _context;
        private readonly IAuditService _auditService;

        public CalificacionService(EduCoreDbContext context, IAuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        public async Task<List<GradeItemResponseDto>> GetRubrosByCourseAsync(int courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                throw new NotFoundException("Curso", courseId);
            }

            var rubros = await _context.GradeItems
                .Where(gi => gi.CourseId == courseId)
                .OrderBy(gi => gi.Id)
                .ToListAsync();

            return rubros.Select(MapToGradeItemResponseDto).ToList();
        }

        public async Task<GradeItemResponseDto> CreateRubroAsync(int courseId, CreateGradeItemDto dto, int userId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                throw new NotFoundException("Curso", courseId);
            }

            // Verificar que la suma de pesos no exceda 1
            var pesoActual = await _context.GradeItems
                .Where(gi => gi.CourseId == courseId)
                .SumAsync(gi => gi.Peso);

            if (pesoActual + dto.Peso > 1)
            {
                throw new BadRequestException($"La suma de pesos para este curso excedería 1. Peso disponible: {1 - pesoActual}");
            }

            var gradeItem = new GradeItem
            {
                CourseId = courseId,
                Nombre = dto.Nombre,
                Peso = dto.Peso,
                RubroTipo = dto.RubroTipo,
                CreatedAt = DateTime.UtcNow
            };

            _context.GradeItems.Add(gradeItem);
            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                userId,
                "CREATE_GRADE_ITEM",
                "GradeItem",
                gradeItem.Id,
                System.Text.Json.JsonSerializer.Serialize(dto),
                null);

            return MapToGradeItemResponseDto(gradeItem);
        }

        public async Task<GradeItemResponseDto> UpdateRubroAsync(int rubroId, UpdateGradeItemDto dto, int userId)
        {
            var gradeItem = await _context.GradeItems.FindAsync(rubroId);
            if (gradeItem == null)
            {
                throw new NotFoundException("Rubro", rubroId);
            }

            // Si se actualiza el peso, verificar la suma
            if (dto.Peso.HasValue)
            {
                var pesoActual = await _context.GradeItems
                    .Where(gi => gi.CourseId == gradeItem.CourseId && gi.Id != rubroId)
                    .SumAsync(gi => gi.Peso);

                if (pesoActual + dto.Peso.Value > 1)
                {
                    throw new BadRequestException($"La suma de pesos para este curso excedería 1. Peso disponible: {1 - pesoActual}");
                }

                gradeItem.Peso = dto.Peso.Value;
            }

            if (dto.Nombre != null) gradeItem.Nombre = dto.Nombre;
            if (dto.RubroTipo != null) gradeItem.RubroTipo = dto.RubroTipo;

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                userId,
                "UPDATE_GRADE_ITEM",
                "GradeItem",
                gradeItem.Id,
                System.Text.Json.JsonSerializer.Serialize(dto),
                null);

            return MapToGradeItemResponseDto(gradeItem);
        }

        public async Task DeleteRubroAsync(int rubroId)
        {
            var gradeItem = await _context.GradeItems
                .Include(gi => gi.Course)
                .FirstOrDefaultAsync(gi => gi.Id == rubroId);

            if (gradeItem == null)
            {
                throw new NotFoundException("Rubro", rubroId);
            }

            // Verificar si hay calificaciones asociadas
            var hasGrades = await _context.GradeEntries.AnyAsync(ge => ge.GradeItemId == rubroId);
            if (hasGrades)
            {
                throw new ConflictException("No se puede eliminar el rubro porque tiene calificaciones asociadas");
            }

            _context.GradeItems.Remove(gradeItem);
            await _context.SaveChangesAsync();
        }

        public async Task<List<GradeEntryResponseDto>> CargaMasivaAsync(CargaMasivaCalificacionesDto dto, int userId)
        {
            var gradeItem = await _context.GradeItems.FindAsync(dto.GradeItemId);
            if (gradeItem == null)
            {
                throw new NotFoundException("Rubro", dto.GradeItemId);
            }

            var section = await _context.Sections.FindAsync(dto.SectionId);
            if (section == null)
            {
                throw new NotFoundException("Sección", dto.SectionId);
            }

            var results = new List<GradeEntryResponseDto>();

            foreach (var entrada in dto.Entradas)
            {
                var enrollment = await _context.Enrollments
                    .FirstOrDefaultAsync(e => e.Id == entrada.EnrollmentId);

                if (enrollment == null)
                {
                    throw new NotFoundException("Inscripción", entrada.EnrollmentId);
                }

                // Verificar si ya existe (idempotencia)
                var existingEntry = await _context.GradeEntries
                    .FirstOrDefaultAsync(ge => ge.EnrollmentId == entrada.EnrollmentId
                        && ge.GradeItemId == dto.GradeItemId);

                if (existingEntry != null)
                {
                    // Actualizar existente
                    existingEntry.Calificacion = entrada.Calificacion;
                    existingEntry.Observacion = entrada.Observacion;
                    existingEntry.UpdatedAt = DateTime.UtcNow;

                    results.Add(MapToGradeEntryResponseDto(existingEntry));
                }
                else
                {
                    // Crear nuevo
                    var gradeEntry = new GradeEntry
                    {
                        EnrollmentId = entrada.EnrollmentId,
                        GradeItemId = dto.GradeItemId,
                        Calificacion = entrada.Calificacion,
                        Observacion = entrada.Observacion,
                        CreadoPorUserId = userId,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.GradeEntries.Add(gradeEntry);
                    results.Add(MapToGradeEntryResponseDto(gradeEntry));
                }
            }

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                userId,
                "CARGA_MASIVA_CALIFICACIONES",
                "GradeEntry",
                null,
                System.Text.Json.JsonSerializer.Serialize(new { dto.SectionId, dto.GradeItemId, Count = dto.Entradas.Count }),
                null);

            return results;
        }

        public async Task<GradeEntryResponseDto> UpdateCalificacionAsync(int gradeEntryId, UpdateGradeEntryDto dto, int userId)
        {
            var gradeEntry = await _context.GradeEntries.FindAsync(gradeEntryId);
            if (gradeEntry == null)
            {
                throw new NotFoundException("Calificación", gradeEntryId);
            }

            gradeEntry.Calificacion = dto.Calificacion;
            gradeEntry.Observacion = dto.Observacion;
            gradeEntry.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                userId,
                "UPDATE_GRADE_ENTRY",
                "GradeEntry",
                gradeEntry.Id,
                System.Text.Json.JsonSerializer.Serialize(dto),
                null);

            return MapToGradeEntryResponseDto(gradeEntry);
        }

        public async Task<PromedioEstudianteDto> GetPromediosEstudianteAsync(int studentId, int? requestingUserId, string? requestingUserRole)
        {
            var student = await _context.Students.FindAsync(studentId);
            if (student == null)
            {
                throw new NotFoundException("Estudiante", studentId);
            }

            // Si es estudiante, solo puede ver su propio promedio
            if (requestingUserRole == "estudiante" && requestingUserId != studentId)
            {
                throw new ForbiddenException("No tiene permiso para ver estos promedios");
            }

            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                .Include(e => e.GradeEntries)
                    .ThenInclude(ge => ge.GradeItem)
                .Where(e => e.StudentId == studentId)
                .ToListAsync();

            var promediosPorCurso = new List<PromedioCursoDto>();

            foreach (var enrollment in enrollments)
            {
                if (enrollment.Course == null) continue;

                var calificaciones = enrollment.GradeEntries
                    .Where(ge => ge.GradeItem != null)
                    .Select(ge => new CalificacionDetalleDto
                    {
                        RubroNombre = ge.GradeItem!.Nombre,
                        RubroTipo = ge.GradeItem.RubroTipo,
                        Peso = ge.GradeItem.Peso,
                        Calificacion = ge.Calificacion,
                        Aporte = ge.Calificacion * ge.GradeItem.Peso
                    }).ToList();

                var promedioPonderado = calificaciones.Sum(c => c.Aporte);

                promediosPorCurso.Add(new PromedioCursoDto
                {
                    CourseId = enrollment.CourseId,
                    CodigoCurso = enrollment.Course.Codigo,
                    NombreCurso = enrollment.Course.Nombre,
                    PromedioPonderado = promedioPonderado,
                    Calificaciones = calificaciones
                });
            }

            var promedioGeneral = promediosPorCurso.Any()
                ? promediosPorCurso.Average(p => p.PromedioPonderado)
                : 0;

            return new PromedioEstudianteDto
            {
                StudentId = studentId,
                NombreEstudiante = $"{student.Nombre} {student.Apellido}",
                PromediosPorCurso = promediosPorCurso,
                PromedioGeneral = promedioGeneral
            };
        }

        public async Task<ActaSeccionDto> GetActaSeccionAsync(int sectionId)
        {
            var section = await _context.Sections.FindAsync(sectionId);
            if (section == null)
            {
                throw new NotFoundException("Sección", sectionId);
            }

            var enrollments = await _context.Enrollments
                .Include(e => e.Student)
                .Include(e => e.Course)
                    .ThenInclude(c => c!.GradeItems)
                .Include(e => e.GradeEntries)
                    .ThenInclude(ge => ge.GradeItem)
                .Where(e => e.SectionId == sectionId)
                .ToListAsync();

            if (!enrollments.Any())
            {
                return new ActaSeccionDto
                {
                    SectionId = sectionId,
                    SeccionNombre = section.Nombre,
                    CursoNombre = "",
                    AnioEscolar = DateTime.Now.Year,
                    Rubros = new List<string>(),
                    Estudiantes = new List<ActaEstudianteDto>()
                };
            }

            var curso = enrollments.First().Course;
            var rubros = curso?.GradeItems.OrderBy(gi => gi.Id).Select(gi => gi.Nombre).ToList() ?? new List<string>();

            var estudiantes = enrollments.Select(e =>
            {
                var calificaciones = new Dictionary<string, decimal?>();
                foreach (var rubro in curso?.GradeItems ?? new List<GradeItem>())
                {
                    var entry = e.GradeEntries.FirstOrDefault(ge => ge.GradeItemId == rubro.Id);
                    calificaciones[rubro.Nombre] = entry?.Calificacion;
                }

                var promedioFinal = e.GradeEntries
                    .Where(ge => ge.GradeItem != null)
                    .Sum(ge => ge.Calificacion * ge.GradeItem!.Peso);

                return new ActaEstudianteDto
                {
                    Matricula = e.Student?.Matricula ?? "",
                    NombreCompleto = $"{e.Student?.Nombre} {e.Student?.Apellido}",
                    Calificaciones = calificaciones,
                    PromedioFinal = promedioFinal
                };
            }).OrderBy(e => e.NombreCompleto).ToList();

            return new ActaSeccionDto
            {
                SectionId = sectionId,
                SeccionNombre = section.Nombre,
                CursoNombre = curso?.Nombre ?? "",
                AnioEscolar = enrollments.First().AnioEscolar,
                Rubros = rubros,
                Estudiantes = estudiantes
            };
        }

        private static GradeItemResponseDto MapToGradeItemResponseDto(GradeItem gradeItem)
        {
            return new GradeItemResponseDto
            {
                Id = gradeItem.Id,
                CourseId = gradeItem.CourseId,
                Nombre = gradeItem.Nombre,
                Peso = gradeItem.Peso,
                RubroTipo = gradeItem.RubroTipo,
                CreatedAt = gradeItem.CreatedAt
            };
        }

        private static GradeEntryResponseDto MapToGradeEntryResponseDto(GradeEntry gradeEntry)
        {
            return new GradeEntryResponseDto
            {
                Id = gradeEntry.Id,
                EnrollmentId = gradeEntry.EnrollmentId,
                GradeItemId = gradeEntry.GradeItemId,
                Calificacion = gradeEntry.Calificacion,
                Observacion = gradeEntry.Observacion,
                CreatedAt = gradeEntry.CreatedAt,
                UpdatedAt = gradeEntry.UpdatedAt
            };
        }
    }
}

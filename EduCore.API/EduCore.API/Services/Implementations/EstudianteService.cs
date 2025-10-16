using EduCore.API.Data;
using EduCore.API.DTOs.Student;
using EduCore.API.DTOs.StudentDtos;
using EduCore.API.DTOs.StudentDTOs;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;

namespace EduCore.API.Services.Implementations
{
    public class EstudianteService : IEstudianteService
    {
        private readonly EduCoreDbContext _context;
        private readonly IAuditService _auditService;

        public EstudianteService(EduCoreDbContext context, IAuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        public async Task<PagedResultDto<StudentResponseDto>> GetAllAsync(StudentQueryDto query)
        {
            var queryable = _context.Students.AsQueryable();

            // Filtros
            if (!string.IsNullOrWhiteSpace(query.Q))
            {
                var searchTerm = query.Q.ToLower();
                queryable = queryable.Where(s =>
                    s.Nombre.ToLower().Contains(searchTerm) ||
                    s.Apellido.ToLower().Contains(searchTerm) ||
                    s.Matricula.ToLower().Contains(searchTerm));
            }

            if (query.Grado.HasValue)
            {
                queryable = queryable.Where(s => s.Grado == query.Grado.Value);
            }

            if (!string.IsNullOrWhiteSpace(query.Seccion))
            {
                queryable = queryable.Where(s => s.Seccion == query.Seccion);
            }

            if (!string.IsNullOrWhiteSpace(query.Estado))
            {
                queryable = queryable.Where(s => s.Estado == query.Estado);
            }

            // Ordenamiento
            queryable = query.SortBy.ToLower() switch
            {
                "nombre" => query.Order.ToLower() == "desc"
                    ? queryable.OrderByDescending(s => s.Nombre)
                    : queryable.OrderBy(s => s.Nombre),
                "apellido" => query.Order.ToLower() == "desc"
                    ? queryable.OrderByDescending(s => s.Apellido)
                    : queryable.OrderBy(s => s.Apellido),
                "matricula" => query.Order.ToLower() == "desc"
                    ? queryable.OrderByDescending(s => s.Matricula)
                    : queryable.OrderBy(s => s.Matricula),
                "grado" => query.Order.ToLower() == "desc"
                    ? queryable.OrderByDescending(s => s.Grado)
                    : queryable.OrderBy(s => s.Grado),
                _ => query.Order.ToLower() == "desc"
                    ? queryable.OrderByDescending(s => s.Id)
                    : queryable.OrderBy(s => s.Id)
            };

            var totalItems = await queryable.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)query.Limit);

            var students = await queryable
                .Skip((query.Page - 1) * query.Limit)
                .Take(query.Limit)
                .Select(s => MapToResponseDto(s))
                .ToListAsync();

            return new PagedResultDto<StudentResponseDto>
            {
                Data = students,
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = query.Page,
                PageSize = query.Limit
            };
        }

        public async Task<StudentResponseDto> GetByIdAsync(int id, int? requestingUserId, string? requestingUserRole)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                throw new NotFoundException("Estudiante", id);
            }

            // Si es estudiante, solo puede ver su propio registro
            if (requestingUserRole == "estudiante" && requestingUserId != id)
            {
                throw new ForbiddenException("No tiene permiso para ver este estudiante");
            }

            return MapToResponseDto(student);
        }

        public async Task<StudentResponseDto> CreateAsync(CreateStudentDto dto, int createdByUserId)
        {
            // Verificar matrícula única
            if (await _context.Students.AnyAsync(s => s.Matricula == dto.Matricula))
            {
                throw new ConflictException($"Ya existe un estudiante con la matrícula {dto.Matricula}");
            }

            var student = new Student
            {
                Matricula = dto.Matricula,
                Nombre = dto.Nombre,
                Apellido = dto.Apellido,
                FechaNacimiento = dto.FechaNacimiento,
                Grado = dto.Grado,
                Seccion = dto.Seccion,
                Direccion = dto.Direccion,
                Telefono = dto.Telefono,
                Email = dto.Email,
                Estado = "activo",
                CreatedBy = createdByUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                createdByUserId,
                "CREATE_STUDENT",
                "Student",
                student.Id,
                System.Text.Json.JsonSerializer.Serialize(dto),
                null);

            return MapToResponseDto(student);
        }

        public async Task<StudentResponseDto> UpdateAsync(int id, UpdateStudentDto dto)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                throw new NotFoundException("Estudiante", id);
            }

            if (dto.Nombre != null) student.Nombre = dto.Nombre;
            if (dto.Apellido != null) student.Apellido = dto.Apellido;
            if (dto.FechaNacimiento.HasValue) student.FechaNacimiento = dto.FechaNacimiento.Value;
            if (dto.Grado.HasValue) student.Grado = dto.Grado.Value;
            if (dto.Seccion != null) student.Seccion = dto.Seccion;
            if (dto.Direccion != null) student.Direccion = dto.Direccion;
            if (dto.Telefono != null) student.Telefono = dto.Telefono;
            if (dto.Email != null) student.Email = dto.Email;
            if (dto.Estado != null) student.Estado = dto.Estado;

            student.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToResponseDto(student);
        }

        public async Task DeleteAsync(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                throw new NotFoundException("Estudiante", id);
            }

            student.Estado = "inactivo";
            student.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<StudentHistorialDto> GetHistorialAsync(int id, int? requestingUserId, string? requestingUserRole)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                throw new NotFoundException("Estudiante", id);
            }

            // Si es estudiante, solo puede ver su propio historial
            if (requestingUserRole == "estudiante" && requestingUserId != id)
            {
                throw new ForbiddenException("No tiene permiso para ver este historial");
            }

            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                .Include(e => e.Section)
                .Include(e => e.GradeEntries)
                    .ThenInclude(ge => ge.GradeItem)
                .Where(e => e.StudentId == id)
                .ToListAsync();

            var historial = new StudentHistorialDto
            {
                Estudiante = MapToResponseDto(student),
                Inscripciones = enrollments.Select(e => new EnrollmentHistorialDto
                {
                    EnrollmentId = e.Id,
                    AnioEscolar = e.AnioEscolar,
                    CodigoCurso = e.Course?.Codigo ?? "",
                    NombreCurso = e.Course?.Nombre ?? "",
                    SeccionNombre = e.Section?.Nombre ?? "",
                    PromedioFinal = CalcularPromedio(e.GradeEntries.ToList()),
                    Calificaciones = e.GradeEntries.Select(ge => new CalificacionResumenDto
                    {
                        RubroNombre = ge.GradeItem?.Nombre ?? "",
                        RubroTipo = ge.GradeItem?.RubroTipo ?? "",
                        Peso = ge.GradeItem?.Peso ?? 0,
                        Calificacion = ge.Calificacion
                    }).ToList()
                }).ToList()
            };

            return historial;
        }

        private static decimal? CalcularPromedio(List<GradeEntry> entries)
        {
            if (!entries.Any()) return null;

            decimal total = 0;
            foreach (var entry in entries)
            {
                if (entry.GradeItem != null)
                {
                    total += entry.Calificacion * entry.GradeItem.Peso;
                }
            }

            return total;
        }

        private static StudentResponseDto MapToResponseDto(Student student)
        {
            return new StudentResponseDto
            {
                Id = student.Id,
                Matricula = student.Matricula,
                Nombre = student.Nombre,
                Apellido = student.Apellido,
                FechaNacimiento = student.FechaNacimiento,
                Grado = student.Grado,
                Seccion = student.Seccion,
                Direccion = student.Direccion,
                Telefono = student.Telefono,
                Email = student.Email,
                Estado = student.Estado,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt
            };
        }
    }
}

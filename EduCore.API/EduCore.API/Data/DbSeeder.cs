using EduCore.API.Models;
using EduCore.API.Services.Implementations;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(EduCoreDbContext context)
        {
            // Verificar si ya hay datos
            if (await context.Users.AnyAsync())
            {
                return; // Ya hay datos
            }

            // Crear usuarios
            var admin = new User
            {
                Nombre = "Administrador",
                Email = "admin@educore.com",
                PasswordHash = AuthService.HashPassword("admin123"),
                Rol = "admin",
                Activo = true,
                CreatedAt = DateTime.UtcNow
            };

            var docente = new User
            {
                Nombre = "María Rodríguez",
                Email = "docente@educore.com",
                PasswordHash = AuthService.HashPassword("docente123"),
                Rol = "docente",
                Activo = true,
                CreatedAt = DateTime.UtcNow
            };

            var tesoreria = new User
            {
                Nombre = "Carlos Pérez",
                Email = "tesoreria@educore.com",
                PasswordHash = AuthService.HashPassword("tesoreria123"),
                Rol = "tesoreria",
                Activo = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.AddRange(admin, docente, tesoreria);
            await context.SaveChangesAsync();

            // Crear cursos
            var matematicas = new Course
            {
                Codigo = "MAT-3",
                Nombre = "Matemáticas Tercer Grado",
                Grado = 3,
                CreatedAt = DateTime.UtcNow
            };

            var lenguaje = new Course
            {
                Codigo = "LEN-3",
                Nombre = "Lenguaje Tercer Grado",
                Grado = 3,
                CreatedAt = DateTime.UtcNow
            };

            context.Courses.AddRange(matematicas, lenguaje);
            await context.SaveChangesAsync();

            // Crear sección
            var seccionA = new Section
            {
                Nombre = "3-A",
                Aula = "Aula 301",
                Horario = "Lunes a Viernes 8:00 AM - 12:00 PM",
                CreatedAt = DateTime.UtcNow
            };

            context.Sections.Add(seccionA);
            await context.SaveChangesAsync();

            // Crear estudiantes
            var estudiante1 = new Student
            {
                Matricula = "2025-001",
                Nombre = "Juan",
                Apellido = "García",
                FechaNacimiento = new DateTime(2016, 5, 15),
                Grado = 3,
                Seccion = "A",
                Direccion = "Calle Principal #123",
                Telefono = "809-555-0001",
                Email = "juan.garcia@estudiante.com",
                Estado = "activo",
                CreatedBy = admin.Id,
                CreatedAt = DateTime.UtcNow
            };

            var estudiante2 = new Student
            {
                Matricula = "2025-002",
                Nombre = "Ana",
                Apellido = "Martínez",
                FechaNacimiento = new DateTime(2016, 8, 22),
                Grado = 3,
                Seccion = "A",
                Direccion = "Avenida Central #456",
                Telefono = "809-555-0002",
                Email = "ana.martinez@estudiante.com",
                Estado = "activo",
                CreatedBy = admin.Id,
                CreatedAt = DateTime.UtcNow
            };

            context.Students.AddRange(estudiante1, estudiante2);
            await context.SaveChangesAsync();

            // Crear inscripciones (enrollments)
            var enrollment1Mate = new Enrollment
            {
                StudentId = estudiante1.Id,
                CourseId = matematicas.Id,
                SectionId = seccionA.Id,
                AnioEscolar = 2025,
                CreatedAt = DateTime.UtcNow
            };

            var enrollment1Len = new Enrollment
            {
                StudentId = estudiante1.Id,
                CourseId = lenguaje.Id,
                SectionId = seccionA.Id,
                AnioEscolar = 2025,
                CreatedAt = DateTime.UtcNow
            };

            var enrollment2Mate = new Enrollment
            {
                StudentId = estudiante2.Id,
                CourseId = matematicas.Id,
                SectionId = seccionA.Id,
                AnioEscolar = 2025,
                CreatedAt = DateTime.UtcNow
            };

            var enrollment2Len = new Enrollment
            {
                StudentId = estudiante2.Id,
                CourseId = lenguaje.Id,
                SectionId = seccionA.Id,
                AnioEscolar = 2025,
                CreatedAt = DateTime.UtcNow
            };

            context.Enrollments.AddRange(enrollment1Mate, enrollment1Len, enrollment2Mate, enrollment2Len);
            await context.SaveChangesAsync();

            // Crear rubros para Matemáticas
            var examenMate = new GradeItem
            {
                CourseId = matematicas.Id,
                Nombre = "Examen Final",
                Peso = 0.4m,
                RubroTipo = "examen",
                CreatedAt = DateTime.UtcNow
            };

            var tareasMate = new GradeItem
            {
                CourseId = matematicas.Id,
                Nombre = "Tareas",
                Peso = 0.3m,
                RubroTipo = "tarea",
                CreatedAt = DateTime.UtcNow
            };

            var participacionMate = new GradeItem
            {
                CourseId = matematicas.Id,
                Nombre = "Participación",
                Peso = 0.3m,
                RubroTipo = "participacion",
                CreatedAt = DateTime.UtcNow
            };

            // Crear rubros para Lenguaje
            var examenLen = new GradeItem
            {
                CourseId = lenguaje.Id,
                Nombre = "Examen Final",
                Peso = 0.5m,
                RubroTipo = "examen",
                CreatedAt = DateTime.UtcNow
            };

            var proyectoLen = new GradeItem
            {
                CourseId = lenguaje.Id,
                Nombre = "Proyecto de Lectura",
                Peso = 0.5m,
                RubroTipo = "proyecto",
                CreatedAt = DateTime.UtcNow
            };

            context.GradeItems.AddRange(examenMate, tareasMate, participacionMate, examenLen, proyectoLen);
            await context.SaveChangesAsync();

            // Crear calificaciones de ejemplo
            var calificaciones = new List<GradeEntry>
        {
            // Juan - Matemáticas
            new GradeEntry
            {
                EnrollmentId = enrollment1Mate.Id,
                GradeItemId = examenMate.Id,
                Calificacion = 85.5m,
                Observacion = "Buen desempeño",
                CreadoPorUserId = docente.Id,
                CreatedAt = DateTime.UtcNow
            },
            new GradeEntry
            {
                EnrollmentId = enrollment1Mate.Id,
                GradeItemId = tareasMate.Id,
                Calificacion = 90.0m,
                Observacion = "Excelente trabajo",
                CreadoPorUserId = docente.Id,
                CreatedAt = DateTime.UtcNow
            },
            new GradeEntry
            {
                EnrollmentId = enrollment1Mate.Id,
                GradeItemId = participacionMate.Id,
                Calificacion = 95.0m,
                Observacion = "Muy participativo",
                CreadoPorUserId = docente.Id,
                CreatedAt = DateTime.UtcNow
            },
            // Juan - Lenguaje
            new GradeEntry
            {
                EnrollmentId = enrollment1Len.Id,
                GradeItemId = examenLen.Id,
                Calificacion = 88.0m,
                CreadoPorUserId = docente.Id,
                CreatedAt = DateTime.UtcNow
            },
            new GradeEntry
            {
                EnrollmentId = enrollment1Len.Id,
                GradeItemId = proyectoLen.Id,
                Calificacion = 92.0m,
                Observacion = "Proyecto creativo",
                CreadoPorUserId = docente.Id,
                CreatedAt = DateTime.UtcNow
            },
            // Ana - Matemáticas
            new GradeEntry
            {
                EnrollmentId = enrollment2Mate.Id,
                GradeItemId = examenMate.Id,
                Calificacion = 92.0m,
                CreadoPorUserId = docente.Id,
                CreatedAt = DateTime.UtcNow
            },
            new GradeEntry
            {
                EnrollmentId = enrollment2Mate.Id,
                GradeItemId = tareasMate.Id,
                Calificacion = 95.0m,
                CreadoPorUserId = docente.Id,
                CreatedAt = DateTime.UtcNow
            },
            new GradeEntry
            {
                EnrollmentId = enrollment2Mate.Id,
                GradeItemId = participacionMate.Id,
                Calificacion = 98.0m,
                CreadoPorUserId = docente.Id,
                CreatedAt = DateTime.UtcNow
            },
            // Ana - Lenguaje
            new GradeEntry
            {
                EnrollmentId = enrollment2Len.Id,
                GradeItemId = examenLen.Id,
                Calificacion = 94.0m,
                CreadoPorUserId = docente.Id,
                CreatedAt = DateTime.UtcNow
            },
            new GradeEntry
            {
                EnrollmentId = enrollment2Len.Id,
                GradeItemId = proyectoLen.Id,
                Calificacion = 96.0m,
                Observacion = "Excelente proyecto",
                CreadoPorUserId = docente.Id,
                CreatedAt = DateTime.UtcNow
            }
        };

            context.GradeEntries.AddRange(calificaciones);
            await context.SaveChangesAsync();

            Console.WriteLine("Base de datos inicializada con datos de prueba:");
            Console.WriteLine("- Usuarios: admin@educore.com (admin123), docente@educore.com (docente123), tesoreria@educore.com (tesoreria123)");
            Console.WriteLine("- 2 Estudiantes, 2 Cursos, 1 Sección, 5 Rubros, 10 Calificaciones");
        }
    }
}

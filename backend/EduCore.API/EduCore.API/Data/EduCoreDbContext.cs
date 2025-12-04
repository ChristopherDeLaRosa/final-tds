using Microsoft.EntityFrameworkCore;
using EduCore.API.Models;

namespace EduCore.API.Data
{
    public class EduCoreDbContext : DbContext
    {
        public EduCoreDbContext(DbContextOptions<EduCoreDbContext> options) : base(options)
        {
        }

        // DbSets para crear las tablas en la bd
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Estudiante> Estudiantes { get; set; }
        public DbSet<Docente> Docentes { get; set; }
        public DbSet<Curso> Cursos { get; set; }
        public DbSet<GrupoCurso> GruposCursos { get; set; }
        public DbSet<Inscripcion> Inscripciones { get; set; }
        public DbSet<Rubro> Rubros { get; set; }
        public DbSet<Calificacion> Calificaciones { get; set; }
        public DbSet<Sesion> Sesiones { get; set; }
        public DbSet<Asistencia> Asistencias { get; set; }
        public DbSet<Aula> Aulas { get; set; }
        public DbSet<HorarioAula> HorariosAulas { get; set; }
        public DbSet<Periodo> Periodos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // CONFIGURACION DE INDICES UNICOS

            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.NombreUsuario)
                .IsUnique();

            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Estudiante>()
                .HasIndex(e => e.Matricula)
                .IsUnique();

            modelBuilder.Entity<Estudiante>()
                .HasIndex(e => e.Email)
                .IsUnique();

            modelBuilder.Entity<Docente>()
                .HasIndex(d => d.Codigo)
                .IsUnique();

            modelBuilder.Entity<Docente>()
                .HasIndex(d => d.Email)
                .IsUnique();

            modelBuilder.Entity<Curso>()
                .HasIndex(c => c.Codigo)
                .IsUnique();

            modelBuilder.Entity<GrupoCurso>()
                .HasIndex(g => g.Codigo)
                .IsUnique();

            // CONFIGURACION DE USUARIO

            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.Property(e => e.NombreUsuario).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Rol).IsRequired().HasMaxLength(20);

                // Relacion con Estudiante
                entity.HasOne(u => u.Estudiante)
                    .WithMany()
                    .HasForeignKey(u => u.EstudianteId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Relacion con Docente
                entity.HasOne(u => u.Docente)
                    .WithMany()
                    .HasForeignKey(u => u.DocenteId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // CONFIGURACION DE DOCENTE

            modelBuilder.Entity<Docente>(entity =>
            {
                entity.Property(e => e.Codigo).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Nombres).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Apellidos).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Telefono).HasMaxLength(20);
                entity.Property(e => e.Especialidad).HasMaxLength(100);

                // Relacion uno a muchos: Un Docente puede tener muchos GruposCursos
                entity.HasMany(d => d.GrupoCursos)
                    .WithOne(g => g.Docente)
                    .HasForeignKey(g => g.DocenteId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // CONFIGURACION DE ESTUDIANTE

            modelBuilder.Entity<Estudiante>(entity =>
            {
                entity.Property(e => e.Matricula).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Nombres).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Apellidos).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Telefono).HasMaxLength(20);
                entity.Property(e => e.Direccion).HasMaxLength(200);
                entity.Property(e => e.SeccionActual).HasMaxLength(10);
                entity.Property(e => e.NombreTutor).HasMaxLength(200);
                entity.Property(e => e.TelefonoTutor).HasMaxLength(20);
                entity.Property(e => e.EmailTutor).HasMaxLength(150);
                entity.Property(e => e.ObservacionesMedicas).HasMaxLength(500);
            });

            // CONFIGURACION DE CURSO

            modelBuilder.Entity<Curso>(entity =>
            {
                entity.Property(e => e.Codigo).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Nivel).IsRequired().HasMaxLength(50);
                entity.Property(e => e.AreaConocimiento).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Descripcion).HasMaxLength(500);
                entity.Property(e => e.NivelGrado).IsRequired();
                entity.Property(e => e.HorasSemana).IsRequired();
                entity.Property(e => e.EsObligatoria).IsRequired();

                // Relacion uno a muchos: Un Curso puede tener muchos GruposCursos
                entity.HasMany(c => c.GruposCursos)
                    .WithOne(g => g.Curso)
                    .HasForeignKey(g => g.CursoId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // CONFIGURACION DE GRUPOCURSO

            modelBuilder.Entity<GrupoCurso>(entity =>
            {
                entity.Property(e => e.Codigo).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Seccion).IsRequired().HasMaxLength(10);
                entity.Property(e => e.Horario).HasMaxLength(200);
                entity.Property(e => e.Grado).IsRequired();
                entity.Property(e => e.Anio).IsRequired();
                entity.Property(e => e.CapacidadMaxima).IsRequired();

                // Relacion con Curso
                entity.HasOne(g => g.Curso)
                    .WithMany(c => c.GruposCursos)
                    .HasForeignKey(g => g.CursoId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Relacion con Docente
                entity.HasOne(g => g.Docente)
                    .WithMany(d => d.GrupoCursos)
                    .HasForeignKey(g => g.DocenteId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Relacion con Aula
                entity.HasOne(g => g.Aula)
                    .WithMany(a => a.GruposCursos)
                    .HasForeignKey(g => g.AulaId)
                    .OnDelete(DeleteBehavior.SetNull);

                // ====== RELACIÓN CON PERIODO ======
                entity.HasOne(g => g.Periodo)
                    .WithMany(p => p.GruposCursos)
                    .HasForeignKey(g => g.PeriodoId)
                    .OnDelete(DeleteBehavior.Restrict);
                // ===================================

                // Relaciones uno a muchos
                entity.HasMany(g => g.Inscripciones)
                    .WithOne(i => i.GrupoCurso)
                    .HasForeignKey(i => i.GrupoCursoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(g => g.Sesiones)
                    .WithOne(s => s.GrupoCurso)
                    .HasForeignKey(s => s.GrupoCursoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(g => g.Rubros)
                    .WithOne(r => r.GrupoCurso)
                    .HasForeignKey(r => r.GrupoCursoId)
                    .OnDelete(DeleteBehavior.Cascade);
            });


            // CONFIGURACION DE INSCRIPCION

            modelBuilder.Entity<Inscripcion>(entity =>
            {
                entity.Property(e => e.Estado).IsRequired().HasMaxLength(20);

                // Relacion con Estudiante - ESPECIFICANDO NAVEGACION INVERSA
                entity.HasOne(i => i.Estudiante)
                    .WithMany(e => e.Inscripciones)
                    .HasForeignKey(i => i.EstudianteId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Relacion con GrupoCurso
                entity.HasOne(i => i.GrupoCurso)
                    .WithMany(g => g.Inscripciones)
                    .HasForeignKey(i => i.GrupoCursoId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Indice unico compuesto: un estudiante no puede estar inscrito 
                // dos veces en el mismo grupo si esta activo
                entity.HasIndex(i => new { i.EstudianteId, i.GrupoCursoId })
                    .IsUnique()
                    .HasFilter("[Activo] = 1");

                // Precision decimal
                entity.Property(i => i.PromedioFinal)
                    .HasPrecision(5, 2);
            });

            // CONFIGURACION DE SESION

            modelBuilder.Entity<Sesion>(entity =>
            {
                entity.Property(e => e.Tema).HasMaxLength(100);
                entity.Property(e => e.Observaciones).HasMaxLength(500);

                // Relacion con GrupoCurso
                entity.HasOne(s => s.GrupoCurso)
                    .WithMany(g => g.Sesiones)
                    .HasForeignKey(s => s.GrupoCursoId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Relacion uno a muchos con Asistencias
                entity.HasMany(s => s.Asistencias)
                    .WithOne(a => a.Sesion)
                    .HasForeignKey(a => a.SesionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // CONFIGURACION DE RUBRO

            modelBuilder.Entity<Rubro>(entity =>
            {
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Descripcion).HasMaxLength(300);

                // Relacion con GrupoCurso
                entity.HasOne(r => r.GrupoCurso)
                    .WithMany(g => g.Rubros)
                    .HasForeignKey(r => r.GrupoCursoId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Relacion uno a muchos con Calificaciones
                entity.HasMany(r => r.Calificaciones)
                    .WithOne(c => c.Rubro)
                    .HasForeignKey(c => c.RubroId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Precision decimal
                entity.Property(r => r.Porcentaje)
                    .HasPrecision(5, 2);
            });

            // CONFIGURACION DE CALIFICACION

            modelBuilder.Entity<Calificacion>(entity =>
            {
                entity.Property(e => e.Observaciones).HasMaxLength(500);

                // Relacion con Estudiante - ESPECIFICANDO NAVEGACION INVERSA
                entity.HasOne(c => c.Estudiante)
                    .WithMany(e => e.Calificaciones)
                    .HasForeignKey(c => c.EstudianteId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Relacion con Rubro
                entity.HasOne(c => c.Rubro)
                    .WithMany(r => r.Calificaciones)
                    .HasForeignKey(c => c.RubroId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Indice compuesto: un estudiante puede tener multiples 
                // calificaciones en un rubro (recuperaciones)
                entity.HasIndex(c => new { c.EstudianteId, c.RubroId });

                // Precision decimal
                entity.Property(c => c.Nota)
                    .HasPrecision(5, 2);
            });

            // CONFIGURACION DE ASISTENCIA

            modelBuilder.Entity<Asistencia>(entity =>
            {
                entity.Property(e => e.Estado).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Observaciones).HasMaxLength(300);

                // Relacion con Estudiante - ESPECIFICANDO NAVEGACION INVERSA
                entity.HasOne(a => a.Estudiante)
                    .WithMany(e => e.Asistencias)
                    .HasForeignKey(a => a.EstudianteId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Relacion con Sesion
                entity.HasOne(a => a.Sesion)
                    .WithMany(s => s.Asistencias)
                    .HasForeignKey(a => a.SesionId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Indice unico compuesto: un estudiante no puede tener 
                // dos registros en la misma sesion
                entity.HasIndex(a => new { a.EstudianteId, a.SesionId })
                    .IsUnique();
            });

            // CONFIGURACION DE AULA
            modelBuilder.Entity<Aula>(entity =>
            {
                entity.Property(e => e.Codigo).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Seccion).IsRequired().HasMaxLength(10);
                entity.Property(e => e.AulaFisica).HasMaxLength(50);

                // Índice único: No puede haber dos aulas con el mismo grado/sección/periodo
                entity.HasIndex(a => new { a.Grado, a.Seccion, a.PeriodoId }) // ← CAMBIO AQUÍ
                    .IsUnique()
                    .HasFilter("[Activo] = 1");

                // ====== RELACIÓN CON PERIODO ======
                entity.HasOne(a => a.Periodo)
                    .WithMany(p => p.Aulas)
                    .HasForeignKey(a => a.PeriodoId)
                    .OnDelete(DeleteBehavior.Restrict);
                // ==================================

                // Relación uno a muchos con Estudiantes
                entity.HasMany(a => a.Estudiantes)
                    .WithOne(e => e.Aula)
                    .HasForeignKey(e => e.AulaId)
                    .OnDelete(DeleteBehavior.SetNull);

                // Relación uno a muchos con HorarioAula
                entity.HasMany(a => a.Horarios)
                    .WithOne(h => h.Aula)
                    .HasForeignKey(h => h.AulaId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Relación uno a muchos con GruposCursos
                entity.HasMany(a => a.GruposCursos)
                    .WithOne(g => g.Aula)
                    .HasForeignKey(g => g.AulaId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // CONFIGURACION DE HORARIO AULA
            modelBuilder.Entity<HorarioAula>(entity =>
            {
                // Relación con Aula
                entity.HasOne(h => h.Aula)
                    .WithMany(a => a.Horarios)
                    .HasForeignKey(h => h.AulaId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Relación con Curso
                entity.HasOne(h => h.Curso)
                    .WithMany()
                    .HasForeignKey(h => h.CursoId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Relación con Docente
                entity.HasOne(h => h.Docente)
                    .WithMany()
                    .HasForeignKey(h => h.DocenteId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Índice compuesto: No puede haber dos horarios en el mismo aula/día/hora
                entity.HasIndex(h => new { h.AulaId, h.DiaSemana, h.HoraInicio })
                    .IsUnique()
                    .HasFilter("[Activo] = 1");
            });

            // ========== CONFIGURACION DE PERIODO ========== 
            modelBuilder.Entity<Periodo>(entity =>
            {
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Trimestre).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Observaciones).HasMaxLength(500);

                // Relación con GruposCursos
                entity.HasMany(p => p.GruposCursos)
                    .WithOne(g => g.Periodo)
                    .HasForeignKey(g => g.PeriodoId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Índice para búsquedas rápidas por período actual
                entity.HasIndex(p => p.EsActual);

                // Índice compuesto para búsquedas por año escolar y trimestre
                entity.HasIndex(p => new { p.Nombre, p.Trimestre });

                // Validación: solo puede haber un período actual a la vez
                entity.HasIndex(p => p.EsActual)
                    .IsUnique()
                    .HasFilter("[EsActual] = 1");
            });

            // DATOS SEMILLA (SEED DATA)

            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Hash de la contrasena "Admin123!"
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");

            modelBuilder.Entity<Usuario>().HasData(
                new Usuario
                {
                    Id = 1,
                    NombreUsuario = "admin",
                    Email = "admin@educore.com",
                    PasswordHash = passwordHash,
                    Rol = "Admin",
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                }
            );
        }
    }
}
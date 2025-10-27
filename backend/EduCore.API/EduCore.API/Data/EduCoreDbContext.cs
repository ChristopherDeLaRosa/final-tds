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
        public DbSet<Seccion> Secciones { get; set; }
        public DbSet<Inscripcion> Inscripciones { get; set; }
        public DbSet<Rubro> Rubros { get; set; }
        public DbSet<Calificacion> Calificaciones { get; set; }
        public DbSet<Sesion> Sesiones { get; set; }
        public DbSet<Asistencia> Asistencias { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de índices únicos
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

            modelBuilder.Entity<Seccion>()
                .HasIndex(s => s.Codigo)
                .IsUnique();

            // Configuración de relaciones
            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Estudiante)
                .WithMany()
                .HasForeignKey(u => u.EstudianteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Docente)
                .WithMany()
                .HasForeignKey(u => u.DocenteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Inscripcion>()
                .HasOne(i => i.Estudiante)
                .WithMany(e => e.Inscripciones)
                .HasForeignKey(i => i.EstudianteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Inscripcion>()
                .HasOne(i => i.Seccion)
                .WithMany(s => s.Inscripciones)
                .HasForeignKey(i => i.SeccionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Calificacion>()
                .HasOne(c => c.Estudiante)
                .WithMany(e => e.Calificaciones)
                .HasForeignKey(c => c.EstudianteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Calificacion>()
                .HasOne(c => c.Rubro)
                .WithMany(r => r.Calificaciones)
                .HasForeignKey(c => c.RubroId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Asistencia>()
                .HasOne(a => a.Estudiante)
                .WithMany(e => e.Asistencias)
                .HasForeignKey(a => a.EstudianteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Asistencia>()
                .HasOne(a => a.Sesion)
                .WithMany(s => s.Asistencias)
                .HasForeignKey(a => a.SesionId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuración de precisión decimal
            modelBuilder.Entity<Calificacion>()
                .Property(c => c.Nota)
                .HasPrecision(5, 2);

            modelBuilder.Entity<Inscripcion>()
                .Property(i => i.PromedioFinal)
                .HasPrecision(5, 2);

            modelBuilder.Entity<Rubro>()
                .Property(r => r.Porcentaje)
                .HasPrecision(5, 2);

            // Datos semilla (Seed Data) - Usuario Admin por defecto
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Hash de la contraseña "Admin123!" (en prodcucion debo usar un hash real)
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
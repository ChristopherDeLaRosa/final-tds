using Microsoft.EntityFrameworkCore;
using EduCore.API.Models;
using static System.Collections.Specialized.BitVector32;

namespace EduCore.API.Data;

public class EduCoreDbContext : DbContext
{
    public EduCoreDbContext(DbContextOptions<EduCoreDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Student> Students { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Section> Sections { get; set; }
    public DbSet<Enrollment> Enrollments { get; set; }
    public DbSet<GradeItem> GradeItems { get; set; }
    public DbSet<GradeEntry> GradeEntries { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración User
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Rol).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Activo).HasDefaultValue(true);
        });

        // Configuración Student
        modelBuilder.Entity<Student>(entity =>
        {
            entity.ToTable("Students");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Matricula).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Matricula).IsUnique();
            entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Apellido).IsRequired().HasMaxLength(100);
            entity.Property(e => e.FechaNacimiento).IsRequired();
            entity.Property(e => e.Grado).IsRequired();
            entity.Property(e => e.Seccion).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Direccion).HasMaxLength(250);
            entity.Property(e => e.Telefono).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Estado).IsRequired().HasMaxLength(20).HasDefaultValue("activo");

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configuración Course
        modelBuilder.Entity<Course>(entity =>
        {
            entity.ToTable("Courses");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Codigo).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Codigo).IsUnique();
            entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Grado).IsRequired();
        });

        // Configuración Section
        modelBuilder.Entity<Section>(entity =>
        {
            entity.ToTable("Sections");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nombre).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Aula).HasMaxLength(50);
            entity.Property(e => e.Horario).HasMaxLength(100);
        });

        // Configuración Enrollment
        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.ToTable("Enrollments");
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Student)
                .WithMany(s => s.Enrollments)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Course)
                .WithMany()
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Section)
                .WithMany()
                .HasForeignKey(e => e.SectionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.StudentId, e.CourseId, e.AnioEscolar }).IsUnique();
        });

        // Configuración GradeItem
        modelBuilder.Entity<GradeItem>(entity =>
        {
            entity.ToTable("GradeItems");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Peso).IsRequired().HasColumnType("decimal(5,4)");
            entity.Property(e => e.RubroTipo).IsRequired().HasMaxLength(50);

            entity.HasOne(e => e.Course)
                .WithMany(c => c.GradeItems)
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configuración GradeEntry
        modelBuilder.Entity<GradeEntry>(entity =>
        {
            entity.ToTable("GradeEntries");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Calificacion).IsRequired().HasColumnType("decimal(5,2)");
            entity.Property(e => e.Observacion).HasMaxLength(500);

            entity.HasOne(e => e.Enrollment)
                .WithMany(en => en.GradeEntries)
                .HasForeignKey(e => e.EnrollmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.GradeItem)
                .WithMany()
                .HasForeignKey(e => e.GradeItemId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CreadoPorUser)
                .WithMany()
                .HasForeignKey(e => e.CreadoPorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.EnrollmentId, e.GradeItemId }).IsUnique();
        });

        // Configuración AuditLog
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("AuditLogs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Accion).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Entidad).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PayloadJson).HasColumnType("nvarchar(max)");
            entity.Property(e => e.Ip).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
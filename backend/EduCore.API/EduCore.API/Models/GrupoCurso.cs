using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    public class GrupoCurso
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string Codigo { get; set; } = string.Empty; // Ej: 8A-MAT, 9B-HIST

        [Required]
        public int CursoId { get; set; }
        [ForeignKey("CursoId")]
        public virtual Curso Curso { get; set; } = null!;

        [Required]
        public int DocenteId { get; set; }
        [ForeignKey("DocenteId")]
        public virtual Docente Docente { get; set; } = null!;

        // Informacion del grupo
        [Required]
        [Range(1, 12)]
        public int Grado { get; set; } // 1-12

        [Required]
        [MaxLength(10)]
        public string Seccion { get; set; } = string.Empty; // "A", "B", "C"

        [Required]
        public int Anio { get; set; } // 2024, 2025

        // ============ RELACIÓN CON PERIODO ============
        [Required]
        public int PeriodoId { get; set; }
        [ForeignKey("PeriodoId")]
        public virtual Periodo Periodo { get; set; } = null!;
        // ==============================================

        [ForeignKey("AulaId")]
        public int? AulaId { get; set; }
        public virtual Aula? Aula { get; set; }

        [MaxLength(200)]
        public string? Horario { get; set; } // Ej: "Lun-Mie-Vie 8:00-9:00"

        [Required]
        [Range(1, 50)]
        public int CapacidadMaxima { get; set; } = 35;

        public int CantidadEstudiantes { get; set; } = 0;

        public bool Activo { get; set; } = true;

        // Navegacion
        public virtual ICollection<Inscripcion> Inscripciones { get; set; } = new List<Inscripcion>();
        public virtual ICollection<Sesion> Sesiones { get; set; } = new List<Sesion>();
        public virtual ICollection<Rubro> Rubros { get; set; } = new List<Rubro>();
    }
}
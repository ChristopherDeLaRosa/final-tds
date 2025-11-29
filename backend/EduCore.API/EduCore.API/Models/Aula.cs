using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    /// Representa un aula física con su grupo de estudiantes y horario completo
    /// Ej: "5°A - 2024-2025" tiene 30 estudiantes y un horario semanal definido
    public class Aula
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Codigo { get; set; } = string.Empty; // Ej: "5A-2024"

        [Required]
        [Range(1, 12)]
        public int Grado { get; set; } // 1-12

        [Required]
        [MaxLength(10)]
        public string Seccion { get; set; } = string.Empty; // "A", "B", "C"

        [Required]
        public int Anio { get; set; } // 2024, 2025

        [Required]
        [MaxLength(20)]
        public string Periodo { get; set; } = string.Empty; // "2024-2025"

        [MaxLength(50)]
        public string? AulaFisica { get; set; } // Nombre del salón físico: "Aula 201"

        [Required]
        [Range(1, 50)]
        public int CapacidadMaxima { get; set; } = 35;

        public int CantidadEstudiantes { get; set; } = 0;

        public DateTime FechaInicio { get; set; } // Inicio del año escolar
        public DateTime FechaFin { get; set; } // Fin del año escolar

        public bool Activo { get; set; } = true;

        // Navegación
        public virtual ICollection<Estudiante> Estudiantes { get; set; } = new List<Estudiante>();
        public virtual ICollection<HorarioAula> Horarios { get; set; } = new List<HorarioAula>();
        public virtual ICollection<GrupoCurso> GruposCursos { get; set; } = new List<GrupoCurso>();
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models
{
    /// <summary>
    /// Representa una entrada en el horario semanal de un aula
    /// Ej: Lunes 8:00-9:00 Matemáticas con Docente García
    /// </summary>
    public class HorarioAula
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AulaId { get; set; }

        [ForeignKey("AulaId")]
        public virtual Aula Aula { get; set; } = null!;

        [Required]
        public int CursoId { get; set; }

        [ForeignKey("CursoId")]
        public virtual Curso Curso { get; set; } = null!;

        [Required]
        public int DocenteId { get; set; }

        [ForeignKey("DocenteId")]
        public virtual Docente Docente { get; set; } = null!;

        [Required]
        public DayOfWeek DiaSemana { get; set; } // Lunes, Martes, etc.

        [Required]
        public TimeSpan HoraInicio { get; set; }

        [Required]
        public TimeSpan HoraFin { get; set; }

        public int Orden { get; set; } = 0; // Para ordenar las clases del día

        public bool Activo { get; set; } = true;
    }
}
using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models
{
    public class Periodo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Nombre { get; set; } = string.Empty; // "2024-2025"

        [Required]
        [MaxLength(20)]
        public string Trimestre { get; set; } = string.Empty; // "Primero", "Segundo", "Tercero"

        [Required]
        public DateTime FechaInicio { get; set; }

        [Required]
        public DateTime FechaFin { get; set; }

        public bool EsActual { get; set; } = false;

        public bool Activo { get; set; } = true;

        [MaxLength(500)]
        public string? Observaciones { get; set; }

        // Navegación
        public virtual ICollection<GrupoCurso> GruposCursos { get; set; } = new List<GrupoCurso>();
        public virtual ICollection<Aula> Aulas { get; set; } = new List<Aula>();
    }
}
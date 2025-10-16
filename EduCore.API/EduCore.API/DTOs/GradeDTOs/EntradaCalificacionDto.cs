using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs.GradeDTOs
{
    public class EntradaCalificacionDto
    {
        [Required(ErrorMessage = "El ID de inscripción es requerido")]
        public int EnrollmentId { get; set; }

        [Required(ErrorMessage = "La calificación es requerida")]
        [Range(0, 100, ErrorMessage = "La calificación debe estar entre 0 y 100")]
        public decimal Calificacion { get; set; }

        [StringLength(500, ErrorMessage = "La observación no puede exceder 500 caracteres")]
        public string? Observacion { get; set; }
    }
}

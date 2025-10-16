using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs.GradeDTOs
{
    public class CargaMasivaCalificacionesDto
    {
        [Required(ErrorMessage = "El ID de la sección es requerido")]
        public int SectionId { get; set; }

        [Required(ErrorMessage = "El ID del rubro es requerido")]
        public int GradeItemId { get; set; }

        [Required(ErrorMessage = "Debe incluir al menos una entrada")]
        [MinLength(1, ErrorMessage = "Debe incluir al menos una entrada")]
        [MaxLength(200, ErrorMessage = "No puede incluir más de 200 entradas por petición")]
        public List<EntradaCalificacionDto> Entradas { get; set; } = new();
    }
}

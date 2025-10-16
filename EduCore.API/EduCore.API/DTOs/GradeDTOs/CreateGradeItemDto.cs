using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs.GradeDTOs
{
    public class CreateGradeItemDto
    {
        [Required(ErrorMessage = "El nombre del rubro es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El peso es requerido")]
        [Range(0, 1, ErrorMessage = "El peso debe estar entre 0 y 1")]
        public decimal Peso { get; set; }

        [Required(ErrorMessage = "El tipo de rubro es requerido")]
        [RegularExpression("^(examen|tarea|proyecto|participacion)$",
            ErrorMessage = "El tipo debe ser: examen, tarea, proyecto o participacion")]
        public string RubroTipo { get; set; } = string.Empty;
    }
}

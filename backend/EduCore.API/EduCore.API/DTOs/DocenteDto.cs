using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class DocenteDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombres { get; set; } = string.Empty;
        public string Apellidos { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public string? Especialidad { get; set; }
        public DateTime FechaContratacion { get; set; }
        public bool Activo { get; set; }
        public int CantidadGrupos { get; set; }
        public int CantidadEstudiantes { get; set; }
    }

    public class CreateDocenteDto
    {
        [Required(ErrorMessage = "El código es requerido")]
        [MaxLength(20, ErrorMessage = "El código no puede exceder 20 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los nombres son requeridos")]
        [MaxLength(100, ErrorMessage = "Los nombres no pueden exceder 100 caracteres")]
        public string Nombres { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los apellidos son requeridos")]
        [MaxLength(100, ErrorMessage = "Los apellidos no pueden exceder 100 caracteres")]
        public string Apellidos { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        [MaxLength(150, ErrorMessage = "El email no puede exceder 150 caracteres")]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
        public string? Telefono { get; set; }

        [MaxLength(100, ErrorMessage = "La especialidad no puede exceder 100 caracteres")]
        public string? Especialidad { get; set; }

        public DateTime? FechaContratacion { get; set; }
    }

    public class UpdateDocenteDto
    {
        [Required(ErrorMessage = "Los nombres son requeridos")]
        [MaxLength(100, ErrorMessage = "Los nombres no pueden exceder 100 caracteres")]
        public string Nombres { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los apellidos son requeridos")]
        [MaxLength(100, ErrorMessage = "Los apellidos no pueden exceder 100 caracteres")]
        public string Apellidos { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        [MaxLength(150, ErrorMessage = "El email no puede exceder 150 caracteres")]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
        public string? Telefono { get; set; }

        [MaxLength(100, ErrorMessage = "La especialidad no puede exceder 100 caracteres")]
        public string? Especialidad { get; set; }

        public bool Activo { get; set; }
    }

    public class DocenteDetalleDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombres { get; set; } = string.Empty;
        public string Apellidos { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public string? Especialidad { get; set; }
        public DateTime FechaContratacion { get; set; }
        public int AñosServicio { get; set; }
        public bool Activo { get; set; }

        // Estadísticas
        public int TotalGrupos { get; set; }
        public int TotalEstudiantes { get; set; }
        public int TotalSesionesImpartidas { get; set; }
        public decimal PromedioAsistenciaGrupos { get; set; }

        // Grupos asignados
        public List<GrupoCursoDocenteDto> GruposAsignados { get; set; } = new();
    }

    public class GrupoCursoDocenteDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public int CantidadEstudiantes { get; set; }
        public int CapacidadMaxima { get; set; }
        public string? Aula { get; set; }
        public string? Horario { get; set; }
    }

    // Para el horario semanal del docente
    public class HorarioDocenteDto
    {
        public int DocenteId { get; set; }
        public string CodigoDocente { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public DateTime SemanaInicio { get; set; }
        public DateTime SemanaFin { get; set; }
        public List<SesionDocenteSemanalDto> Sesiones { get; set; } = new();
    }

    public class SesionDocenteSemanalDto
    {
        public int Id { get; set; }
        public DayOfWeek DiaSemana { get; set; }
        public string DiaSemanaTexto { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public string NombreCurso { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public string? Tema { get; set; }
        public string? Aula { get; set; }
        public bool Realizada { get; set; }
    }

    // Para estadísticas del docente
    public class EstadisticasDocenteDto
    {
        public int DocenteId { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;

        // Grupos
        public int TotalGrupos { get; set; }
        public int TotalEstudiantes { get; set; }
        public List<string> CursosImpartidos { get; set; } = new();

        // Sesiones
        public int TotalSesionesProgramadas { get; set; }
        public int SesionesRealizadas { get; set; }
        public int SesionesPendientes { get; set; }
        public decimal PorcentajeAvance { get; set; }
        public int TotalHorasImpartidas { get; set; }

        // Rendimiento de estudiantes
        public decimal PromedioGeneralEstudiantes { get; set; }
        public int EstudiantesAprobados { get; set; }
        public int EstudiantesReprobados { get; set; }
        public decimal TasaAprobacion { get; set; }

        // Asistencia
        public decimal PromedioAsistencia { get; set; }
    }

    // Para reporte de carga académica
    public class CargaAcademicaDocenteDto
    {
        public int DocenteId { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string Especialidad { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public int HorasSemanales { get; set; }
        public int TotalGrupos { get; set; }
        public int TotalEstudiantes { get; set; }
        public List<CargaGrupoDto> Grupos { get; set; } = new();
    }

    public class CargaGrupoDto
    {
        public string NombreCurso { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public int CantidadEstudiantes { get; set; }
        public int HorasSemanales { get; set; }
    }

    // Para listado con filtros
    public class DocenteFiltrosDto
    {
        public string? Busqueda { get; set; }
        public string? Especialidad { get; set; }
        public bool? Activo { get; set; }
        public int? Anio { get; set; }
        public string? Periodo { get; set; }
    }
}
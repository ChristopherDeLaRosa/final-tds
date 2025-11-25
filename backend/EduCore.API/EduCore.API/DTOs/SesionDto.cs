using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class SesionDto
    {
        public int Id { get; set; }
        public int GrupoCursoId { get; set; }
        public string CodigoGrupo { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public string? Tema { get; set; }
        public string? Observaciones { get; set; }
        public bool Realizada { get; set; }
        public int TotalAsistencias { get; set; }
        public int Presentes { get; set; }
        public int Ausentes { get; set; }
        public decimal PorcentajeAsistencia { get; set; }
    }

    public class CreateSesionDto
    {
        [Required(ErrorMessage = "El grupo-curso es requerido")]
        public int GrupoCursoId { get; set; }

        [Required(ErrorMessage = "La fecha es requerida")]
        public DateTime Fecha { get; set; }

        [Required(ErrorMessage = "La hora de inicio es requerida")]
        public TimeSpan HoraInicio { get; set; }

        [Required(ErrorMessage = "La hora de fin es requerida")]
        public TimeSpan HoraFin { get; set; }

        [MaxLength(100, ErrorMessage = "El tema no puede exceder 100 caracteres")]
        public string? Tema { get; set; }

        [MaxLength(500, ErrorMessage = "Las observaciones no pueden exceder 500 caracteres")]
        public string? Observaciones { get; set; }
    }

    public class UpdateSesionDto
    {
        [Required(ErrorMessage = "La fecha es requerida")]
        public DateTime Fecha { get; set; }

        [Required(ErrorMessage = "La hora de inicio es requerida")]
        public TimeSpan HoraInicio { get; set; }

        [Required(ErrorMessage = "La hora de fin es requerida")]
        public TimeSpan HoraFin { get; set; }

        [MaxLength(100, ErrorMessage = "El tema no puede exceder 100 caracteres")]
        public string? Tema { get; set; }

        [MaxLength(500, ErrorMessage = "Las observaciones no pueden exceder 500 caracteres")]
        public string? Observaciones { get; set; }

        public bool Realizada { get; set; }
    }

    public class SesionDetalleDto
    {
        public int Id { get; set; }
        public int GrupoCursoId { get; set; }
        public string CodigoGrupo { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string AreaConocimiento { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public string Docente { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public int DuracionMinutos { get; set; }
        public string? Tema { get; set; }
        public string? Observaciones { get; set; }
        public bool Realizada { get; set; }
        public List<AsistenciaDto> Asistencias { get; set; } = new();
        public int TotalEstudiantes { get; set; }
        public int Presentes { get; set; }
        public int Ausentes { get; set; }
        public int Tardanzas { get; set; }
        public int Justificados { get; set; }
        public decimal PorcentajeAsistencia { get; set; }
    }

    // Para crear múltiples sesiones (programación por semanas/mes)
    public class CrearSesionesRecurrentesDto
    {
        [Required(ErrorMessage = "El grupo-curso es requerido")]
        public int GrupoCursoId { get; set; }

        [Required(ErrorMessage = "La fecha de inicio es requerida")]
        public DateTime FechaInicio { get; set; }

        [Required(ErrorMessage = "La fecha de fin es requerida")]
        public DateTime FechaFin { get; set; }

        [Required(ErrorMessage = "Los días de la semana son requeridos")]
        public List<DayOfWeek> DiasSemana { get; set; } = new(); // Lunes, Miércoles, Viernes

        [Required(ErrorMessage = "La hora de inicio es requerida")]
        public TimeSpan HoraInicio { get; set; }

        [Required(ErrorMessage = "La hora de fin es requerida")]
        public TimeSpan HoraFin { get; set; }

        [MaxLength(100)]
        public string? TemaBase { get; set; }
    }

    // Para horario semanal
    public class HorarioSemanalGrupoDto
    {
        public int GrupoCursoId { get; set; }
        public string CodigoGrupo { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public DateTime SemanaInicio { get; set; }
        public DateTime SemanaFin { get; set; }
        public List<SesionSemanalDto> Sesiones { get; set; } = new();
    }

    public class SesionSemanalDto
    {
        public int Id { get; set; }
        public DayOfWeek DiaSemana { get; set; }
        public string DiaSemanaTexto { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public string? Tema { get; set; }
        public bool Realizada { get; set; }
        public int? TotalAsistencias { get; set; }
    }

    // Para calendario mensual
    public class CalendarioMensualDto
    {
        public int Anio { get; set; }
        public int Mes { get; set; }
        public string NombreMes { get; set; } = string.Empty;
        public List<CalendarioDiaDto> Dias { get; set; } = new();
    }

    public class CalendarioDiaDto
    {
        public DateTime Fecha { get; set; }
        public int DiaMes { get; set; }
        public DayOfWeek DiaSemana { get; set; }
        public List<SesionCalendarioDto> Sesiones { get; set; } = new();
    }

    public class SesionCalendarioDto
    {
        public int Id { get; set; }
        public int GrupoCursoId { get; set; }
        public string NombreCurso { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public string? Tema { get; set; }
        public bool Realizada { get; set; }
    }

    // Para estadísticas
    public class EstadisticasSesionesDto
    {
        public int GrupoCursoId { get; set; }
        public string NombreCurso { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public int TotalSesionesProgramadas { get; set; }
        public int SesionesRealizadas { get; set; }
        public int SesionesPendientes { get; set; }
        public decimal PorcentajeAvance { get; set; }
        public decimal PromedioAsistencia { get; set; }
        public int TotalHorasImpartidas { get; set; }
    }
}


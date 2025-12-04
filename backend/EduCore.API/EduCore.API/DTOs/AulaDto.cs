using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    public class AulaDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public int Anio { get; set; }
        public string Periodo { get; set; } = string.Empty;
        public string? AulaFisica { get; set; }
        public int CapacidadMaxima { get; set; }
        public int CantidadEstudiantes { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public bool Activo { get; set; }

        // Computed
        public int CantidadCursos { get; set; }
        public int CuposDisponibles { get; set; }
    }

    public class CreateAulaDto
    {
        public int Grado { get; set; }
        public string Seccion { get; set; } = string.Empty;
        public int Anio { get; set; }
        public int PeriodoId { get; set; }
        public string? AulaFisica { get; set; }
        public int CapacidadMaxima { get; set; } = 35;
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
    }

    public class UpdateAulaDto
    {
        public string? AulaFisica { get; set; }
        public int CapacidadMaxima { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public bool Activo { get; set; }
    }

    public class HorarioAulaDto
    {
        public int Id { get; set; }
        public int AulaId { get; set; }
        public int CursoId { get; set; }
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string AreaConocimiento { get; set; } = string.Empty;
        public int DocenteId { get; set; }
        public string CodigoDocente { get; set; } = string.Empty;
        public string NombreDocente { get; set; } = string.Empty;
        public DayOfWeek DiaSemana { get; set; }
        public string DiaSemanaTexto { get; set; } = string.Empty;
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public int Orden { get; set; }
        public bool Activo { get; set; }
    }

    public class CreateHorarioAulaDto
    {
        public int AulaId { get; set; }
        public int CursoId { get; set; }
        public int DocenteId { get; set; }
        public DayOfWeek DiaSemana { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public int Orden { get; set; } = 0;
    }

    public class UpdateHorarioAulaDto
    {
        public int DocenteId { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public int Orden { get; set; }
        public bool Activo { get; set; }
    }

    public class AulaDetalleDto
    {
        public AulaDto Aula { get; set; } = null!;
        public List<HorarioAulaDto> Horarios { get; set; } = new();
        public List<EstudianteDto> Estudiantes { get; set; } = new();
        public List<GrupoCursoDto> GruposCursos { get; set; } = new();
    }

    public class ConfigurarHorarioCompletoDto
    {
        public int AulaId { get; set; }
        public List<CreateHorarioAulaDto> Horarios { get; set; } = new();
        public bool GenerarGruposAutomaticamente { get; set; } = true;
        public bool GenerarSesionesAutomaticamente { get; set; } = true;
    }
    public class ResultadoEdicionHorarioDto
    {
        public bool Exitoso { get; set; }
        public string Mensaje { get; set; } = string.Empty;
        public HorarioAulaDto HorarioActualizado { get; set; } = null!;
        public int GruposCursosActualizados { get; set; }
        public int SesionesFuturasActualizadas { get; set; }
        public List<string> Detalles { get; set; } = new();
    }

    public class ResultadoEliminacionHorarioDto
    {
        public bool Exitoso { get; set; }
        public string Mensaje { get; set; } = string.Empty;
        public int GruposCursosEliminados { get; set; }
        public int SesionesEliminadas { get; set; }
        public int InscripcionesEliminadas { get; set; }
        public List<string> Detalles { get; set; } = new();
    }

    public class InscribirEstudianteEnAulaDto
    {
        public int EstudianteId { get; set; }
        public int AulaId { get; set; }
        public bool InscribirEnTodasLasMaterias { get; set; } = true;
    }

    public class ResultadoConfiguracionAulaDto
    {
        public int HorariosCreados { get; set; }
        public int GruposCursosCreados { get; set; }
        public int SesionesGeneradas { get; set; }
        public List<string> Errores { get; set; } = new();
        public bool Exitoso { get; set; }
        public string Mensaje { get; set; } = string.Empty;
    }

    public class CrearAulasMasivasDto
    {
        [Required]
        public int Anio { get; set; }

        [Required]
        [MaxLength(20)]
        public string Periodo { get; set; } = string.Empty;

        [Required]
        public DateTime FechaInicio { get; set; }

        [Required]
        public DateTime FechaFin { get; set; }

        [Range(1, 50)]
        public int CapacidadMaximaPorDefecto { get; set; } = 35;

        public List<ConfiguracionGradoDto> Grados { get; set; } = new();
    }

    public class ConfiguracionGradoDto
    {
        [Required]
        [Range(1, 12)]
        public int Grado { get; set; }

        [Required]
        public List<string> Secciones { get; set; } = new();

        public int? CapacidadMaxima { get; set; }

        public string? AulaFisicaBase { get; set; } // Ej: "Edificio A"
    }

    public class ResultadoCreacionMasivaDto
    {
        public bool Exitoso { get; set; }
        public string Mensaje { get; set; } = string.Empty;
        public int AulasCreadas { get; set; }
        public int AulasExistentes { get; set; }
        public List<string> Errores { get; set; } = new();
        public List<AulaDto> AulasNuevas { get; set; } = new();
    }
}
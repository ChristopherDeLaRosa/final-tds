using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs
{
    // DTOs para Reportes Generales
    public class ReporteNotasSeccionDto
    {
        public int SeccionId { get; set; }
        public string CodigoSeccion { get; set; } = string.Empty;
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public string Docente { get; set; } = string.Empty;
        public DateTime FechaGeneracion { get; set; } = DateTime.UtcNow;
        public List<EstudianteNotaDto> Estudiantes { get; set; } = new List<EstudianteNotaDto>();
        public decimal PromedioGeneral { get; set; }
        public int TotalAprobados { get; set; }
        public int TotalReprobados { get; set; }
        public decimal PorcentajeAprobacion { get; set; }
    }

    public class EstudianteNotaDto
    {
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public decimal PromedioFinal { get; set; }
        public string Estado { get; set; } = string.Empty;
    }

    public class ReporteAsistenciaSeccionDto
    {
        public int SeccionId { get; set; }
        public string CodigoSeccion { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public DateTime FechaGeneracion { get; set; } = DateTime.UtcNow;
        public int TotalSesiones { get; set; }
        public List<EstudianteAsistenciaReporteDto> Estudiantes { get; set; } = new List<EstudianteAsistenciaReporteDto>();
        public decimal PromedioAsistenciaGeneral { get; set; }
    }

    public class EstudianteAsistenciaReporteDto
    {
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public int Presentes { get; set; }
        public int Ausentes { get; set; }
        public int Tardanzas { get; set; }
        public decimal PorcentajeAsistencia { get; set; }
        public string Estado { get; set; } = string.Empty;
    }

    public class ReporteRendimientoEstudianteDto
    {
        public int EstudianteId { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime FechaGeneracion { get; set; } = DateTime.UtcNow;
        public List<CursoRendimientoDto> Cursos { get; set; } = new List<CursoRendimientoDto>();
        public decimal PromedioGeneral { get; set; }
        public decimal PorcentajeAsistenciaGeneral { get; set; }
        public int TotalCursosAprobados { get; set; }
        public int TotalCursosReprobados { get; set; }
    }

    public class CursoRendimientoDto
    {
        public string CodigoCurso { get; set; } = string.Empty;
        public string NombreCurso { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public decimal PromedioFinal { get; set; }
        public decimal PorcentajeAsistencia { get; set; }
        public string EstadoCurso { get; set; } = string.Empty;
    }

    public class ReporteEstadisticasGeneralesDto
    {
        public DateTime FechaGeneracion { get; set; } = DateTime.UtcNow;
        public string Periodo { get; set; } = string.Empty;
        public EstadisticasEstudiantesDto Estudiantes { get; set; } = new EstadisticasEstudiantesDto();
        public EstadisticasDocentesDto Docentes { get; set; } = new EstadisticasDocentesDto();
        public EstadisticasCursosDto Cursos { get; set; } = new EstadisticasCursosDto();
        public EstadisticasSeccionesDto Secciones { get; set; } = new EstadisticasSeccionesDto();
    }

    public class EstadisticasEstudiantesDto
    {
        public int TotalActivos { get; set; }
        public int TotalInactivos { get; set; }
        public decimal PromedioGeneralEstudiantes { get; set; }
    }

    public class EstadisticasDocentesDto
    {
        public int TotalActivos { get; set; }
        public int TotalInactivos { get; set; }
        public decimal PromedioHorasSemanales { get; set; }
    }

    public class EstadisticasCursosDto
    {
        public int TotalActivos { get; set; }
        public int TotalInactivos { get; set; }
        public decimal PromedioCreditosPorCurso { get; set; }
    }

    public class EstadisticasSeccionesDto
    {
        public int TotalActivas { get; set; }
        public int TotalInactivas { get; set; }
        public decimal PromedioEstudiantesPorSeccion { get; set; }
        public decimal PorcentajeOcupacion { get; set; }
    }

    public class ReporteRankingEstudiantesDto
    {
        public string Periodo { get; set; } = string.Empty;
        public DateTime FechaGeneracion { get; set; } = DateTime.UtcNow;
        public List<EstudianteRankingDto> Ranking { get; set; } = new List<EstudianteRankingDto>();
    }

    public class EstudianteRankingDto
    {
        public int Posicion { get; set; }
        public string Matricula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public decimal PromedioGeneral { get; set; }
        public decimal PorcentajeAsistencia { get; set; }
        public int TotalCursosActuales { get; set; }
    }
}
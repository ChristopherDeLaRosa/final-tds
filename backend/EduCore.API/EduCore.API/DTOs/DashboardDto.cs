namespace EduCore.API.DTOs
{
    public class DashboardDto
    {
        public int TotalEstudiantes { get; set; }
        public AsistenciaDashboardDto? Asistencia { get; set; }
        public RendimientoDashboardDto? Rendimiento { get; set; }
    }

    public class AsistenciaDashboardDto
    {
        public int Total { get; set; }
        public int Presentes { get; set; }
        public decimal Porcentaje { get; set; }
    }

    public class RendimientoDashboardDto
    {
        public decimal PromedioGeneral { get; set; }
        public int Aprobadas { get; set; }
        public int Reprobadas { get; set; }
        public decimal PorcentajeAprobacion { get; set; }
    }

}

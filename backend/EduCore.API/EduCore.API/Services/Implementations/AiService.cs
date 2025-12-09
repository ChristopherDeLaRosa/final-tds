using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace EduCore.API.Services.Implementations
{
    public class AiService : IAiService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AiService> _logger;
        private readonly string _apiKey;

        private readonly IEstudianteService _estudianteService;
        private readonly ICalificacionService _calificacionService;
        private readonly IAsistenciaService _asistenciaService;

        public AiService(
            HttpClient httpClient,
            IConfiguration config,
            ILogger<AiService> logger,
            IEstudianteService estudianteService,
            ICalificacionService calificacionService,
            IAsistenciaService asistenciaService
        )
        {
            _httpClient = httpClient;
            _logger = logger;
            _apiKey = config["Groq:ApiKey"] ?? throw new Exception("Groq API Key no configurada");

            _estudianteService = estudianteService;
            _calificacionService = calificacionService;
            _asistenciaService = asistenciaService;
        }

        private int? ExtraerId(string prompt)
        {
            var match = Regex.Match(prompt, @"\b(\d{1,6})\b");
            return match.Success ? int.Parse(match.Value) : null;
        }

        private string? ExtraerMatricula(string prompt)
        {
            // Soporta ASCII '-' y Unicode '-' (non-breaking hyphen)
            var match = Regex.Match(prompt, @"\b\d{4}[--]\d{3}\b");

            if (!match.Success)
                return null;

            // Normalizar el guión a ASCII por si vino en Unicode
            var matricula = match.Value.Replace('-', '-');

            return matricula;
        }


        // Método corregido: detecta nombres de 1 o más palabras
        private string? ExtraerNombre(string prompt)
        {
            // Casos: "de Nicole", "de Juan", "de Juan Pérez"
            var match = Regex.Match(prompt, @"de\s+([a-zA-Záéíóúñ]+(?:\s+[a-zA-Záéíóúñ]+)*)");

            if (match.Success)
                return match.Groups[1].Value.Trim();

            return null;
        }

        private async Task<EstudianteDto?> BuscarPorNombre(string nombre)
        {
            var lista = await _estudianteService.GetAllAsync();
            var lower = nombre.ToLower();

            var exacto = lista.FirstOrDefault(e =>
                (e.Nombres + " " + e.Apellidos).ToLower() == lower
            );
            if (exacto != null) return exacto;

            var parcial = lista.FirstOrDefault(e =>
                e.Nombres.ToLower().Contains(lower) ||
                e.Apellidos.ToLower().Contains(lower)
            );
            return parcial;
        }

        public async Task<string> AskAsync(string prompt)
        {
            var p = prompt.ToLower();
            EstudianteDto? estudianteDetectado = null;

            var matricula = ExtraerMatricula(p);
            if (matricula != null)
            {
                estudianteDetectado = await _estudianteService.GetByMatriculaAsync(matricula);
            }

            if (estudianteDetectado == null)
            {
                var nombre = ExtraerNombre(p);
                if (!string.IsNullOrEmpty(nombre))
                {
                    estudianteDetectado = await BuscarPorNombre(nombre);
                }
            }

            if (estudianteDetectado != null)
            {
                p += $" {estudianteDetectado.Id}";
            }

            if (p.Contains("cuántos estudiantes") ||
                p.Contains("cuantos estudiantes") ||
                p.Contains("total de estudiantes") ||
                p.Contains("cantidad de estudiantes"))
            {
                var total = await _estudianteService.GetTotalAsync();
                return $"Actualmente hay {total} estudiantes registrados en el sistema.";
            }

            if (p.Contains("asistencia de") || p.Contains("como va la asistencia"))
            {
                var id = ExtraerId(p);
                if (id == null)
                    return "No se pudo identificar el estudiante.";

                var reporte = await _asistenciaService.GetReporteEstudianteAsync(id.Value);
                if (reporte == null)
                    return "No encontré datos de asistencia para ese estudiante.";

                return
                    $"Asistencia de {reporte.NombreCompleto}:\n" +
                    $"- Presentes: {reporte.Presentes}\n" +
                    $"- Ausentes: {reporte.Ausentes}\n" +
                    $"- Tardanzas: {reporte.Tardanzas}\n" +
                    $"- Justificados: {reporte.Justificados}\n" +
                    $"- Porcentaje general: {reporte.PorcentajeAsistencia}%";
            }

            if (p.Contains("promedio de") || p.Contains("promedio del estudiante"))
            {
                var id = ExtraerId(p);
                if (id == null)
                    return "No se pudo identificar el estudiante.";

                var historial = await _estudianteService.GetHistorialAsync(id.Value);
                if (historial == null)
                    return "No se encontró historial académico.";

                return
                    $"Promedio general de {historial.NombreCompleto}: {historial.PromedioGeneral}.\n" +
                    $"Aprobadas: {historial.TotalMateriasAprobadas}.\n" +
                    $"Reprobadas: {historial.TotalMateriasReprobadas}.\n" +
                    $"Asistencia general: {historial.PorcentajeAsistenciaGeneral}%";
            }

            if (p.Contains("estadísticas del grupo") ||
                p.Contains("estadisticas del grupo") ||
                p.Contains("rendimiento del grupo"))
            {
                var grupoId = ExtraerId(p);
                if (grupoId == null)
                    return "Debes incluir el ID del grupo.";

                var stats = await _calificacionService.GetEstadisticasGrupoCursoAsync(grupoId.Value);
                if (stats == null)
                    return "No se encontraron estadísticas para ese grupo.";

                return
                    $"Estadísticas del grupo {stats.NombreCurso}:\n" +
                    $"- Total estudiantes: {stats.TotalEstudiantes}\n" +
                    $"- Aprobados: {stats.Aprobados}\n" +
                    $"- Reprobados: {stats.Reprobados}\n" +
                    $"- Porcentaje de aprobación: {stats.PorcentajeAprobacion}%\n" +
                    $"- Promedio general del grupo: {stats.PromedioGrupo}\n" +
                    $"- Nota más alta: {stats.NotaMaxima}\n" +
                    $"- Nota más baja: {stats.NotaMinima}";
            }

            if (p.Contains("boletín de") || p.Contains("boletin de"))
            {
                var id = ExtraerId(p);
                if (id == null)
                    return "No se pudo identificar el estudiante.";

                var periodoMatch = Regex.Match(p, @"periodo\s+([\w-]+)");
                if (!periodoMatch.Success)
                    return "Debes especificar el periodo.";

                string periodo = periodoMatch.Groups[1].Value;

                var boletin = await _calificacionService.GetBoletinEstudianteAsync(id.Value, periodo);
                if (boletin == null)
                    return "No se encontró boletín para este periodo.";

                var listaCursos = string.Join("\n", boletin.GruposCursos.Select(g =>
                    $"{g.NombreCurso}: {g.PromedioFinal} ({g.Estado})"
                ));

                return
                    $"Boletín de {boletin.NombreCompleto} - Periodo {periodo}\n" +
                    $"Promedio general: {boletin.PromedioGeneral}\n" +
                    $"Aprobadas: {boletin.TotalMateriasAprobadas}\n" +
                    $"Reprobadas: {boletin.TotalMateriasReprobadas}\n" +
                    $"Asistencia: {boletin.PorcentajeAsistencia}%\n\n" +
                    "Materias:\n" + listaCursos;
            }

            return await EnviarAIA(prompt);
        }

        private async Task<string> EnviarAIA(string prompt)
        {
            var body = new
            {
                model = "llama-3.3-70b-versatile",
                messages = new[]
                {
                    new { role = "user", content = prompt }
                }
            };

            var json = JsonSerializer.Serialize(body);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _apiKey);

            try
            {
                var response = await _httpClient.PostAsync(
                    "https://api.groq.com/openai/v1/chat/completions",
                    content
                );

                var result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Groq API error: {Status} - {Body}", response.StatusCode, result);
                    return "Error al comunicarse con la IA.";
                }

                using var doc = JsonDocument.Parse(result);
                return doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? "";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en AiService.AskAsync");
                return "Error procesando la solicitud a la IA.";
            }
        }
    }
}

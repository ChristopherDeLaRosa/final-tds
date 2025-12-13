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
            // Patrón principal: YYYY-NNN (ej: 2024-001)
            var match = Regex.Match(prompt, @"\b(\d{4})[-–—]\s*(\d{3})\b");

            if (match.Success)
            {
                // Reconstruir con guión estándar
                return $"{match.Groups[1].Value}-{match.Groups[2].Value}";
            }

            // Patrón alternativo sin guión: YYYYNNN (ej: 2024001)
            var matchSinGuion = Regex.Match(prompt, @"\b(\d{4})(\d{3})\b");
            if (matchSinGuion.Success)
            {
                return $"{matchSinGuion.Groups[1].Value}-{matchSinGuion.Groups[2].Value}";
            }

            return null;
        }

        private string? ExtraerNombre(string prompt)
        {
            // Patrón más flexible que captura todo después de "de/del/de la"
            // Ejemplos: "de Juan Pérez", "del estudiante María González", "de la estudiante Ana López"
            var match = Regex.Match(prompt, @"de(?:\s+la?|\s+el)?\s+(?:estudiante\s+)?([a-zA-Záéíóúñü]+(?:\s+[a-zA-Záéíóúñü]+)+)", RegexOptions.IgnoreCase);

            if (match.Success)
                return match.Groups[1].Value.Trim();

            // Patrón alternativo: buscar nombres después de palabras clave
            // "asistencia María González", "promedio Juan Pérez López"
            var matchAlt = Regex.Match(prompt, @"(?:asistencia|promedio|calificaciones|notas|boletin|boletín)\s+(?:de\s+)?([a-zA-Záéíóúñü]+(?:\s+[a-zA-Záéíóúñü]+)+)", RegexOptions.IgnoreCase);

            if (matchAlt.Success)
                return matchAlt.Groups[1].Value.Trim();

            return null;
        }

        private async Task<EstudianteDto?> BuscarPorNombre(string nombre)
        {
            var lista = await _estudianteService.GetAllAsync();
            var lower = nombre.ToLower().Trim();

            // 1. Búsqueda exacta del nombre completo
            var exacto = lista.FirstOrDefault(e =>
                (e.Nombres + " " + e.Apellidos).ToLower().Trim() == lower
            );
            if (exacto != null) return exacto;

            // 2. Búsqueda exacta invertida (apellido nombre)
            var exactoInvertido = lista.FirstOrDefault(e =>
                (e.Apellidos + " " + e.Nombres).ToLower().Trim() == lower
            );
            if (exactoInvertido != null) return exactoInvertido;

            // 3. Búsqueda que contenga todas las palabras del nombre buscado
            var palabrasBuscadas = lower.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var contieneTodasPalabras = lista.FirstOrDefault(e =>
            {
                var nombreCompleto = (e.Nombres + " " + e.Apellidos).ToLower();
                return palabrasBuscadas.All(palabra => nombreCompleto.Contains(palabra));
            });
            if (contieneTodasPalabras != null) return contieneTodasPalabras;

            // 4. Búsqueda parcial en nombres
            var parcialNombres = lista.FirstOrDefault(e =>
                e.Nombres.ToLower().Contains(lower)
            );
            if (parcialNombres != null) return parcialNombres;

            // 5. Búsqueda parcial en apellidos
            var parcialApellidos = lista.FirstOrDefault(e =>
                e.Apellidos.ToLower().Contains(lower)
            );

            return parcialApellidos;
        }

        public async Task<string> AskAsync(string prompt)
        {
            var p = prompt.ToLower();
            EstudianteDto? estudianteDetectado = null;

            // Intentar extraer matrícula primero
            var matricula = ExtraerMatricula(prompt); // Usar prompt original, no lowercase
            if (matricula != null)
            {
                _logger.LogInformation("Matrícula detectada: {Matricula}", matricula);
                estudianteDetectado = await _estudianteService.GetByMatriculaAsync(matricula);

                if (estudianteDetectado != null)
                {
                    _logger.LogInformation("Estudiante encontrado por matrícula: {Id} - {Nombre}",
                        estudianteDetectado.Id,
                        estudianteDetectado.Nombres + " " + estudianteDetectado.Apellidos);
                }
                else
                {
                    _logger.LogWarning("No se encontró estudiante con matrícula: {Matricula}", matricula);
                }
            }

            // Si no se encontró por matrícula, intentar por nombre
            if (estudianteDetectado == null)
            {
                var nombre = ExtraerNombre(prompt); // Usar prompt original
                if (!string.IsNullOrEmpty(nombre))
                {
                    _logger.LogInformation("Nombre detectado: {Nombre}", nombre);
                    estudianteDetectado = await BuscarPorNombre(nombre);

                    if (estudianteDetectado != null)
                    {
                        _logger.LogInformation("Estudiante encontrado por nombre: {Id} - {Nombre}",
                            estudianteDetectado.Id,
                            estudianteDetectado.Nombres + " " + estudianteDetectado.Apellidos);
                    }
                    else
                    {
                        _logger.LogWarning("No se encontró estudiante con nombre: {Nombre}", nombre);
                    }
                }
            }

            // Agregar ID del estudiante al prompt si se encontró
            if (estudianteDetectado != null)
            {
                p += $" {estudianteDetectado.Id}";
                _logger.LogInformation("ID agregado al prompt: {Id}", estudianteDetectado.Id);
            }

            // 1. PREGUNTA: Total de estudiantes
            if (ContienePatron(p, new[] {
                "cuántos estudiantes",
                "cuantos estudiantes",
                "total de estudiantes",
                "cantidad de estudiantes",
                "número de estudiantes",
                "numero de estudiantes"
            }))
            {
                var total = await _estudianteService.GetTotalAsync();
                return $"📊 Actualmente hay **{total}** estudiantes registrados en el sistema.";
            }

            // 2. PREGUNTA: Asistencia de estudiante
            if (ContienePatron(p, new[] {
                "asistencia de",
                "como va la asistencia",
                "cómo va la asistencia",
                "asistencias de",
                "reporte de asistencia"
            }))
            {
                var id = ExtraerId(p);
                if (id == null)
                    return "❌ No pude identificar al estudiante. Por favor proporciona la matrícula, nombre o ID.";

                var reporte = await _asistenciaService.GetReporteEstudianteAsync(id.Value);
                if (reporte == null)
                    return "❌ No encontré datos de asistencia para ese estudiante.";

                return FormatearAsistencia(reporte);
            }

            // 3. PREGUNTA: Promedio/Calificaciones de estudiante
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

            // 4. PREGUNTA: Estadísticas del grupo
            if (ContienePatron(p, new[] {
                "estadísticas del grupo",
                "estadisticas del grupo",
                "rendimiento del grupo",
                "como va el grupo",
                "cómo va el grupo",
                "datos del grupo"
            }))
            {
                var grupoId = ExtraerId(p);
                if (grupoId == null)
                    return "❌ Por favor incluye el ID del grupo. Ejemplo: 'estadísticas del grupo 5'";

                var stats = await _calificacionService.GetEstadisticasGrupoCursoAsync(grupoId.Value);
                if (stats == null)
                    return "❌ No se encontraron estadísticas para ese grupo.";

                return FormatearEstadisticasGrupo(stats);
            }

            // 5. PREGUNTA: Boletín de estudiante
            if (ContienePatron(p, new[] {
                "boletín de",
                "boletin de",
                "reporte de notas",
                "calificaciones del periodo",
                "notas del periodo"
            }))
            {
                var id = ExtraerId(p);
                if (id == null)
                    return "❌ No pude identificar al estudiante. Por favor proporciona la matrícula, nombre o ID.";

                var periodoMatch = Regex.Match(p, @"periodo\s+([\w-]+)");
                if (!periodoMatch.Success)
                    return "❌ Debes especificar el periodo. Ejemplo: 'boletín de Juan periodo 2024-1'";

                string periodo = periodoMatch.Groups[1].Value;

                var boletin = await _calificacionService.GetBoletinEstudianteAsync(id.Value, periodo);
                if (boletin == null)
                    return "❌ No se encontró boletín para este periodo.";

                return FormatearBoletin(boletin, periodo);
            }

            // 6. PREGUNTA: Estudiantes con problemas de asistencia
            if (ContienePatron(p, new[] {
                "estudiantes con baja asistencia",
                "problemas de asistencia",
                "ausencias frecuentes",
                "quienes faltan más",
                "quiénes faltan más"
            }))
            {
                return await ObtenerEstudiantesBajaAsistencia();
            }

            // Si no coincide con ningún patrón, enviar a IA externa
            return await EnviarAIA(prompt);
        }

        // Helper: Verificar si contiene algún patrón
        private bool ContienePatron(string texto, string[] patrones)
        {
            return patrones.Any(p => texto.Contains(p));
        }

        // Formatear respuesta de asistencia
        private string FormatearAsistencia(ReporteAsistenciaEstudianteDto reporte)
        {
            var emoji = reporte.PorcentajeAsistencia >= 90 ? "✅" :
                        reporte.PorcentajeAsistencia >= 75 ? "⚠️" : "❌";

            return $@"📋 **Asistencia de {reporte.NombreCompleto}**
{emoji} Porcentaje general: **{reporte.PorcentajeAsistencia}%**

📊 Detalle:
   • Presentes: {reporte.Presentes}
   • Ausentes: {reporte.Ausentes}
   • Tardanzas: {reporte.Tardanzas}
   • Justificados: {reporte.Justificados}
   • Total sesiones: {reporte.TotalSesiones}";
        }

        // Formatear estadísticas del grupo
        private string FormatearEstadisticasGrupo(EstadisticasCalificacionesDto stats)
        {
            return $@"📊 **Estadísticas del grupo - {stats.NombreCurso}**

👥 Estudiantes:
   • Total: {stats.TotalEstudiantes}
   • Aprobados: {stats.Aprobados} ({stats.PorcentajeAprobacion}%)
   • Reprobados: {stats.Reprobados}

📈 Calificaciones:
   • Promedio del grupo: {stats.PromedioGrupo}
   • Nota más alta: {stats.NotaMaxima}
   • Nota más baja: {stats.NotaMinima}";
        }

        // Formatear boletín
        private string FormatearBoletin(BoletinEstudianteDto boletin, string periodo)
        {
            var emoji = boletin.PromedioGeneral >= 90 ? "🌟" :
                        boletin.PromedioGeneral >= 70 ? "✅" : "⚠️";

            var listaCursos = string.Join("\n", boletin.GruposCursos.Select(g =>
            {
                var estadoEmoji = g.Estado == "Aprobado" ? "✅" :
                                 g.Estado == "Reprobado" ? "❌" : "⏳";
                return $"   {estadoEmoji} {g.NombreCurso}: {g.PromedioFinal} ({g.Estado})";
            }));

            return $@"📋 **Boletín de {boletin.NombreCompleto}**
📅 Periodo: {periodo}
{emoji} Promedio general: **{boletin.PromedioGeneral}**

📚 Materias:
{listaCursos}

📊 Resumen:
   • Aprobadas: {boletin.TotalMateriasAprobadas}
   • Reprobadas: {boletin.TotalMateriasReprobadas}
   • Asistencia: {boletin.PorcentajeAsistencia}%";
        }

        // Nueva funcionalidad: Estudiantes con baja asistencia
        private async Task<string> ObtenerEstudiantesBajaAsistencia()
        {
            var estudiantes = await _estudianteService.GetAllAsync();
            var problemasAsistencia = new List<(string Nombre, decimal Porcentaje)>();

            foreach (var est in estudiantes.Take(100))
            {
                var reporte = await _asistenciaService.GetReporteEstudianteAsync(est.Id);
                if (reporte != null && reporte.PorcentajeAsistencia < 75)
                {
                    problemasAsistencia.Add((reporte.NombreCompleto, reporte.PorcentajeAsistencia));
                }
            }

            if (!problemasAsistencia.Any())
                return "✅ ¡Excelente! No hay estudiantes con problemas de asistencia (menos de 75%).";

            var lista = string.Join("\n", problemasAsistencia
                .OrderBy(p => p.Porcentaje)
                .Take(10)
                .Select((p, i) => $"   {i + 1}. {p.Nombre} - {p.Porcentaje}%")
            );

            return $@"⚠️ **Estudiantes con baja asistencia** (menos de 75%):
{lista}

Total: {problemasAsistencia.Count} estudiante(s)";
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

using EduCore.API.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace EduCore.API.Services.Implementations
{
    public class AiService : IAiService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AiService> _logger;
        private readonly string _apiKey;
        private readonly IEstudianteService _estudianteService;

        public AiService(HttpClient httpClient, IConfiguration config, ILogger<AiService> logger, IEstudianteService estudianteService)
        {
            _httpClient = httpClient;
            _logger = logger;
            _apiKey = config["Groq:ApiKey"] ?? throw new Exception("Groq API Key no configurada");
            _estudianteService = estudianteService;
        }

        public async Task<string> AskAsync(string prompt)
        {
            if (prompt.ToLower().Contains("cuántos estudiantes hay") ||
                prompt.ToLower().Contains("cuantos estudiantes hay") ||
                prompt.ToLower().Contains("cantidad de estudiantes") ||
                prompt.ToLower().Contains("total de estudiantes"))
            {
                var total = await _estudianteService.GetTotalAsync();
                return $"Actualmente hay {total} estudiantes registrados en el sistema.";
            }

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
                var message = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                return message ?? "";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en AiService.AskAsync");
                return "Error procesando la solicitud a la IA.";
            }
        }
    }
}

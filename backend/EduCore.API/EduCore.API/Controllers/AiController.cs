using EduCore.API.DTOs;
using EduCore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly IAiService _aiService;
        private readonly ILogger<AiController> _logger;

        public AiController(IAiService aiService, ILogger<AiController> logger)
        {
            _aiService = aiService;
            _logger = logger;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] AskAiDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Prompt))
                    return BadRequest(new { message = "Prompt requerido." });

                var respuesta = await _aiService.AskAsync(dto.Prompt);

                return Ok(new AiResponseDto
                {
                    Prompt = dto.Prompt,
                    Response = respuesta
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en AiController.Ask");
                return StatusCode(500, new { message = "Error procesando la solicitud de IA" });
            }
        }
    }
}

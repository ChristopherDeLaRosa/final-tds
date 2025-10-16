using System.Net;
using System.Text.Json;

namespace EduCore.API.Middleware
{
    public class ErrorHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlerMiddleware> _logger;

        public ErrorHandlerMiddleware(RequestDelegate next, ILogger<ErrorHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error no controlado: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var code = HttpStatusCode.InternalServerError;
            var result = string.Empty;

            switch (exception)
            {
                case NotFoundException notFoundException:
                    code = HttpStatusCode.NotFound;
                    result = JsonSerializer.Serialize(new
                    {
                        error = "No encontrado",
                        message = notFoundException.Message
                    });
                    break;

                case ConflictException conflictException:
                    code = HttpStatusCode.Conflict;
                    result = JsonSerializer.Serialize(new
                    {
                        error = "Conflicto",
                        message = conflictException.Message
                    });
                    break;

                case BadRequestException badRequestException:
                    code = HttpStatusCode.BadRequest;
                    result = JsonSerializer.Serialize(new
                    {
                        error = "Solicitud inválida",
                        message = badRequestException.Message
                    });
                    break;

                case UnauthorizedException unauthorizedException:
                    code = HttpStatusCode.Unauthorized;
                    result = JsonSerializer.Serialize(new
                    {
                        error = "No autorizado",
                        message = unauthorizedException.Message
                    });
                    break;

                case ForbiddenException forbiddenException:
                    code = HttpStatusCode.Forbidden;
                    result = JsonSerializer.Serialize(new
                    {
                        error = "Prohibido",
                        message = forbiddenException.Message
                    });
                    break;

                default:
                    result = JsonSerializer.Serialize(new
                    {
                        error = "Error interno del servidor",
                        message = "Ha ocurrido un error inesperado. Por favor, contacte al administrador."
                    });
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)code;
            return context.Response.WriteAsync(result);
        }
    }
}

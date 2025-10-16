namespace EduCore.API.Middleware
{
    public class AuditMiddleware
    {
        private readonly RequestDelegate _next;

        public AuditMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, Services.IAuditService auditService)
        {
            var path = context.Request.Path.Value ?? string.Empty;
            var method = context.Request.Method;

            // Solo auditar operaciones de modificación en rutas API
            if (path.StartsWith("/api/") && (method == "POST" || method == "PUT" || method == "DELETE"))
            {
                var originalBodyStream = context.Response.Body;
                using var responseBody = new MemoryStream();
                context.Response.Body = responseBody;

                await _next(context);

                // Solo registrar si la operación fue exitosa (2xx)
                if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 300)
                {
                    var userId = context.User?.FindFirst("UserId")?.Value;
                    if (int.TryParse(userId, out var parsedUserId))
                    {
                        var accion = $"{method} {path}";
                        var ip = context.Connection.RemoteIpAddress?.ToString();

                        await auditService.LogAsync(parsedUserId, accion, "Request", null, null, ip);
                    }
                }

                responseBody.Seek(0, SeekOrigin.Begin);
                await responseBody.CopyToAsync(originalBodyStream);
            }
            else
            {
                await _next(context);
            }
        }
    }
}

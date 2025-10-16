using EduCore.API.Data;
using EduCore.API.Models;
using EduCore.API.Services.Interfaces;

namespace EduCore.API.Services.Implementations
{
    public class AuditService : IAuditService
    {
        private readonly EduCoreDbContext _context;

        public AuditService(EduCoreDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(int userId, string accion, string entidad, int? entidadId, string? payloadJson, string? ip)
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                Accion = accion,
                Entidad = entidad,
                EntidadId = entidadId,
                PayloadJson = payloadJson,
                Ip = ip,
                CreatedAt = DateTime.UtcNow
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }
    }
}

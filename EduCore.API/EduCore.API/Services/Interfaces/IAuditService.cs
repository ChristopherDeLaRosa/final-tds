namespace EduCore.API.Services.Interfaces
{
    public interface IAuditService
    {
        Task LogAsync(int userId, string accion, string entidad, int? entidadId, string? payloadJson, string? ip);
    }
}

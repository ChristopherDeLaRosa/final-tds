namespace EduCore.API.Services.Interfaces
{
    public interface IAiService
    {
        Task<string> AskAsync(string prompt);
    }
}

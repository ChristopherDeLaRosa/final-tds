using EduCore.API.Services.Interfaces;

namespace EduCore.API.Services.Implementations
{
    public class TokenBlacklistService : ITokenBlacklistService
    {
        private readonly HashSet<string> _blacklist = new();
        private readonly object _lock = new();

        public void AddToBlacklist(string token)
        {
            lock (_lock)
            {
                _blacklist.Add(token);
            }
        }

        public bool IsBlacklisted(string token)
        {
            lock (_lock)
            {
                return _blacklist.Contains(token);
            }
        }
    }
}

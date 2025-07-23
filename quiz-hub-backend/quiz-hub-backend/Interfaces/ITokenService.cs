using quiz_hub_backend.Models;

namespace quiz_hub_backend.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}

using quiz_hub_backend.DTO;

namespace quiz_hub_backend.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginDTO loginDto);
        Task<AuthResponseDto> RegisterAsync(RegisterDTO registerDto);
        Task<bool> IsUsernameUniqueAsync(string username);
        Task<bool> IsEmailUniqueAsync(string email);
    }
}

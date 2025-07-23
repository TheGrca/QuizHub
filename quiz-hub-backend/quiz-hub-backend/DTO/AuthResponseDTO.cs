using quiz_hub_backend.Models;

namespace quiz_hub_backend.DTO
{
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public UserDto User { get; set; }
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string ProfilePictureBase64 { get; set; }
        public UserType Role { get; set; }
    }
}


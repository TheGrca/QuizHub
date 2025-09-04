using quiz_hub_backend.Models;
using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.DTO
{
    public class UserDTO
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string ProfilePicture { get; set; }
        public UserType isAdmin { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.Models
{
    public enum UserType
    {
        User = 0,
        Admin = 1
    }
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; }
        [Required]
        public byte[] Image { get; set; }

        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MaxLength(255)] 
        public string Password { get; set; }
        [Required]
        public UserType isAdmin { get; set; }

        public ICollection<UserQuizResult> QuizResults { get; set; }
    }
}

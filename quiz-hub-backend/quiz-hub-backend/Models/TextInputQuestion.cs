using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.Models
{
    public class TextInputQuestion : Question
    {
        [Required]
        [MaxLength(200)]
        public string CorrectAnswer { get; set; }
    }
}

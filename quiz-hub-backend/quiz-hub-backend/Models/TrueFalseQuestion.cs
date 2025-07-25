using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.Models
{
    public class TrueFalseQuestion : Question
    {
        [Required]
        public bool CorrectAnswer { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.Models
{
    public class MultipleAnswerQuestion : Question
    {
        [Required]
        [MaxLength(200)]
        public string Option1 { get; set; }

        [Required]
        [MaxLength(200)]
        public string Option2 { get; set; }

        [Required]
        [MaxLength(200)]
        public string Option3 { get; set; }

        [Required]
        [MaxLength(200)]
        public string Option4 { get; set; }

        [Required]
        [MaxLength(10)] 
        public string CorrectAnswerIndices { get; set; }
    }
}

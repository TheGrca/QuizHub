using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.DTO
{
    public class EditQuizDTO
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Required]
        public int Difficulty { get; set; }

        [Required]
        public int TimeLimitMinutes { get; set; }

        public List<EditQuestionDTO> Questions { get; set; } = new List<EditQuestionDTO>();
    }
}

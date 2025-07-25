using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.DTO
{
    public class CreateQuizDTO
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; }

        [Range(0, 2)]
        public int Difficulty { get; set; } // 1: Easy, 2: Medium, 3: Hard

        [Required]
        public int CategoryId { get; set; }

        [Range(1, 10)]
        public int TimeLimitMinutes { get; set; }

        public List<CreateQuestionDTO> Questions { get; set; } = new List<CreateQuestionDTO>();
    }
}

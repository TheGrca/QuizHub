using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.DTO
{
    public class EditQuestionDTO
    {
        public int? Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string Text { get; set; }

        [Required]
        public string QuestionType { get; set; }

        [Required]
        public int Points { get; set; } = 1;

        public string? Option1 { get; set; }
        public string? Option2 { get; set; }
        public string? Option3 { get; set; }
        public string? Option4 { get; set; }
        public int? CorrectAnswerIndex { get; set; }
        public string? CorrectAnswerIndices { get; set; }
        public bool? TrueFalseCorrectAnswer { get; set; }
        public string? CorrectAnswer { get; set; }
    }
}

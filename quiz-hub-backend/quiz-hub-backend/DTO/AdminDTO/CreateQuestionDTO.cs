using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.DTO
{
    public class CreateQuestionDTO
    {
        [Required]
        [StringLength(500)]
        public string Text { get; set; }

        [Required]
        public string QuestionType { get; set; } // SingleChoice, MultipleChoice, TrueFalse, TextInput

        [Range(1, 10)]
        public int Points { get; set; }

        // For Single Choice and Multiple Choice questions
        [StringLength(200)]
        public string? Option1 { get; set; }

        [StringLength(200)]
        public string? Option2 { get; set; }

        [StringLength(200)]
        public string? Option3 { get; set; }

        [StringLength(200)]
        public string? Option4 { get; set; }

        // For Single Choice questions
        public int? CorrectAnswerIndex { get; set; }

        // For Multiple Choice questions (comma-separated indices)
        [StringLength(10)]
        public string? CorrectAnswerIndices { get; set; }

        // For Text Input questions
        [StringLength(200)]
        public string? CorrectAnswer { get; set; }

        // For True/False questions
        public bool? TrueFalseCorrectAnswer { get; set; }
    }
}

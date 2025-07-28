namespace quiz_hub_backend.DTO
{
    public class QuestionEditDetailDTO
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public int Points { get; set; }
        public string QuestionType { get; set; }
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

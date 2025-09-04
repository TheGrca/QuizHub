namespace quiz_hub_backend.DTO
{
    public class LiveQuizQuestionDTO
    {
        public string Type { get; set; }
        public string Text { get; set; }
        public List<string>? Options { get; set; }
        public int? CorrectAnswer { get; set; }
        public List<object> CorrectAnswers { get; set; }
        public bool? CorrectAnswerBool { get; set; }
        public string? CorrectAnswerText { get; set; }
        public int TimeToAnswer { get; set; }
        public int Timer { get; internal set; }
    }
}

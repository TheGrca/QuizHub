namespace quiz_hub_backend.DTO
{
    public class UserQuizResultDetailDTO
    {
        public int ResultId { get; set; }
        public int QuizId { get; set; }
        public string QuizName { get; set; }
        public string Category { get; set; }
        public string Difficulty { get; set; }
        public int Score { get; set; }
        public int TotalPoints { get; set; }
        public int CorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }
        public double Percentage { get; set; }
        public string TimeTakenSeconds { get; set; }
        public DateTime CompletionDate { get; set; }
    }
}

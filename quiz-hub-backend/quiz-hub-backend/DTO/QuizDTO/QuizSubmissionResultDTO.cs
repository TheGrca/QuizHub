namespace quiz_hub_backend.DTO
{
    public class QuizSubmissionResultDTO
    {
        public int ResultId { get; set; }
        public int Score { get; set; }
        public double Percentage { get; set; }
        public int CorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }
    }
}

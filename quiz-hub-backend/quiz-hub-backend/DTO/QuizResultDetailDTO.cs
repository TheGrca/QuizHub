namespace quiz_hub_backend.DTO
{
    public class QuizResultDetailDTO
    {
        public int Id { get; set; }
        public int QuizId { get; set; }
        public string QuizName { get; set; }
        public int Score { get; set; }
        public int TotalPoints { get; set; }
        public double Percentage { get; set; }
        public int CorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }
        public int TimeTakenSeconds { get; set; }
        public DateTime CompletionDate { get; set; }
        public List<QuestionResultDTO> QuestionResults { get; set; } = new List<QuestionResultDTO>();
    }
}

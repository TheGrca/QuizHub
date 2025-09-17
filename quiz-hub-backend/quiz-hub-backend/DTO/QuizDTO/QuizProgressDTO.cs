namespace quiz_hub_backend.DTO
{
    public class QuizProgressDTO
    {
        public int AttemptNumber { get; set; }
        public int Score { get; set; }
        public int MaxPoints { get; set; }
        public double Percentage { get; set; }
        public DateTime Date { get; set; }
    }
}

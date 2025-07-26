namespace quiz_hub_backend.DTO
{
    public class UserStatsDTO
    {
        public int TotalQuizzes { get; set; }
        public double AverageScore { get; set; }
        public double BestScore { get; set; }
        public string TotalTimeSpent { get; set; }
    }
}

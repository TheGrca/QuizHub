namespace quiz_hub_backend.DTO
{
    public class UserStatsDTO
    {
        public int TotalQuizzes { get; set; }
        public double AverageScore { get; set; }
        public double AveragePercentage { get; set; }
        public double BestScore { get; set; }
        public double BestPercentage { get; set; }
        public string TotalTimeSpent { get; set; }
        public DateTime FirstQuizDate { get; set; }
        public DateTime LastQuizDate { get; set; }
    }
}

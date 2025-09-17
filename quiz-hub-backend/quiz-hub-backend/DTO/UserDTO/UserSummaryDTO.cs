namespace quiz_hub_backend.DTO
{
    public class UserSummaryDTO
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string ProfilePicture { get; set; }
        public int TotalQuizzesTaken { get; set; }
        public double AverageScore { get; set; }
        public DateTime LastQuizDate { get; set; }
    }
}

namespace quiz_hub_backend.DTO
{
    public class UserRankingDTO
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string ProfilePicture { get; set; } 
        public int Score { get; set; }
        public int TimeTakenSeconds { get; set; }
        public DateTime CompletionDate { get; set; }
        public int Rank { get; set; }
    }
}

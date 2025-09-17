namespace quiz_hub_backend.DTO
{
    public class LiveQuizParticipantDTO
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string ProfilePicture { get; set; }
        public DateTime JoinedAt { get; set; }
        public int Score { get; set; } = 0;
    }
}

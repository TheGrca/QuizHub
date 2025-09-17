namespace quiz_hub_backend.DTO
{
    public class UserDetailResultsDTO
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string ProfilePicture { get; set; }
        public List<UserQuizResultDetailDTO> QuizResults { get; set; } = new List<UserQuizResultDetailDTO>();
        public UserStatsDTO Stats { get; set; }
    }
}

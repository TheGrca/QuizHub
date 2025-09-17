namespace quiz_hub_backend.DTO
{
    public class QuizRankingsDTO
    {
        public QuizInfoDTO Quiz { get; set; }
        public List<UserRankingDTO> Rankings { get; set; } = new List<UserRankingDTO>();
    }
}

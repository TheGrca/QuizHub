namespace quiz_hub_backend.DTO
{
    public class MyQuizResultsDTO
    {
        public List<QuizResultSummaryDTO> Results { get; set; } = new List<QuizResultSummaryDTO>();
        public UserStatsDTO Stats { get; set; }
    }
}

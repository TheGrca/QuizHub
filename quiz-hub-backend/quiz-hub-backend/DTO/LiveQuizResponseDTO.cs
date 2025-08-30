namespace quiz_hub_backend.DTO
{
    public class LiveQuizResponseDTO
    {
        public LiveQuizDataDTO QuizData { get; set; }
        public List<LiveQuizQuestionDTO> Questions { get; set; }
        public string AdminId { get; set; }
        public long Timestamp { get; set; }
    }
}

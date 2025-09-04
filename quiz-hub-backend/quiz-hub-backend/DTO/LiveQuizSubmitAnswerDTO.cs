namespace quiz_hub_backend.DTO
{
    public class LiveQuizSubmitAnswerDTO
    {
        public string QuizId { get; set; }
        public List<object> Answer { get; set; } = new();
        public bool IsDoNotKnow { get; set; } = false;
    }
}

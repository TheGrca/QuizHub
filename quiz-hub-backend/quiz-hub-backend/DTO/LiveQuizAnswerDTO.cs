namespace quiz_hub_backend.DTO
{
    public class LiveQuizAnswerDTO
    {
        public int UserId { get; set; }
        public int QuestionIndex { get; set; }
        public List<object> Answer { get; set; }
        public DateTime AnsweredAt { get; set; }
        public int Points { get; set; }
        public bool IsDoNotKnow { get; set; }
    }
}

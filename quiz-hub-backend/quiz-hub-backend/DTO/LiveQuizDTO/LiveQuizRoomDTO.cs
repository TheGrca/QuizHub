namespace quiz_hub_backend.DTO
{

    public enum LiveQuizStatus
    {
        Waiting = 0,
        InProgress = 1,
        Completed = 2,
        Cancelled = 3
    }
    public class LiveQuizRoomDTO
    {
        public string QuizId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int AdminId { get; set; }
        public List<LiveQuizParticipantDTO> Participants { get; set; }
        public List<LiveQuizQuestionDTO> Questions { get; set; }
        public LiveQuizStatus Status { get; set; }
    }
}

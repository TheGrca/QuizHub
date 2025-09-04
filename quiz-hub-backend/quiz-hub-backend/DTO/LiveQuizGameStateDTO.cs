namespace quiz_hub_backend.DTO
{
    public class LiveQuizGameStateDTO
    {
        public string QuizId { get; set; }
        public LiveQuizStatus Status { get; set; }
        public int CurrentQuestionIndex { get; set; }
        public LiveQuizQuestionDTO CurrentQuestion { get; set; }
        public List<LiveQuizParticipantDTO> Participants { get; set; }
        public int TotalQuestions { get; set; }
        public DateTime? QuestionStartTime { get; set; }
        public bool UserHasAnswered { get; set; }
    }
}

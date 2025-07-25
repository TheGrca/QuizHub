namespace quiz_hub_backend.DTO
{
    public class QuizSubmissionDTO
    {
        public int QuizId { get; set; }
        public int TimeTakenSeconds { get; set; }
        public List<UserAnswerSubmissionDTO> UserAnswers { get; set; }
    }
}

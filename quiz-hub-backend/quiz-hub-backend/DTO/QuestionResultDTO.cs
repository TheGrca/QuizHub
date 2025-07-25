namespace quiz_hub_backend.DTO
{
    public class QuestionResultDTO
    {
        public QuestionResponseDTO Question { get; set; }
        public UserAnswerDetailDTO UserAnswer { get; set; }
        public bool IsCorrect { get; set; }
        public int PointsEarned { get; set; }
    }
}

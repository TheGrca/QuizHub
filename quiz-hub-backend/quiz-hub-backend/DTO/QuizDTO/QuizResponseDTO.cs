namespace quiz_hub_backend.DTO
{
    public class QuizResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int NumberOfQuestions { get; set; }
        public string Difficulty { get; set; }
        public int TimeLimitMinutes { get; set; }
        public string CategoryName { get; set; }
        public List<QuestionResponseDTO> Questions { get; set; } = new List<QuestionResponseDTO>();
    }
}

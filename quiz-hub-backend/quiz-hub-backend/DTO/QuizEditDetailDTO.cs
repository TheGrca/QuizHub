namespace quiz_hub_backend.DTO
{
    public class QuizEditDetailDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public int Difficulty { get; set; }
        public string DifficultyName { get; set; }
        public int TimeLimitMinutes { get; set; }
        public int NumberOfQuestions { get; set; }
        public List<QuestionEditDetailDTO> Questions { get; set; } = new List<QuestionEditDetailDTO>();
    }
}

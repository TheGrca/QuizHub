namespace quiz_hub_backend.DTO
{
    public class QuizInfoDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string Difficulty { get; set; }
        public int NumberOfQuestions { get; set; }
        public int TimeLimitMinutes { get; set; }
    }
}

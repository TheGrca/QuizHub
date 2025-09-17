namespace quiz_hub_backend.DTO
{
    public class QuizListDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string Difficulty { get; set; }
        public int NumberOfQuestions { get; set; }
        public int TimeToFinish { get; set; }
    }
}

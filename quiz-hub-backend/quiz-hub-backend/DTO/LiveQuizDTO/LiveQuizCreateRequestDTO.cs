namespace quiz_hub_backend.DTO
{
    public class LiveQuizCreateRequestDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public List<LiveQuizQuestionDTO> Questions { get; set; }
    }
}

using System.Text.Json.Serialization;

namespace quiz_hub_backend.DTO
{
    public class LiveQuizCreateDTO
    {
        [JsonPropertyName("quizData")]
        public LiveQuizDataDTO QuizData { get; set; }
        [JsonPropertyName("questions")]
        public List<LiveQuizQuestionDTO> Questions { get; set; }
        [JsonPropertyName("adminId")]
        public string AdminId { get; set; }
    }
}

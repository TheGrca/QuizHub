using System.Text.Json.Serialization;

namespace quiz_hub_backend.DTO
{
    public class LiveQuizRoomStateDTO
    {
        [JsonPropertyName("quizData")]
        public LiveQuizDataDTO QuizData { get; set; }

        [JsonPropertyName("participants")]
        public List<LiveQuizRoomParticipantDTO> Participants { get; set; }

        [JsonPropertyName("maxParticipants")]
        public int MaxParticipants { get; set; } = 4;
    }
}

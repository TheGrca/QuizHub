using System.Text.Json.Serialization;

namespace quiz_hub_backend.DTO
{
    public class LiveJoinQuizRoomDTO
    {
        [JsonPropertyName("userId")]
        public string UserId { get; set; }

        [JsonPropertyName("username")]
        public string Username { get; set; }

        [JsonPropertyName("profilePicture")]
        public string? ProfilePicture { get; set; }

        [JsonPropertyName("isAdmin")]
        public bool IsAdmin { get; set; }
    }
}

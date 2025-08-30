using System.Text.Json.Serialization;

namespace quiz_hub_backend.DTO
{
    public class LiveUserConnectedDTO
    {
        [JsonPropertyName("userId")]
        public string UserId { get; set; }

        [JsonPropertyName("username")]
        public string Username { get; set; }
    }
}

using System.Text.Json.Serialization;
using System.Text.Json;

namespace quiz_hub_backend.DTO
{
    public class WebSocketMessageDTO
    {
        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("payload")]
        public JsonElement Payload { get; set; }
    }
}

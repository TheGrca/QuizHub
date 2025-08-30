using System.Text.Json.Serialization;

namespace quiz_hub_backend.DTO
{
    public class LiveQuizDataDTO
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("categoryId")]
        public string CategoryId { get; set; }
    }
}

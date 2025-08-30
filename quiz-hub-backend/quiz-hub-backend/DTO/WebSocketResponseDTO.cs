namespace quiz_hub_backend.DTO
{
    public class WebSocketResponseDTO
    {
        public string Type { get; set; }
        public LiveQuizResponseDTO? Payload { get; set; }
    }
}

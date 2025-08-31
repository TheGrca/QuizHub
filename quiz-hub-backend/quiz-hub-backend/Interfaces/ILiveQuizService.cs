using quiz_hub_backend.DTO;
using System.Net.WebSockets;

namespace quiz_hub_backend.Interfaces
{
    public interface ILiveQuizService
    {
        Task HandleUserConnected(string userId, string username, WebSocket webSocket);
        Task HandleLiveQuizCreated(LiveQuizCreateDTO liveQuizData);
        Task HandleLiveQuizEnded();
        Task DisconnectUser(string userId);
        LiveQuizResponseDTO? GetCurrentLiveQuiz();
        Task HandleUserJoinedRoom(LiveJoinQuizRoomDTO participant, WebSocket webSocket);
        Task HandleUserLeftRoom(string userId);
        Task HandleStopQuiz(string adminId);
        LiveQuizRoomStateDTO? GetCurrentRoomState();
    }
}

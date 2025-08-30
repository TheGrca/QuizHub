using quiz_hub_backend.DTO;
using quiz_hub_backend.Interfaces;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text.Json;
using System.Text;

namespace quiz_hub_backend.Services
{
    public class LiveQuizService : ILiveQuizService
    {
        private static readonly ConcurrentDictionary<string, WebSocket> _connectedUsers = new();
        private static LiveQuizResponseDTO? _currentLiveQuiz = null;

        public async Task HandleUserConnected(string userId, string username, WebSocket webSocket)
        {
            _connectedUsers[userId] = webSocket;

            // Send current live quiz if exists
            if (_currentLiveQuiz != null)
            {
                await SendMessage(webSocket, new WebSocketResponseDTO
                {
                    Type = "LIVE_QUIZ_CREATED",
                    Payload = _currentLiveQuiz
                });
            }
        }

        public async Task HandleLiveQuizCreated(LiveQuizCreateDTO liveQuizData)
        {
            _currentLiveQuiz = new LiveQuizResponseDTO
            {
                QuizData = liveQuizData.QuizData,
                Questions = liveQuizData.Questions,
                AdminId = liveQuizData.AdminId,
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };

            await BroadcastToAllUsers(new WebSocketResponseDTO
            {
                Type = "LIVE_QUIZ_CREATED",
                Payload = _currentLiveQuiz
            });
        }

        public async Task HandleLiveQuizEnded()
        {
            _currentLiveQuiz = null;
            await BroadcastToAllUsers(new WebSocketResponseDTO
            {
                Type = "LIVE_QUIZ_ENDED"
            });
        }

        public async Task DisconnectUser(string userId)
        {
            _connectedUsers.TryRemove(userId, out _);
        }

        public LiveQuizResponseDTO? GetCurrentLiveQuiz()
        {
            return _currentLiveQuiz;
        }

        private async Task BroadcastToAllUsers(WebSocketResponseDTO message)
        {
            var messageJson = JsonSerializer.Serialize(message);
            var messageBytes = Encoding.UTF8.GetBytes(messageJson);

            var tasks = _connectedUsers.Values
                .Where(ws => ws.State == WebSocketState.Open)
                .Select(ws => ws.SendAsync(new ArraySegment<byte>(messageBytes), WebSocketMessageType.Text, true, CancellationToken.None));

            await Task.WhenAll(tasks);
        }

        private async Task SendMessage(WebSocket webSocket, WebSocketResponseDTO message)
        {
            if (webSocket.State == WebSocketState.Open)
            {
                var messageJson = JsonSerializer.Serialize(message);
                var messageBytes = Encoding.UTF8.GetBytes(messageJson);
                await webSocket.SendAsync(new ArraySegment<byte>(messageBytes), WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
    }
}

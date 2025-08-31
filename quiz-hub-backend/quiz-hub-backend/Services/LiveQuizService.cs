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
        private static readonly ConcurrentDictionary<string, LiveQuizRoomParticipantDTO> _roomParticipants = new();

        public async Task HandleUserConnected(string userId, string username, WebSocket webSocket)
        {
            _connectedUsers[userId] = webSocket;

            // Send current live quiz if exists
            if (_currentLiveQuiz != null)
            {
                await SendMessage(webSocket, new
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

            await BroadcastToAllUsers(new
            {
                Type = "LIVE_QUIZ_CREATED",
                Payload = _currentLiveQuiz
            });
        }

        public async Task HandleLiveQuizEnded()
        {
            _currentLiveQuiz = null;
            await BroadcastToAllUsers(new
            {
                Type = "LIVE_QUIZ_ENDED"
            });
        }

        public async Task DisconnectUser(string userId)
        {
            _connectedUsers.TryRemove(userId, out _);

            // Also remove from room participants if they were in a room
            if (_roomParticipants.ContainsKey(userId))
            {
                await HandleUserLeftRoom(userId);
            }
        }

        public LiveQuizResponseDTO? GetCurrentLiveQuiz()
        {
            return _currentLiveQuiz;
        }

        public async Task HandleUserJoinedRoom(LiveJoinQuizRoomDTO participant, WebSocket webSocket)
        {
            // Check if room is full
            if (_roomParticipants.Count >= 4)
            {
                await SendMessage(webSocket, new
                {
                    Type = "ROOM_FULL",
                    Payload = new { Message = "Quiz room is full" }
                });
                return;
            }

            // Add user to room participants
            _roomParticipants[participant.UserId] = new LiveQuizRoomParticipantDTO
            {
                UserId = participant.UserId,
                Username = participant.Username,
                ProfilePicture = participant.ProfilePicture,
                IsAdmin = participant.IsAdmin
            };

            // Add to connected users
            _connectedUsers[participant.UserId] = webSocket;

            // Send simplified room state (without full question details)
            var simplifiedRoomState = GetSimplifiedRoomState();
            if (simplifiedRoomState != null)
            {
                await SendMessage(webSocket, new
                {
                    Type = "QUIZ_ROOM_STATE",
                    Payload = simplifiedRoomState
                });
            }

            // Notify other participants that someone joined
            await BroadcastToRoomParticipants(new
            {
                Type = "USER_JOINED_ROOM",
                Payload = new LiveQuizRoomParticipantDTO
                {
                    UserId = participant.UserId,
                    Username = participant.Username,
                    ProfilePicture = participant.ProfilePicture,
                    IsAdmin = participant.IsAdmin
                }
            }, participant.UserId);
        }

        private object? GetSimplifiedRoomState()
        {
            if (_currentLiveQuiz == null) return null;

            return new
            {
                QuizData = new
                {
                    Name = _currentLiveQuiz.QuizData.Name,
                    Description = _currentLiveQuiz.QuizData.Description,
                    QuestionCount = _currentLiveQuiz.Questions.Count
                },
                Participants = _roomParticipants.Values.ToList(),
                MaxParticipants = 4
            };
        }

        public async Task HandleUserLeftRoom(string userId)
        {
            if (_roomParticipants.TryRemove(userId, out var participant))
            {
                _connectedUsers.TryRemove(userId, out _);

                // Notify other participants
                await BroadcastToRoomParticipants(new
                {
                    Type = "USER_LEFT_ROOM",
                    Payload = participant
                });
            }
        }

        public async Task HandleStopQuiz(string adminId)
        {
            // Verify it's an admin stopping the quiz
            if (_roomParticipants.TryGetValue(adminId, out var admin) && admin.IsAdmin)
            {
                // Clear current quiz
                _currentLiveQuiz = null;

                // Notify all participants that quiz was stopped
                await BroadcastToRoomParticipants(new
                {
                    Type = "QUIZ_STOPPED"
                });

                // Clear all participants
                _roomParticipants.Clear();
            }
        }

        public LiveQuizRoomStateDTO? GetCurrentRoomState()
        {
            if (_currentLiveQuiz == null) return null;

            return new LiveQuizRoomStateDTO
            {
                QuizData = _currentLiveQuiz.QuizData,
                Participants = _roomParticipants.Values.ToList(),
                MaxParticipants = 4
            };
        }

        public int GetConnectedUsersCount()
        {
            return _connectedUsers.Count(ws => ws.Value.State == WebSocketState.Open);
        }

        public int GetRoomParticipantsCount()
        {
            return _roomParticipants.Count;
        }

        private async Task BroadcastToAllUsers(object message)
        {
            var messageJson = JsonSerializer.Serialize(message);
            var messageBytes = Encoding.UTF8.GetBytes(messageJson);

            var tasks = _connectedUsers.Values
                .Where(ws => ws.State == WebSocketState.Open)
                .Select(ws => ws.SendAsync(new ArraySegment<byte>(messageBytes), WebSocketMessageType.Text, true, CancellationToken.None));

            await Task.WhenAll(tasks);
        }

        private async Task BroadcastToRoomParticipants(object message, string? excludeUserId = null)
        {
            var messageJson = JsonSerializer.Serialize(message);
            var messageBytes = Encoding.UTF8.GetBytes(messageJson);

            var tasks = _roomParticipants.Keys
                .Where(userId => userId != excludeUserId && _connectedUsers.ContainsKey(userId) && _connectedUsers[userId].State == WebSocketState.Open)
                .Select(userId => _connectedUsers[userId].SendAsync(new ArraySegment<byte>(messageBytes), WebSocketMessageType.Text, true, CancellationToken.None));

            await Task.WhenAll(tasks);
        }

        private async Task SendMessage(WebSocket webSocket, object message)
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
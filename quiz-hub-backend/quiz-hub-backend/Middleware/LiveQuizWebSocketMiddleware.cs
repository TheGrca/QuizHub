using quiz_hub_backend.DTO;
using quiz_hub_backend.Interfaces;
using System.Net.WebSockets;
using System.Text.Json;
using System.Text;
using System.Collections.Concurrent;

namespace quiz_hub_backend.Middleware
{
    public class LiveQuizWebSocketMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<LiveQuizWebSocketMiddleware> _logger;
        private readonly IServiceProvider _serviceProvider;

        // Store all WebSocket connections
        private static readonly ConcurrentDictionary<string, WebSocketConnection> _connections = new();

        public LiveQuizWebSocketMiddleware(RequestDelegate next, ILogger<LiveQuizWebSocketMiddleware> logger, IServiceProvider serviceProvider)
        {
            _next = next;
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Path == "/ws")
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                    var connectionId = Guid.NewGuid().ToString();

                    _logger.LogInformation($"WebSocket connection established: {connectionId}");

                    await HandleWebSocketConnection(connectionId, webSocket);
                }
                else
                {
                    context.Response.StatusCode = 400;
                }
            }
            else
            {
                await _next(context);
            }
        }

        private async Task HandleWebSocketConnection(string connectionId, WebSocket webSocket)
        {
            var connection = new WebSocketConnection
            {
                Id = connectionId,
                WebSocket = webSocket,
                ConnectedAt = DateTime.UtcNow
            };

            _connections.TryAdd(connectionId, connection);

            try
            {
                var buffer = new byte[4096];

                while (webSocket.State == WebSocketState.Open)
                {
                    var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        break;
                    }

                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        await HandleWebSocketMessage(connectionId, message);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"WebSocket error for connection {connectionId}: {ex.Message}");
            }
            finally
            {
                _connections.TryRemove(connectionId, out _);

                if (connection.UserId.HasValue)
                {
                    await HandleUserDisconnection(connection.UserId.Value);
                }

                if (webSocket.State == WebSocketState.Open || webSocket.State == WebSocketState.CloseReceived)
                {
                    try
                    {
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Connection closed", CancellationToken.None);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"Error closing WebSocket {connectionId}: {ex.Message}");
                    }
                }

                _logger.LogInformation($"WebSocket connection closed: {connectionId}");
            }
        }

        private async Task HandleWebSocketMessage(string connectionId, string message)
        {
            try
            {
                var messageData = JsonSerializer.Deserialize<LiveQuizWebSocketMessageDTO>(message, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                _logger.LogInformation($"WebSocket message received from {connectionId}: {messageData.Type}");

                using var scope = _serviceProvider.CreateScope();
                var liveQuizService = scope.ServiceProvider.GetRequiredService<ILiveQuizService>();

                switch (messageData.Type)
                {
                    case "USER_CONNECTED":
                        await HandleUserConnected(connectionId, messageData.Payload, liveQuizService);
                        break;

                    case "LIVE_QUIZ_CREATED":
                        await HandleLiveQuizCreated(connectionId, messageData.Payload, liveQuizService);
                        break;

                    case "USER_JOINED_QUIZ":
                        await HandleUserJoinedQuiz(connectionId, messageData.Payload, liveQuizService);
                        break;

                    case "USER_LEFT_QUIZ":
                        await HandleUserLeftQuiz(connectionId, messageData.Payload, liveQuizService);
                        break;

                    case "QUIZ_CANCELLED":
                        await HandleQuizCancelled(connectionId, messageData.Payload, liveQuizService);
                        break;

                    default:
                        _logger.LogWarning($"Unknown message type: {messageData.Type}");
                        break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error handling WebSocket message from {connectionId}: {ex.Message}");
            }
        }

        private async Task HandleUserConnected(string connectionId, object payload, ILiveQuizService liveQuizService)
        {
            try
            {
                var userData = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(payload));
                var userId = userData.GetProperty("userId").GetString();
                var username = userData.GetProperty("username").GetString();

                if (_connections.TryGetValue(connectionId, out var connection))
                {
                    connection.UserId = int.Parse(userId);
                    connection.Username = username;
                }

                _logger.LogInformation($"User connected: {username} ({userId})");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error handling user connected: {ex.Message}");
            }
        }

        private async Task HandleLiveQuizCreated(string connectionId, object payload, ILiveQuizService liveQuizService)
        {
            try
            {
                // Broadcast live quiz creation to all connected users (except admin)
                var message = new LiveQuizWebSocketMessageDTO
                {
                    Type = "LIVE_QUIZ_CREATED",
                    Payload = payload
                };

                await BroadcastToAll(message, excludeConnectionId: connectionId);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error handling live quiz created: {ex.Message}");
            }
        }

        private async Task HandleUserJoinedQuiz(string connectionId, object payload, ILiveQuizService liveQuizService)
        {
            try
            {
                var joinData = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(payload));
                var quizId = joinData.GetProperty("quizId").GetString();

                // Get updated participants list with FULL participant data
                var participants = await liveQuizService.GetParticipantsAsync(quizId);

                Console.WriteLine($"Participants count: {participants.Count}");
                foreach (var p in participants)
                {
                    Console.WriteLine($"Participant: {p.Username}, ProfilePicture: {p.ProfilePicture?.Length ?? 0} chars");
                }

                var message = new LiveQuizWebSocketMessageDTO
                {
                    Type = "PARTICIPANTS_UPDATED",
                    Payload = new Dictionary<string, object>
                    {
                        ["quizId"] = quizId,
                        ["participants"] = participants.Select(p => new Dictionary<string, object>
                        {
                            ["userId"] = p.UserId,
                            ["username"] = p.Username ?? "",
                            ["profilePicture"] = p.ProfilePicture ?? "",
                            ["joinedAt"] = p.JoinedAt.ToString("O")
                        }).ToList()
                    }
                };

                Console.WriteLine("=== MESSAGE PAYLOAD ===");
                Console.WriteLine(JsonSerializer.Serialize(message, new JsonSerializerOptions { WriteIndented = true }));

                await BroadcastToQuizRoom(message, quizId, liveQuizService);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error handling user joined quiz: {ex.Message}");
            }
        }

        private async Task HandleUserLeftQuiz(string connectionId, object payload, ILiveQuizService liveQuizService)
        {
            try
            {
                var leaveData = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(payload));
                var quizId = leaveData.GetProperty("quizId").GetString();
                var userId = leaveData.GetProperty("userId").GetInt32();
                // Get updated participants list
                var participants = await liveQuizService.GetParticipantsAsync(quizId);
                Console.WriteLine($"User {userId} left quiz {quizId}. Remaining participants: {participants.Count}");
                var message = new LiveQuizWebSocketMessageDTO
                {
                    Type = "PARTICIPANTS_UPDATED",
                    Payload = new Dictionary<string, object>
                    {
                        ["quizId"] = quizId,
                        ["participants"] = participants.Select(p => new Dictionary<string, object>
                        {
                            ["userId"] = p.UserId,
                            ["username"] = p.Username ?? "",
                            ["profilePicture"] = p.ProfilePicture ?? "",
                            ["joinedAt"] = p.JoinedAt.ToString("O")
                        }).ToList()
                    }
                };

                await BroadcastToQuizRoom(message, quizId, liveQuizService);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error handling user left quiz: {ex.Message}");
            }
        }

        private async Task HandleQuizCancelled(string connectionId, object payload, ILiveQuizService liveQuizService)
        {
            try
            {
                var cancelData = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(payload));
                var quizId = cancelData.GetProperty("quizId").GetString();

                var message = new LiveQuizWebSocketMessageDTO
                {
                    Type = "QUIZ_CANCELLED",
                    Payload = new
                    {
                        quizId = quizId,
                        message = "The quiz has been cancelled by the admin"
                    }
                };

                // Broadcast to all connections in the quiz room
                await BroadcastToAll(message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error handling quiz cancelled: {ex.Message}");
            }
        }

        private async Task HandleUserDisconnection(int userId)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var liveQuizService = scope.ServiceProvider.GetRequiredService<ILiveQuizService>();

                // Note: In a real implementation, you might want to track which quiz the user was in
                // and automatically remove them from the quiz when they disconnect

                _logger.LogInformation($"User {userId} disconnected");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error handling user disconnection: {ex.Message}");
            }
        }

        public static async Task BroadcastToAll(object payload, string excludeConnectionId = null)
        {
            var messageJson = JsonSerializer.Serialize(payload);
            var messageBuffer = Encoding.UTF8.GetBytes(messageJson);

            var tasks = _connections.Values
                .Where(conn => conn.Id != excludeConnectionId && conn.WebSocket.State == WebSocketState.Open)
                .Select(async conn =>
                {
                    try
                    {
                        await conn.WebSocket.SendAsync(
                            new ArraySegment<byte>(messageBuffer),
                            WebSocketMessageType.Text,
                            true,
                            CancellationToken.None
                        );
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error sending message to connection {conn.Id}: {ex.Message}");
                    }
                });

            await Task.WhenAll(tasks);
        }

        private async Task BroadcastToQuizRoom(LiveQuizWebSocketMessageDTO message, string quizId, ILiveQuizService liveQuizService)
        {
            try
            {

                var quizRoom = await liveQuizService.GetLiveQuizRoomInternalAsync(quizId);
                var targetUserIds = new HashSet<int> { quizRoom.AdminId };
                if (message.Payload is JsonElement element && element.TryGetProperty("participants", out var participantsElement))
                {
                    foreach (var participant in participantsElement.EnumerateArray())
                    {
                        if (participant.TryGetProperty("userId", out var userIdElement) && userIdElement.TryGetInt32(out var userId))
                        {
                            targetUserIds.Add(userId);
                        }
                    }
                }

                var messageJson = JsonSerializer.Serialize(message);
                var messageBuffer = Encoding.UTF8.GetBytes(messageJson);

                var tasks = _connections.Values
                    .Where(conn => conn.UserId.HasValue &&
                                  targetUserIds.Contains(conn.UserId.Value) &&
                                  conn.WebSocket.State == WebSocketState.Open)
                    .Select(async conn =>
                    {
                        try
                        {
                            await conn.WebSocket.SendAsync(
                                new ArraySegment<byte>(messageBuffer),
                                WebSocketMessageType.Text,
                                true,
                                CancellationToken.None
                            );
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Error sending message to connection {conn.Id}: {ex.Message}");
                        }
                    });

                await Task.WhenAll(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error broadcasting to quiz room {quizId}: {ex.Message}");
            }
        }

        public static async Task BroadcastLiveQuizCreated(object payload)
        {
            var message = new LiveQuizWebSocketMessageDTO
            {
                Type = "LIVE_QUIZ_CREATED",
                Payload = payload
            };

            var messageJson = JsonSerializer.Serialize(message);
            var messageBuffer = Encoding.UTF8.GetBytes(messageJson);

            var tasks = _connections.Values
                .Where(conn => conn.WebSocket.State == WebSocketState.Open)
                .Select(async conn =>
                {
                    try
                    {
                        await conn.WebSocket.SendAsync(
                            new ArraySegment<byte>(messageBuffer),
                            WebSocketMessageType.Text,
                            true,
                            CancellationToken.None
                        );
                    }
                    catch (Exception ex)
                    {
                        // Log error but continue with other connections
                        Console.WriteLine($"Error sending message to connection {conn.Id}: {ex.Message}");
                    }
                });

            await Task.WhenAll(tasks);
        }
    }

    public class WebSocketConnection
    {
        public string Id { get; set; }
        public WebSocket WebSocket { get; set; }
        public int? UserId { get; set; }
        public string Username { get; set; }
        public DateTime ConnectedAt { get; set; }
    }
}

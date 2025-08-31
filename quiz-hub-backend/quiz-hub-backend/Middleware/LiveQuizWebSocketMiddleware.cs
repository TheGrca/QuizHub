using quiz_hub_backend.DTO;
using quiz_hub_backend.Interfaces;
using System.Net.WebSockets;
using System.Text.Json;
using System.Text;

public class LiveQuizWebSocketMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILiveQuizService _liveQuizService;

    public LiveQuizWebSocketMiddleware(RequestDelegate next, ILiveQuizService liveQuizService)
    {
        _next = next;
        _liveQuizService = liveQuizService;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path == "/ws" && context.WebSockets.IsWebSocketRequest)
        {
            var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            await HandleWebSocketConnection(webSocket);
        }
        else
        {
            await _next(context);
        }
    }

    private async Task HandleWebSocketConnection(WebSocket webSocket)
    {
        var buffer = new byte[1024 * 4]; // Back to 4KB buffer
        string? userId = null;
        var messageBuilder = new StringBuilder();

        try
        {
            while (webSocket.State == WebSocketState.Open)
            {
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Text)
                {
                    var partialMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    messageBuilder.Append(partialMessage);

                    // Check if this is the end of the message
                    if (result.EndOfMessage)
                    {
                        var completeMessage = messageBuilder.ToString();
                        messageBuilder.Clear();

                        try
                        {
                            var data = JsonSerializer.Deserialize<WebSocketMessageDTO>(completeMessage);
                            await HandleMessage(data, webSocket, userId); // Note: ref userId
                        }
                        catch (JsonException ex)
                        {
                            Console.WriteLine($"JSON parsing error: {ex.Message}");
                            Console.WriteLine($"Message length: {completeMessage.Length}");
                            Console.WriteLine($"First 200 chars: {completeMessage.Substring(0, Math.Min(200, completeMessage.Length))}");
                            // Send error back to client
                            await SendErrorMessage(webSocket, "Invalid message format");
                        }
                    }
                }
                else if (result.MessageType == WebSocketMessageType.Close)
                {
                    break;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"WebSocket error: {ex.Message}");
        }
        finally
        {
            if (userId != null)
            {
                await _liveQuizService.DisconnectUser(userId);
            }
            if (webSocket.State != WebSocketState.Closed)
            {
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Connection closed", CancellationToken.None);
            }
        }
    }

    private async Task SendErrorMessage(WebSocket webSocket, string errorMessage)
    {
        if (webSocket.State == WebSocketState.Open)
        {
            var error = new { Type = "ERROR", Payload = new { Message = errorMessage } };
            var errorJson = JsonSerializer.Serialize(error);
            var errorBytes = Encoding.UTF8.GetBytes(errorJson);
            await webSocket.SendAsync(new ArraySegment<byte>(errorBytes), WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }
    private async Task HandleMessage(WebSocketMessageDTO? data, WebSocket webSocket, string? userId)
    {
        if (data?.Payload == null) return;

        var payloadJson = JsonSerializer.Serialize(data.Payload);

        switch (data.Type)
        {
            case "USER_CONNECTED":
                var userConnected = data.Payload.Deserialize<LiveUserConnectedDTO>();
                if (userConnected != null)
                {
                    userId = userConnected.UserId;
                    Console.WriteLine($"User {userConnected.Username} connected");

                    await _liveQuizService.HandleUserConnected(userId, userConnected.Username, webSocket);

                    // Check if there's a current live quiz and send it
                    var currentQuiz = _liveQuizService.GetCurrentLiveQuiz();
                    if (currentQuiz != null)
                    {
                        Console.WriteLine($"Sending existing live quiz to user {userConnected.Username}");
                        await SendMessage(webSocket, new WebSocketResponseDTO
                        {
                            Type = "LIVE_QUIZ_CREATED",
                            Payload = currentQuiz
                        });
                    }
                }
                break;

            case "LIVE_QUIZ_CREATED":
                var liveQuizData = JsonSerializer.Deserialize<LiveQuizCreateDTO>(payloadJson);
                if (liveQuizData != null)
                {
                    await _liveQuizService.HandleLiveQuizCreated(liveQuizData);
                }
                break;

            case "LIVE_QUIZ_ENDED":
                await _liveQuizService.HandleLiveQuizEnded();
                break;
            case "JOIN_QUIZ_ROOM":
                var joinData = data.Payload.Deserialize<LiveJoinQuizRoomDTO>();
                if (joinData != null)
                {
                    userId = joinData.UserId;
                    await _liveQuizService.HandleUserJoinedRoom(joinData, webSocket);
                }
                break;

            case "LEAVE_QUIZ_ROOM":
                var leaveData = JsonSerializer.Deserialize<LiveUserConnectedDTO>(payloadJson);
                if (leaveData != null)
                {
                    await _liveQuizService.HandleUserLeftRoom(leaveData.UserId);
                }
                break;

            case "STOP_QUIZ":
                var stopData = JsonSerializer.Deserialize<LiveUserConnectedDTO>(payloadJson);
                if (stopData != null)
                {
                    await _liveQuizService.HandleStopQuiz(stopData.UserId);
                }
                break;
        }
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

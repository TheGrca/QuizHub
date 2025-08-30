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
        var buffer = new byte[1024 * 4];
        string? userId = null;

        try
        {
            while (webSocket.State == WebSocketState.Open)
            {
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Text)
                {
                    var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    var data = JsonSerializer.Deserialize<WebSocketMessageDTO>(message);
                    await HandleMessage(data, webSocket, userId);
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

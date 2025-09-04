using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using quiz_hub_backend.Interfaces;
using quiz_hub_backend.DTO;
using quiz_hub_backend.Middleware;

namespace quiz_hub_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LiveQuizController : ControllerBase
    {
        private readonly ILiveQuizService _liveQuizService;
        private readonly ILogger<LiveQuizController> _logger;

        public LiveQuizController(ILiveQuizService liveQuizService, ILogger<LiveQuizController> logger)
        {
            _liveQuizService = liveQuizService;
            _logger = logger;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateLiveQuiz([FromBody] LiveQuizCreateRequestDTO requestDto)
        {
            try
            {
                var adminId = GetCurrentUserId();
                if (adminId == null)
                {
                    return Unauthorized("User not authenticated");
                }

                var result = await _liveQuizService.CreateLiveQuizAsync(requestDto, adminId.Value);

                if (result.Success)
                {
                    // Broadcast to all connected users via WebSocket middleware
                    var broadcastPayload = new
                    {
                        quizData = new
                        {
                            quizId = result.QuizId,
                            name = requestDto.Name,
                            description = requestDto.Description,
                            categoryId = requestDto.CategoryId
                        },
                        questions = requestDto.Questions,
                        adminId = adminId.Value.ToString()
                    };

                    // Use the static method to broadcast
                    _ = Task.Run(() => LiveQuizWebSocketMiddleware.BroadcastLiveQuizCreated(broadcastPayload));
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("join")]
        public async Task<IActionResult> JoinLiveQuiz([FromBody] LiveQuizJoinLeaveCancelDTO request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not authenticated");
                }

                var result = await _liveQuizService.JoinLiveQuizAsync(request.QuizId, userId.Value);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("leave")]
        public async Task<IActionResult> LeaveLiveQuiz([FromBody] LiveQuizJoinLeaveCancelDTO request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not authenticated");
                }

                var result = await _liveQuizService.LeaveLiveQuizAsync(request.QuizId, userId.Value);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("cancel")]
        public async Task<IActionResult> CancelLiveQuiz([FromBody] LiveQuizJoinLeaveCancelDTO request)
        {
            try
            {
                var adminId = GetCurrentUserId();
                if (adminId == null)
                {
                    return Unauthorized("User not authenticated");
                }

                var result = await _liveQuizService.CancelLiveQuizAsync(request.QuizId, adminId.Value);

                if (result.Success)
                {
                    // Broadcast cancellation to all users
                    var cancelPayload = new
                    {
                        quizId = request.QuizId,
                        message = "The quiz has been cancelled by the admin"
                    };

                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            var broadcastMessage = new
                            {
                                Type = "QUIZ_CANCELLED",
                                Payload = cancelPayload
                            };

                            await LiveQuizWebSocketMiddleware.BroadcastToAll(broadcastMessage);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Error broadcasting quiz cancellation: {ex.Message}");
                        }
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("room/{quizId}")]
        public async Task<IActionResult> GetLiveQuizRoom(string quizId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not authenticated");
                }

                var result = await _liveQuizService.GetLiveQuizRoomAsync(quizId, userId.Value);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("current")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCurrentActiveLiveQuiz()
        {
            try
            {
                var currentQuiz = await _liveQuizService.GetCurrentActiveLiveQuizAsync();
                return Ok(currentQuiz);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartLiveQuiz([FromBody] LiveQuizStartDTO request)
        {
            try
            {
                var adminId = GetCurrentUserId();
                if (adminId == null)
                {
                    return Unauthorized("User not authenticated");
                }

                var result = await _liveQuizService.StartLiveQuizAsync(request.QuizId, adminId.Value);

                if (result.Success)
                {
                    // Broadcast quiz start to all participants
                    var startPayload = new
                    {
                        quizId = request.QuizId,
                        adminId = adminId.Value,
                        message = "Quiz has started!",
                        redirectTo = $"/live-quiz-game/{request.QuizId}/0"
                    };

                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            var broadcastMessage = new
                            {
                                Type = "QUIZ_STARTED",
                                Payload = startPayload
                            };

                            await LiveQuizWebSocketMiddleware.BroadcastToAll(broadcastMessage);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Error broadcasting quiz start: {ex.Message}");
                        }
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("submit-answer")]
        public async Task<IActionResult> SubmitAnswer([FromBody] LiveQuizSubmitAnswerDTO request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not authenticated");
                }

                var result = await _liveQuizService.SubmitAnswerAsync(request.QuizId, userId.Value, request);

                if (result.Success)
                {
                    // Broadcast answer submission to update leaderboard
                    var gameState = await _liveQuizService.GetGameStateAsync(request.QuizId, userId.Value);

                    var leaderboardPayload = new
                    {
                        quizId = request.QuizId,
                        participants = gameState.Participants.Select(p => new
                        {
                            userId = p.UserId,
                            username = p.Username,
                            profilePicture = p.ProfilePicture,
                            score = p.Score,
                            joinedAt = p.JoinedAt
                        }).ToList()
                    };

                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            var broadcastMessage = new
                            {
                                Type = "LEADERBOARD_UPDATED", // Different message type
                                Payload = leaderboardPayload
                            };

                            await LiveQuizWebSocketMiddleware.BroadcastToAll(broadcastMessage);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Error broadcasting leaderboard update: {ex.Message}");
                        }
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("next-question")]
        public async Task<IActionResult> NextQuestion([FromBody] LiveQuizStartDTO request)
        {
            try
            {
                var adminId = GetCurrentUserId();
                if (adminId == null)
                {
                    return Unauthorized("User not authenticated");
                }

                var result = await _liveQuizService.NextQuestionAsync(request.QuizId, adminId.Value);

                if (result.Success)
                {
                    var gameState = await _liveQuizService.GetGameStateAsync(request.QuizId, adminId.Value);

                    var nextQuestionPayload = new
                    {
                        quizId = request.QuizId,
                        gameState = gameState,
                        isCompleted = gameState.Status == LiveQuizStatus.Completed
                    };

                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            var broadcastMessage = new
                            {
                                Type = gameState.Status == LiveQuizStatus.Completed ? "QUIZ_COMPLETED" : "NEXT_QUESTION",
                                Payload = nextQuestionPayload
                            };

                            await LiveQuizWebSocketMiddleware.BroadcastToAll(broadcastMessage);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Error broadcasting next question: {ex.Message}");
                        }
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("game-state/{quizId}")]
        public async Task<IActionResult> GetGameState(string quizId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not authenticated");
                }

                var gameState = await _liveQuizService.GetGameStateAsync(quizId, userId.Value);
                return Ok(gameState);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private int? GetCurrentUserId()
        {

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return null;
            }
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }
}
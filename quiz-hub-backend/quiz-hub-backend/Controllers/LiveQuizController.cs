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
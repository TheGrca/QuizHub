using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using quiz_hub_backend.DTO;
using quiz_hub_backend.Interfaces;
using quiz_hub_backend.Services;
using System.Security.Claims;

namespace quiz_hub_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("{userId}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<UserDTO>> GetUserById(int userId)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the user.", error = ex.Message });
            }
        }

        [HttpGet("quizzes")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<List<QuizListDTO>>> GetQuizzes([FromQuery] QuizFilterDTO? filters = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not authenticated");
                }
                var quizzes = await _userService.GetAllQuizzesAsync(filters);
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching quizzes.", error = ex.Message });
            }
        }

        [HttpGet("categories")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<List<CategoryDTO>>> GetCategories()
        {
            try
            {
               var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not authenticated");
                }
                var categories = await _userService.GetCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching categories.", error = ex.Message });
            }
        }

        [HttpGet("quiz/{id}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<QuizResponseDTO>> GetQuiz(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not authenticated");
                }
                var quiz = await _userService.GetQuizByIdAsync(id);

                if (quiz == null)
                {
                    return NotFound(new { message = "Quiz not found." });
                }

                return Ok(quiz);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the quiz.", error = ex.Message });
            }
        }

        [HttpPost("submit-quiz")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<QuizSubmissionResultDTO>> SubmitQuiz([FromBody] QuizSubmissionDTO submission)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not authenticated");
                }
                var result = await _userService.SubmitQuizAsync(submission.UserId, submission);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while submitting the quiz.", error = ex.Message });
            }
        }

        [HttpGet("quiz-result/{id}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<QuizResultDetailDTO>> GetQuizResult(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not authenticated");
                }

                var result = await _userService.GetQuizResultAsync(id, userId.Value);

                if (result == null)
                {
                    return NotFound(new { message = "Quiz result not found." });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the quiz result.", error = ex.Message });
            }
        }
        [HttpGet("my-quiz-results")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<MyQuizResultsDTO>> GetMyQuizResults()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not authenticated");
                }

                var results = await _userService.GetMyQuizResultsAsync(userId.Value);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching quiz results.", error = ex.Message });
            }
        }

        [HttpGet("quiz-progress/{quizId}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<List<QuizProgressDTO>>> GetQuizProgress(int quizId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not authenticated");
                }

                var progressData = await _userService.GetQuizProgressAsync(userId.Value, quizId);
                return Ok(progressData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching quiz progress.", error = ex.Message });
            }
        }

        [HttpGet("quiz-rankings/{quizId}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<QuizRankingsDTO>> GetQuizRankings(int quizId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not authenticated");
                }
                var rankings = await _userService.GetQuizRankingsAsync(quizId);

                if (rankings == null)
                {
                    return NotFound(new { message = "Quiz not found." });
                }

                return Ok(rankings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching quiz rankings.", error = ex.Message });
            }
        }

            private int? GetCurrentUserId()
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return int.TryParse(userIdClaim, out var userId) ? userId : null;
            }

    }
}
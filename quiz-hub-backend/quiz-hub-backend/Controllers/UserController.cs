using Microsoft.AspNetCore.Mvc;
using quiz_hub_backend.DTO;
using quiz_hub_backend.Interfaces;
using quiz_hub_backend.Services;
using System.Security.Claims;

namespace quiz_hub_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("quizzes")]
        public async Task<ActionResult<List<QuizListDTO>>> GetQuizzes([FromQuery] QuizFilterDTO? filters = null)
        {
            try
            {
                var quizzes = await _userService.GetAllQuizzesAsync(filters);
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching quizzes.", error = ex.Message });
            }
        }

        [HttpGet("categories")]
        public async Task<ActionResult<List<CategoryDTO>>> GetCategories()
        {
            try
            {
                var categories = await _userService.GetCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching categories.", error = ex.Message });
            }
        }

        [HttpGet("quiz/{id}")]
        public async Task<ActionResult<QuizResponseDTO>> GetQuiz(int id)
        {
            try
            {
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
        public async Task<ActionResult<QuizSubmissionResultDTO>> SubmitQuiz([FromBody] QuizSubmissionDTO submission)
        {
            try
            {
                // Get user ID from token (you'll need to implement this based on your auth system)
                var userId = GetUserIdFromToken();

                var result = await _userService.SubmitQuizAsync(userId, submission);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while submitting the quiz.", error = ex.Message });
            }
        }

        [HttpGet("quiz-result/{id}")]
        public async Task<ActionResult<QuizResultDetailDTO>> GetQuizResult(int id)
        {
            try
            {
                var userId = GetUserIdFromToken();
                var result = await _userService.GetQuizResultAsync(id, userId);

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

        private int GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("Invalid or missing user ID in token");
            }
            return userId;
        }
    }
}
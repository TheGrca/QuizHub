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
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("{userId}")]
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
                var result = await _userService.SubmitQuizAsync(submission.UserId, submission);
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
                var userIdHeader = Request.Headers["X-User-Id"].FirstOrDefault();
                if (string.IsNullOrEmpty(userIdHeader) || !int.TryParse(userIdHeader, out int userId))
                {
                    return BadRequest("User ID is required");
                }

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
        [HttpGet("my-quiz-results")]
        public async Task<ActionResult<MyQuizResultsDTO>> GetMyQuizResults()
        {
            try
            {
                var userIdHeader = Request.Headers["X-User-Id"].FirstOrDefault();
                if (string.IsNullOrEmpty(userIdHeader) || !int.TryParse(userIdHeader, out int userId))
                {
                    return BadRequest("User ID is required");
                }

                var results = await _userService.GetMyQuizResultsAsync(userId);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching quiz results.", error = ex.Message });
            }
        }

        [HttpGet("quiz-progress/{quizId}")]
        public async Task<ActionResult<List<QuizProgressDTO>>> GetQuizProgress(int quizId)
        {
            try
            {
                var userIdHeader = Request.Headers["X-User-Id"].FirstOrDefault();
                if (string.IsNullOrEmpty(userIdHeader) || !int.TryParse(userIdHeader, out int userId))
                {
                    return BadRequest("User ID is required");
                }

                var progressData = await _userService.GetQuizProgressAsync(userId, quizId);
                return Ok(progressData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching quiz progress.", error = ex.Message });
            }
        }

        [HttpGet("quiz-rankings/{quizId}")]
        public async Task<ActionResult<QuizRankingsDTO>> GetQuizRankings(int quizId)
        {
            try
            {
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

    }
}
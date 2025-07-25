using Microsoft.AspNetCore.Mvc;
using quiz_hub_backend.DTO;
using quiz_hub_backend.Interfaces;
using quiz_hub_backend.Services;

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
    }
}
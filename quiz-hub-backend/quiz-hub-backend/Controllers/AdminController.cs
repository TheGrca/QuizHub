using Microsoft.AspNetCore.Mvc;
using quiz_hub_backend.DTO;
using quiz_hub_backend.Interfaces;

namespace quiz_hub_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpPost("quiz")]
        public async Task<ActionResult<QuizResponseDTO>> CreateQuiz([FromBody] CreateQuizDTO createQuizDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdQuiz = await _adminService.CreateQuizAsync(createQuizDto);
                return CreatedAtAction(nameof(GetQuiz), new { id = createdQuiz.Id }, createdQuiz);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the quiz.", error = ex.Message });
            }
        }

        [HttpGet("categories")]
        public async Task<ActionResult<List<CategoryDTO>>> GetCategories()
        {
            try
            {
                var categories = await _adminService.GetCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching categories.", error = ex.Message });
            }
        }

        [HttpGet("quizzes")]
        public async Task<ActionResult<List<QuizResponseDTO>>> GetAllQuizzes()
        {
            try
            {
                var quizzes = await _adminService.GetAllQuizzesAsync();
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching quizzes.", error = ex.Message });
            }
        }

        [HttpGet("quiz/{id}")]
        public async Task<ActionResult<QuizResponseDTO>> GetQuiz(int id)
        {
            try
            {
                var quiz = await _adminService.GetQuizByIdAsync(id);

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

        [HttpPut("quiz/{id}")]
        public async Task<ActionResult> UpdateQuiz(int id, [FromBody] CreateQuizDTO updateQuizDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var success = await _adminService.UpdateQuizAsync(id, updateQuizDto);

                if (!success)
                {
                    return NotFound(new { message = "Quiz not found." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the quiz.", error = ex.Message });
            }
        }

        [HttpDelete("quiz/{id}")]
        public async Task<ActionResult> DeleteQuiz(int id)
        {
            try
            {
                var success = await _adminService.DeleteQuizAsync(id);

                if (!success)
                {
                    return NotFound(new { message = "Quiz not found." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the quiz.", error = ex.Message });
            }
        }
    }
}

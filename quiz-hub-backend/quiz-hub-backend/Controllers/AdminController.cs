﻿using Microsoft.AspNetCore.Mvc;
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

        //This function makes a quiz
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

        //This function fetches the categories
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

        //This function fetches all quizzes
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

        //This function fetches a single quiz
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

        //This function selects one quiz that will be edited
        [HttpGet("quiz/{quizId}/edit")]
        public async Task<IActionResult> GetQuizForEdit(int quizId)
        {
            try
            {
                var quiz = await _adminService.GetQuizForEditAsync(quizId);
                if (quiz == null)
                {
                    return NotFound(new { message = "Quiz not found" });
                }

                return Ok(quiz);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch quiz for editing", error = ex.Message });
            }
        }

        //This function edits a quiz
        [HttpPut("quiz/{quizId}/edit")]
        public async Task<IActionResult> UpdateQuizWithEdit(int quizId, [FromBody] EditQuizDTO editQuizDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var success = await _adminService.UpdateQuizWithEditAsync(quizId, editQuizDto);
                if (!success)
                {
                    return NotFound(new { message = "Quiz not found" });
                }

                return Ok(new { message = "Quiz updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update quiz", error = ex.Message });
            }
        }

        //This function deletes the quiz
        [HttpDelete("quiz/{quizId}/delete")]
        public async Task<IActionResult> DeleteQuizCompletely(int quizId)
        {
            try
            {
                var success = await _adminService.DeleteQuizAndAllDataAsync(quizId);
                if (!success)
                {
                    return NotFound(new { message = "Quiz not found" });
                }

                return Ok(new { message = "Quiz and all associated data deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete quiz", error = ex.Message });
            }
        }

        //This function fetches all users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _adminService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch users", error = ex.Message });
            }
        }

        //This function fetches one user and all of his quizzes
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserResults(int userId)
        {
            try
            {
                var userResults = await _adminService.GetUserResultsAsync(userId);
                if (userResults == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(userResults);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch user results", error = ex.Message });
            }
        }
    }
}

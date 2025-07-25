using Microsoft.EntityFrameworkCore;
using quiz_hub_backend.DTO;
using quiz_hub_backend.Interfaces;
using quiz_hub_backend.Models;

namespace quiz_hub_backend.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<QuizListDTO>> GetAllQuizzesAsync(QuizFilterDTO? filters = null)
        {
            var query = _context.Quizzes
                .Include(q => q.Category)
                .AsQueryable();

            // Apply filters if provided
            if (filters != null)
            {
                if (!string.IsNullOrEmpty(filters.Search))
                {
                    query = query.Where(q => q.Name.Contains(filters.Search) ||
                                           q.Description.Contains(filters.Search));
                }

                if (!string.IsNullOrEmpty(filters.Category))
                {
                    query = query.Where(q => q.Category.Name.ToLower() == filters.Category.ToLower());
                }

                if (!string.IsNullOrEmpty(filters.Difficulty))
                {
                    if (Enum.TryParse<Difficulty>(filters.Difficulty, true, out var difficultyEnum))
                    {
                        query = query.Where(q => q.Difficulty == difficultyEnum);
                    }
                }
            }

            return await query
                .Select(q => new QuizListDTO
                {
                    Id = q.Id,
                    Name = q.Name,
                    Description = q.Description,
                    Category = q.Category.Name,
                    Difficulty = q.Difficulty.ToString(),
                    NumberOfQuestions = q.NumberOfQuestions,
                    TimeToFinish = q.TimeLimitMinutes
                })
                .OrderBy(q => q.Name)
            .ToListAsync();
        }

        public async Task<List<CategoryDTO>> GetCategoriesAsync()
        {
            return await _context.Categories
                .Select(c => new CategoryDTO
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .OrderBy(c => c.Name)
            .ToListAsync();
        }

        public async Task<QuizResponseDTO?> GetQuizByIdAsync(int quizId)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Category)
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Id == quizId);

            if (quiz == null)
                return null;

            return new QuizResponseDTO
            {
                Id = quiz.Id,
                Name = quiz.Name,
                Description = quiz.Description,
                NumberOfQuestions = quiz.NumberOfQuestions,
                Difficulty = (int)quiz.Difficulty,
                TimeLimitMinutes = quiz.TimeLimitMinutes,
                CategoryName = quiz.Category.Name,
                Questions = quiz.Questions.Select(q => MapQuestionToDto(q)).ToList()
            };
        }

        private QuestionResponseDTO MapQuestionToDto(Question question)
        {
            var dto = new QuestionResponseDTO
            {
                Id = question.Id,
                Text = question.Text,
                Points = question.Points,
                QuestionType = question.GetType().Name
            };

            // Set properties based on the actual question type
            switch (question)
            {
                case MultipleChoiceQuestion mcq:
                    dto.Option1 = mcq.Option1;
                    dto.Option2 = mcq.Option2;
                    dto.Option3 = mcq.Option3;
                    dto.Option4 = mcq.Option4;
                    dto.CorrectAnswerIndex = mcq.CorrectAnswerIndex;
                    break;

                case MultipleAnswerQuestion maq:
                    dto.Option1 = maq.Option1;
                    dto.Option2 = maq.Option2;
                    dto.Option3 = maq.Option3;
                    dto.Option4 = maq.Option4;
                    dto.CorrectAnswerIndices = maq.CorrectAnswerIndices;
                    break;

                case TrueFalseQuestion tfq:
                    dto.TrueFalseCorrectAnswer = tfq.CorrectAnswer;
                    break;

                case TextInputQuestion tiq:
                    dto.CorrectAnswer = tiq.CorrectAnswer;
                    break;
            }

            return dto;
        }
    }
}

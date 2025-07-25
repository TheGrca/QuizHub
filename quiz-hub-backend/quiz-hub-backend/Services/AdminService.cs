using Microsoft.EntityFrameworkCore;
using quiz_hub_backend.DTO;
using quiz_hub_backend.Interfaces;
using quiz_hub_backend.Models;


namespace quiz_hub_backend.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;

        public AdminService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<QuizResponseDTO> CreateQuizAsync(CreateQuizDTO createQuizDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Create the quiz
                var quiz = new Quiz
                {
                    Name = createQuizDto.Name,
                    Description = createQuizDto.Description,
                    NumberOfQuestions = createQuizDto.Questions.Count,
                    Difficulty = (Difficulty)createQuizDto.Difficulty,
                    TimeLimitMinutes = createQuizDto.TimeLimitMinutes,
                    CategoryId = createQuizDto.CategoryId
                };

                _context.Quizzes.Add(quiz);
                await _context.SaveChangesAsync();

                // Create questions based on their types
                var questions = new List<Question>();
                foreach (var questionDto in createQuizDto.Questions)
                {
                    var question = CreateQuestionFromDto(questionDto, quiz.Id);
                    questions.Add(question);
                }

                _context.Questions.AddRange(questions);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // Return the created quiz with questions
                return await GetQuizByIdAsync(quiz.Id);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<CategoryDTO>> GetCategoriesAsync()
        {
            return await _context.Categories
                .Select(c => new CategoryDTO
                {
                    Id = c.Id,
                    Name = c.Name
                })
            .ToListAsync();
        }

        public async Task<List<QuizResponseDTO>> GetAllQuizzesAsync()
        {
            return await _context.Quizzes
                .Include(q => q.Category)
                .Include(q => q.Questions)
                .Select(q => new QuizResponseDTO
                {
                    Id = q.Id,
                    Name = q.Name,
                    Description = q.Description,
                    NumberOfQuestions = q.NumberOfQuestions,
                    Difficulty = (int)q.Difficulty,
                    TimeLimitMinutes = q.TimeLimitMinutes,
                    CategoryName = q.Category.Name,
                    Questions = q.Questions.Select(question => MapQuestionToDto(question)).ToList()
                })
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

        public async Task<bool> UpdateQuizAsync(int quizId, CreateQuizDTO updateQuizDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var quiz = await _context.Quizzes
                    .Include(q => q.Questions)
                    .FirstOrDefaultAsync(q => q.Id == quizId);

                if (quiz == null)
                    return false;

                // Update quiz properties
                quiz.Name = updateQuizDto.Name;
                quiz.Description = updateQuizDto.Description;
                quiz.NumberOfQuestions = updateQuizDto.Questions.Count;
                quiz.Difficulty = (Difficulty)updateQuizDto.Difficulty;
                quiz.TimeLimitMinutes = updateQuizDto.TimeLimitMinutes;
                quiz.CategoryId = updateQuizDto.CategoryId;

                // Remove existing questions
                _context.Questions.RemoveRange(quiz.Questions);

                // Add new questions
                var newQuestions = updateQuizDto.Questions
                    .Select(q => CreateQuestionFromDto(q, quizId))
                    .ToList();

                _context.Questions.AddRange(newQuestions);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteQuizAsync(int quizId)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Id == quizId);

            if (quiz == null)
                return false;

            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();
            return true;
        }

        private Question CreateQuestionFromDto(CreateQuestionDTO dto, int quizId)
        {
            return dto.QuestionType switch
            {
                "MultipleChoiceQuestion" => new MultipleChoiceQuestion
                {
                    Text = dto.Text,
                    QuizId = quizId,
                    Points = dto.Points,
                    Option1 = dto.Option1!,
                    Option2 = dto.Option2!,
                    Option3 = dto.Option3!,
                    Option4 = dto.Option4!,
                    CorrectAnswerIndex = dto.CorrectAnswerIndex!.Value
                },

                "MultipleAnswerQuestion" => new MultipleAnswerQuestion
                {
                    Text = dto.Text,
                    QuizId = quizId,
                    Points = dto.Points,
                    Option1 = dto.Option1!,
                    Option2 = dto.Option2!,
                    Option3 = dto.Option3!,
                    Option4 = dto.Option4!,
                    CorrectAnswerIndices = dto.CorrectAnswerIndices!
                },

                "TrueFalseQuestion" => new TrueFalseQuestion
                {
                    Text = dto.Text,
                    QuizId = quizId,
                    Points = dto.Points,
                    CorrectAnswer = dto.TrueFalseCorrectAnswer!.Value
                },

                "TextInputQuestion" => new TextInputQuestion
                {
                    Text = dto.Text,
                    QuizId = quizId,
                    Points = dto.Points,
                    CorrectAnswer = dto.CorrectAnswer!
                },

                _ => throw new ArgumentException($"Unknown question type: {dto.QuestionType}")
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

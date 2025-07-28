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
            var quizzes = await _context.Quizzes
                           .Include(q => q.Category)
                           .Include(q => q.Questions)
                           .ToListAsync();

            return quizzes.Select(q => new QuizResponseDTO
            {
                Id = q.Id,
                Name = q.Name,
                Description = q.Description,
                NumberOfQuestions = q.NumberOfQuestions,
                Difficulty = (int)q.Difficulty,
                TimeLimitMinutes = q.TimeLimitMinutes,
                CategoryName = q.Category.Name,
                Questions = q.Questions.Select(question => MapQuestionToDto(question)).ToList()
            }).ToList();
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

        private static QuestionResponseDTO MapQuestionToDto(Question question)
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


        //For editing
        public async Task<QuizEditDetailDTO?> GetQuizForEditAsync(int quizId)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Category)
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Id == quizId);

            if (quiz == null)
                return null;

            var questionsDetail = new List<QuestionEditDetailDTO>();

            foreach (var question in quiz.Questions)
            {
                var questionDetail = new QuestionEditDetailDTO
                {
                    Id = question.Id,
                    Text = question.Text,
                    Points = question.Points,
                    QuestionType = question.GetType().Name
                };

                // Set type-specific properties with correct answers visible
                switch (question)
                {
                    case MultipleChoiceQuestion mcq:
                        questionDetail.Option1 = mcq.Option1;
                        questionDetail.Option2 = mcq.Option2;
                        questionDetail.Option3 = mcq.Option3;
                        questionDetail.Option4 = mcq.Option4;
                        questionDetail.CorrectAnswerIndex = mcq.CorrectAnswerIndex;
                        break;
                    case MultipleAnswerQuestion maq:
                        questionDetail.Option1 = maq.Option1;
                        questionDetail.Option2 = maq.Option2;
                        questionDetail.Option3 = maq.Option3;
                        questionDetail.Option4 = maq.Option4;
                        questionDetail.CorrectAnswerIndices = maq.CorrectAnswerIndices;
                        break;
                    case TrueFalseQuestion tfq:
                        questionDetail.TrueFalseCorrectAnswer = tfq.CorrectAnswer;
                        break;
                    case TextInputQuestion tiq:
                        questionDetail.CorrectAnswer = tiq.CorrectAnswer;
                        break;
                }

                questionsDetail.Add(questionDetail);
            }

            return new QuizEditDetailDTO
            {
                Id = quiz.Id,
                Name = quiz.Name,
                Description = quiz.Description,
                CategoryId = quiz.CategoryId,
                CategoryName = quiz.Category.Name,
                Difficulty = (int)quiz.Difficulty,
                DifficultyName = quiz.Difficulty.ToString(),
                TimeLimitMinutes = quiz.TimeLimitMinutes,
                NumberOfQuestions = quiz.NumberOfQuestions,
                Questions = questionsDetail
            };
        }

        // New method: Update quiz with full edit capabilities
        public async Task<bool> UpdateQuizWithEditAsync(int quizId, EditQuizDTO editQuizDto)
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
                quiz.Name = editQuizDto.Name;
                quiz.Description = editQuizDto.Description;
                quiz.CategoryId = editQuizDto.CategoryId;
                quiz.Difficulty = (Difficulty)editQuizDto.Difficulty;
                quiz.TimeLimitMinutes = editQuizDto.TimeLimitMinutes;
                quiz.NumberOfQuestions = editQuizDto.Questions.Count;

                // Get existing questions
                var existingQuestions = quiz.Questions.ToList();
                var questionsToDelete = new List<Question>();

                // Process questions
                foreach (var questionDto in editQuizDto.Questions)
                {
                    if (questionDto.Id.HasValue)
                    {
                        // Update existing question
                        var existingQuestion = existingQuestions.FirstOrDefault(q => q.Id == questionDto.Id.Value);
                        if (existingQuestion != null)
                        {
                            UpdateExistingQuestion(existingQuestion, questionDto);
                        }
                    }
                    else
                    {
                        // Add new question
                        var newQuestion = CreateQuestionFromEditDto(questionDto, quizId);
                        _context.Questions.Add(newQuestion);
                    }
                }

                // Find questions to delete (existing questions not in the DTO)
                var questionIdsInDto = editQuizDto.Questions
                    .Where(q => q.Id.HasValue)
                    .Select(q => q.Id.Value)
                    .ToList();

                questionsToDelete = existingQuestions
                    .Where(q => !questionIdsInDto.Contains(q.Id))
                    .ToList();

                // Delete removed questions
                if (questionsToDelete.Any())
                {
                    // Also delete any user answers for these questions
                    var questionIdsToDelete = questionsToDelete.Select(q => q.Id).ToList();
                    var userAnswersToDelete = await _context.UserAnswers
                        .Where(ua => questionIdsToDelete.Contains(ua.QuestionId))
                        .ToListAsync();

                    _context.UserAnswers.RemoveRange(userAnswersToDelete);
                    _context.Questions.RemoveRange(questionsToDelete);
                }

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

        // New method: Delete quiz and all associated data
        public async Task<bool> DeleteQuizAndAllDataAsync(int quizId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var quiz = await _context.Quizzes
                    .Include(q => q.Questions)
                    .Include(q => q.QuizResults)
                    .FirstOrDefaultAsync(q => q.Id == quizId);

                if (quiz == null)
                    return false;

                // Delete all user answers for this quiz's questions
                var questionIds = quiz.Questions.Select(q => q.Id).ToList();
                var userAnswers = await _context.UserAnswers
                    .Where(ua => questionIds.Contains(ua.QuestionId))
                    .ToListAsync();
                _context.UserAnswers.RemoveRange(userAnswers);

                // Delete all quiz results for this quiz
                _context.UserQuizResults.RemoveRange(quiz.QuizResults);

                // Delete quiz history records
                var quizHistories = await _context.UserQuizHistory
                    .Where(qh => qh.QuizId == quizId)
                    .ToListAsync();
                _context.UserQuizHistory.RemoveRange(quizHistories);

                // Delete global rankings
                var globalRankings = await _context.GlobalRankings
                    .Where(gr => gr.QuizId == quizId)
                    .ToListAsync();
                _context.GlobalRankings.RemoveRange(globalRankings);

                // Delete questions
                _context.Questions.RemoveRange(quiz.Questions);

                // Finally delete the quiz
                _context.Quizzes.Remove(quiz);

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

        // New method: Add single question to quiz
        public async Task<QuestionEditDetailDTO> AddQuestionToQuizAsync(int quizId, EditQuestionDTO questionDto)
        {
            var question = CreateQuestionFromEditDto(questionDto, quizId);
            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            // Update quiz question count
            var quiz = await _context.Quizzes.FindAsync(quizId);
            if (quiz != null)
            {
                quiz.NumberOfQuestions = await _context.Questions.CountAsync(q => q.QuizId == quizId);
                await _context.SaveChangesAsync();
            }

            // Return the created question details
            return MapQuestionToEditDetailDto(question);
        }

        // New method: Update single question
        public async Task<bool> UpdateQuestionAsync(int questionId, EditQuestionDTO questionDto)
        {
            var question = await _context.Questions.FindAsync(questionId);
            if (question == null)
                return false;

            UpdateExistingQuestion(question, questionDto);
            await _context.SaveChangesAsync();

            return true;
        }

        // New method: Delete single question
        public async Task<bool> DeleteQuestionAsync(int questionId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var question = await _context.Questions.FindAsync(questionId);
                if (question == null)
                    return false;

                var quizId = question.QuizId;

                // Delete associated user answers
                var userAnswers = await _context.UserAnswers
                    .Where(ua => ua.QuestionId == questionId)
                    .ToListAsync();
                _context.UserAnswers.RemoveRange(userAnswers);

                // Delete the question
                _context.Questions.Remove(question);

                // Update quiz question count
                var quiz = await _context.Quizzes.FindAsync(quizId);
                if (quiz != null)
                {
                    quiz.NumberOfQuestions = await _context.Questions.CountAsync(q => q.QuizId == quizId && q.Id != questionId);
                    await _context.SaveChangesAsync();
                }

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

        // Helper method: Create question from EditQuestionDTO
        private Question CreateQuestionFromEditDto(EditQuestionDTO dto, int quizId)
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

        // Helper method: Update existing question
        private void UpdateExistingQuestion(Question question, EditQuestionDTO dto)
        {
            question.Text = dto.Text;
            question.Points = dto.Points;

            switch (question)
            {
                case MultipleChoiceQuestion mcq:
                    mcq.Option1 = dto.Option1!;
                    mcq.Option2 = dto.Option2!;
                    mcq.Option3 = dto.Option3!;
                    mcq.Option4 = dto.Option4!;
                    mcq.CorrectAnswerIndex = dto.CorrectAnswerIndex!.Value;
                    break;
                case MultipleAnswerQuestion maq:
                    maq.Option1 = dto.Option1!;
                    maq.Option2 = dto.Option2!;
                    maq.Option3 = dto.Option3!;
                    maq.Option4 = dto.Option4!;
                    maq.CorrectAnswerIndices = dto.CorrectAnswerIndices!;
                    break;
                case TrueFalseQuestion tfq:
                    tfq.CorrectAnswer = dto.TrueFalseCorrectAnswer!.Value;
                    break;
                case TextInputQuestion tiq:
                    tiq.CorrectAnswer = dto.CorrectAnswer!;
                    break;
            }
        }

        // Helper method: Map question to edit detail DTO
        private static QuestionEditDetailDTO MapQuestionToEditDetailDto(Question question)
        {
            var dto = new QuestionEditDetailDTO
            {
                Id = question.Id,
                Text = question.Text,
                Points = question.Points,
                QuestionType = question.GetType().Name
            };

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

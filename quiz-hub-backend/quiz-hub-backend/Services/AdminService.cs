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

        //For adding quiz
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
                Difficulty = q.Difficulty.ToString(),
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
                Difficulty = quiz.Difficulty.ToString(),
                TimeLimitMinutes = quiz.TimeLimitMinutes,
                CategoryName = quiz.Category.Name,
                Questions = quiz.Questions.Select(q => MapQuestionToDto(q)).ToList()
            };
        }
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



        //For User Results
        public async Task<List<UserSummaryDTO>> GetAllUsersAsync()
        {
            var users = await _context.Users
                .Where(u => u.isAdmin == UserType.User)
                .ToListAsync();

            var userSummaries = new List<UserSummaryDTO>();

            foreach (var user in users)
            {
                var quizResults = await _context.UserQuizResults
                    .Where(qr => qr.UserId == user.Id)
                    .ToListAsync();

                var summary = new UserSummaryDTO
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    ProfilePicture = Convert.ToBase64String(user.Image),
                    TotalQuizzesTaken = quizResults.Count,
                    AverageScore = quizResults.Any() ? quizResults.Average(qr => qr.Percentage) : 0,
                    LastQuizDate = quizResults.Any() ? quizResults.Max(qr => qr.CompletionDate) : DateTime.MinValue
                };

                userSummaries.Add(summary);
            }

            return userSummaries.OrderByDescending(u => u.LastQuizDate).ToList();
        }

        public async Task<UserDetailResultsDTO?> GetUserResultsAsync(int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.isAdmin == UserType.User);

            if (user == null)
                return null;

            var quizResults = await _context.UserQuizResults
                .Include(qr => qr.Quiz)
                .ThenInclude(q => q.Category)
                .Include(qr => qr.UserAnswers)
                .Where(qr => qr.UserId == userId)
                .OrderByDescending(qr => qr.CompletionDate)
                .ToListAsync();

            var quizResultDetails = new List<UserQuizResultDetailDTO>();

            foreach (var result in quizResults)
            {
                var correctAnswers = await CalculateCorrectAnswers(result.Id);

                var resultDetail = new UserQuizResultDetailDTO
                {
                    ResultId = result.Id,
                    QuizId = result.QuizId,
                    QuizName = result.Quiz.Name,
                    Category = result.Quiz.Category.Name,
                    Difficulty = result.Quiz.Difficulty.ToString(),
                    Score = result.Score,
                    TotalPoints = await CalculateTotalPoints(result.QuizId),
                    CorrectAnswers = correctAnswers,
                    TotalQuestions = result.Quiz.NumberOfQuestions,
                    Percentage = result.Percentage,
                    TimeTakenSeconds = FormatTimeSpent(result.TimeTakenSeconds),
                    CompletionDate = result.CompletionDate
                };

                quizResultDetails.Add(resultDetail);
            }

            // Calculate user stats
            var stats = new UserStatsDTO();
            if (quizResults.Any())
            {
                stats.TotalQuizzes = quizResults.Count;
                stats.AverageScore = quizResults.Average(qr => qr.Score);
                stats.AveragePercentage = quizResults.Average(qr => qr.Percentage);
                stats.BestScore = quizResults.Max(qr => qr.Score);
                stats.BestPercentage = quizResults.Max(qr => qr.Percentage);
                stats.TotalTimeSpent = FormatTimeSpent(quizResults.Sum(qr => qr.TimeTakenSeconds));
                stats.FirstQuizDate = quizResults.Min(qr => qr.CompletionDate);
                stats.LastQuizDate = quizResults.Max(qr => qr.CompletionDate);
            }

            return new UserDetailResultsDTO
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                ProfilePicture = Convert.ToBase64String(user.Image),
                QuizResults = quizResultDetails,
                Stats = stats
            };
        }

        private async Task<int> CalculateCorrectAnswers(int userQuizResultId)
        {
            return await _context.UserAnswers
                .Where(ua => ua.UserQuizResultId == userQuizResultId && ua.IsCorrect)
                .CountAsync();
        }

        private async Task<int> CalculateTotalPoints(int quizId)
        {
            return await _context.Questions
                .Where(q => q.QuizId == quizId)
                .SumAsync(q => q.Points);
        }

        private string FormatTimeSpent(int seconds)
        {
            var minutes = seconds / 60;
            var remainingSeconds = seconds % 60;
            return $"{minutes}:{remainingSeconds:D2}";
        }
    }
}

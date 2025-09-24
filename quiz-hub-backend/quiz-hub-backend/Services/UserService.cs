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

        public async Task<UserDTO?> GetUserByIdAsync(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return null;

                return new UserDTO
                {
                    Id = user.Id,
                    Username = user.Username,
                    ProfilePicture = user.Image != null ? Convert.ToBase64String(user.Image) : null,
                    isAdmin = user.isAdmin
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching user by ID: {ex.Message}", ex);
            }
        }


        //For home page
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
                Difficulty = quiz.Difficulty.ToString(),
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


        //For Quiz pages
        public async Task<QuizResultDetailDTO?> GetQuizResultAsync(int resultId, int userId)
        {
            var result = await _context.UserQuizResults
                .Include(r => r.Quiz)
                .Include(r => r.UserAnswers)
                    .ThenInclude(a => a.Question)
                .FirstOrDefaultAsync(r => r.Id == resultId && r.UserId == userId);

            if (result == null)
                return null;

            var questionResults = new List<QuestionResultDTO>();

            foreach (var answer in result.UserAnswers)
            {
                var questionDto = MapQuestionToDto(answer.Question);
                var userAnswerDto = MapUserAnswerToDto(answer);

                var pointsEarned = answer.IsCorrect ? answer.Question.Points : 0;

                questionResults.Add(new QuestionResultDTO
                {
                    Question = questionDto,
                    UserAnswer = userAnswerDto,
                    IsCorrect = answer.IsCorrect,
                    PointsEarned = pointsEarned
                });
            }
            var progressData = await GetQuizProgressAsync(userId, result.QuizId);
            return new QuizResultDetailDTO
            {
                Id = result.Id,
                QuizId = result.QuizId,
                QuizName = result.Quiz.Name,
                Score = result.Score,
                TotalPoints = result.UserAnswers.Sum(a => a.Question.Points),
                Percentage = result.Percentage,
                CorrectAnswers = result.UserAnswers.Count(a => a.IsCorrect),
                TotalQuestions = result.UserAnswers.Count,
                TimeTakenSeconds = result.TimeTakenSeconds,
                CompletionDate = result.CompletionDate,
                QuestionResults = questionResults,
                ProgressData = progressData
            };
        }

        public async Task<QuizSubmissionResultDTO> SubmitQuizAsync(int userId, QuizSubmissionDTO submission)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Get the quiz with questions
                var quiz = await _context.Quizzes
                    .Include(q => q.Questions)
                    .FirstOrDefaultAsync(q => q.Id == submission.QuizId);

                if (quiz == null)
                    throw new ArgumentException("Quiz not found");

                // Calculate score and create user answers
                int totalScore = 0;
                int correctAnswers = 0;
                var userAnswers = new List<UserAnswer>();

                foreach (var answerDto in submission.UserAnswers)
                {
                    var question = quiz.Questions.FirstOrDefault(q => q.Id == answerDto.QuestionId);
                    if (question == null) continue;

                    var (isCorrect, pointsEarned) = EvaluateAnswer(question, answerDto);

                    if (isCorrect) correctAnswers++;
                    totalScore += pointsEarned;

                    // Create appropriate UserAnswer based on question type
                    UserAnswer userAnswer = answerDto.AnswerType switch
                    {
                        "MultipleChoiceQuestion" => new MultipleChoiceUserAnswer
                        {
                            QuestionId = answerDto.QuestionId,
                            IsCorrect = isCorrect,
                            SelectedOptionIndex = answerDto.SelectedOptionIndex ?? -1
                        },
                        "MultipleAnswerQuestion" => new MultipleAnswerUserAnswer
                        {
                            QuestionId = answerDto.QuestionId,
                            IsCorrect = isCorrect,
                            SelectedOptionIndices = answerDto.SelectedOptionIndices ?? ""
                        },
                        "TrueFalseQuestion" => new TrueFalseUserAnswer
                        {
                            QuestionId = answerDto.QuestionId,
                            IsCorrect = isCorrect,
                            UserAnswer = answerDto.UserAnswer ?? false
                        },
                        "TextInputQuestion" => new TextInputUserAnswer
                        {
                            QuestionId = answerDto.QuestionId,
                            IsCorrect = isCorrect,
                            UserAnswerText = answerDto.UserAnswerText ?? ""
                        },
                        _ => throw new ArgumentException($"Unknown answer type: {answerDto.AnswerType}")
                    };

                    userAnswers.Add(userAnswer);
                }

                // Calculate percentage
                var totalPossiblePoints = quiz.Questions.Sum(q => q.Points);
                var percentage = totalPossiblePoints > 0 ? (double)totalScore / totalPossiblePoints * 100 : 0;

                // Create UserQuizResult
                var quizResult = new UserQuizResult
                {
                    UserId = userId,
                    QuizId = submission.QuizId,
                    CompletionDate = DateTime.UtcNow,
                    TimeTakenSeconds = submission.TimeTakenSeconds,
                    Score = totalScore,
                    Percentage = percentage
                };

                _context.UserQuizResults.Add(quizResult);
                await _context.SaveChangesAsync();

                // Set UserQuizResultId for all answers
                foreach (var answer in userAnswers)
                {
                    answer.UserQuizResultId = quizResult.Id;
                }

                _context.UserAnswers.AddRange(userAnswers);

                // Update or create UserQuizHistory
                var history = await _context.UserQuizHistory
                    .FirstOrDefaultAsync(h => h.UserId == userId && h.QuizId == submission.QuizId);

                if (history == null)
                {
                    history = new UserQuizHistory
                    {
                        UserId = userId,
                        QuizId = submission.QuizId,
                        AttemptCount = 1,
                        BestScore = totalScore,
                        BestPercentage = percentage,
                        BestTimeSeconds = submission.TimeTakenSeconds,
                        LastAttemptDate = DateTime.UtcNow
                    };
                    _context.UserQuizHistory.Add(history);
                }
                else
                {
                    history.AttemptCount++;
                    history.LastAttemptDate = DateTime.UtcNow;

                    if (totalScore > history.BestScore ||
                        (totalScore == history.BestScore && submission.TimeTakenSeconds < history.BestTimeSeconds))
                    {
                        history.BestScore = totalScore;
                        history.BestPercentage = percentage;
                        history.BestTimeSeconds = submission.TimeTakenSeconds;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new QuizSubmissionResultDTO
                {
                    ResultId = quizResult.Id,
                    Score = totalScore,
                    Percentage = percentage,
                    CorrectAnswers = correctAnswers,
                    TotalQuestions = quiz.Questions.Count
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private (bool isCorrect, int pointsEarned) EvaluateAnswer(Question question, UserAnswerSubmissionDTO answer)
        {
            switch (question)
            {
                case MultipleChoiceQuestion mcq:
                    var isCorrect = answer.SelectedOptionIndex == mcq.CorrectAnswerIndex;
                    return (isCorrect, isCorrect ? question.Points : 0);

                case MultipleAnswerQuestion maq:
                    var correctIndices = maq.CorrectAnswerIndices.Split(',').Select(int.Parse).OrderBy(x => x).ToArray();
                    var userIndices = string.IsNullOrEmpty(answer.SelectedOptionIndices)
                        ? new int[0]
                        : answer.SelectedOptionIndices.Split(',').Select(int.Parse).OrderBy(x => x).ToArray();

                    var isMultiCorrect = correctIndices.SequenceEqual(userIndices);
                    return (isMultiCorrect, isMultiCorrect ? question.Points : 0);

                case TrueFalseQuestion tfq:
                    var isTFCorrect = answer.UserAnswer == tfq.CorrectAnswer;
                    return (isTFCorrect, isTFCorrect ? question.Points : 0);

                case TextInputQuestion tiq:
                    var isTextCorrect = string.Equals(answer.UserAnswerText?.Trim(), tiq.CorrectAnswer.Trim(), StringComparison.OrdinalIgnoreCase);
                    return (isTextCorrect, isTextCorrect ? question.Points : 0);

                default:
                    return (false, 0);
            }
        }
        private UserAnswerDetailDTO MapUserAnswerToDto(UserAnswer answer)
        {
            return new UserAnswerDetailDTO
            {
                AnswerType = answer.GetType().Name.Replace("UserAnswer", "Question"),
                SelectedOptionIndex = (answer as MultipleChoiceUserAnswer)?.SelectedOptionIndex,
                SelectedOptionIndices = (answer as MultipleAnswerUserAnswer)?.SelectedOptionIndices,
                UserAnswer = (answer as TrueFalseUserAnswer)?.UserAnswer,
                UserAnswerText = (answer as TextInputUserAnswer)?.UserAnswerText
            };
        }

        public async Task<MyQuizResultsDTO> GetMyQuizResultsAsync(int userId)
        {
            var results = await _context.UserQuizResults
                .Include(r => r.Quiz)
                    .ThenInclude(q => q.Category)
                .Include(r => r.Quiz)
                    .ThenInclude(q => q.Questions) // Include quiz questions to get total points
                .Include(r => r.UserAnswers)
                    .ThenInclude(a => a.Question) // Include user answers and their questions
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CompletionDate)
                .ToListAsync();

            var resultSummaries = results.Select(r => new QuizResultSummaryDTO
            {
                Id = r.Id,
                QuizId = r.QuizId,
                QuizName = r.Quiz.Name,
                Category = r.Quiz.Category.Name,
                Difficulty = r.Quiz.Difficulty.ToString(),
                Score = r.Score,
                TotalPoints = r.Quiz.Questions.Sum(q => q.Points), // Use Quiz.Questions instead
                Percentage = r.Percentage,
                CorrectAnswers = r.UserAnswers.Count(a => a.IsCorrect),
                TotalQuestions = r.Quiz.NumberOfQuestions,
                TimeTakenSeconds = r.TimeTakenSeconds,
                CompletionDate = r.CompletionDate
            }).ToList();

            // Calculate user stats
            var stats = new UserStatsDTO();
            if (results.Any())
            {
                stats.TotalQuizzes = results.Count;
                stats.AverageScore = results.Average(r => r.Percentage);
                stats.BestScore = results.Max(r => r.Percentage);

                var totalSeconds = results.Sum(r => r.TimeTakenSeconds);
                var totalHours = totalSeconds / 3600;
                var remainingMinutes = (totalSeconds % 3600) / 60;

                if (totalHours > 0)
                {
                    stats.TotalTimeSpent = $"{totalHours}h {remainingMinutes}m";
                }
                else
                {
                    stats.TotalTimeSpent = $"{remainingMinutes}m";
                }
            }
            else
            {
                stats.TotalQuizzes = 0;
                stats.AverageScore = 0;
                stats.BestScore = 0;
                stats.TotalTimeSpent = "0m";
            }

            return new MyQuizResultsDTO
            {
                Results = resultSummaries,
                Stats = stats
            };
        }

        public async Task<List<QuizProgressDTO>> GetQuizProgressAsync(int userId, int quizId)
        {
            var results = await _context.UserQuizResults
                .Include(r => r.Quiz)
                    .ThenInclude(q => q.Questions)
                .Where(r => r.UserId == userId && r.QuizId == quizId)
                .OrderBy(r => r.CompletionDate)
                .ToListAsync();

            var progressData = new List<QuizProgressDTO>();
            var maxPoints = results.FirstOrDefault()?.Quiz.Questions.Sum(q => q.Points) ?? 0;

            for (int i = 0; i < results.Count; i++)
            {
                var result = results[i];
                progressData.Add(new QuizProgressDTO
                {
                    AttemptNumber = i + 1,
                    Score = result.Score,
                    MaxPoints = maxPoints,
                    Percentage = result.Percentage,
                    Date = result.CompletionDate
                });
            }

            return progressData;
        }

        public async Task<QuizRankingsDTO?> GetQuizRankingsAsync(int quizId)
        {
            // Get quiz information
            var quiz = await _context.Quizzes
                .Include(q => q.Category)
                .FirstOrDefaultAsync(q => q.Id == quizId);

            if (quiz == null)
                return null;

            // Get all results for this quiz with user information
            var allResults = await _context.UserQuizResults
                .Include(r => r.User)
                .Where(r => r.QuizId == quizId)
                .OrderByDescending(r => r.CompletionDate) 
                .ToListAsync();

            // Create rankings with rank numbers
            var rankings = allResults.Select((result, index) => new UserRankingDTO
            {
                UserId = result.UserId,
                Username = result.User.Username,
                Email = result.User.Email,
                ProfilePicture = Convert.ToBase64String(result.User.Image),
                Score = result.Score,
                TimeTakenSeconds = result.TimeTakenSeconds,
                CompletionDate = result.CompletionDate,
                Rank = index + 1
            }).ToList();

            return new QuizRankingsDTO
            {
                Quiz = new QuizInfoDTO
                {
                    Id = quiz.Id,
                    Name = quiz.Name,
                    Description = quiz.Description,
                    Category = quiz.Category.Name,
                    Difficulty = quiz.Difficulty.ToString(),
                    NumberOfQuestions = quiz.NumberOfQuestions,
                    TimeLimitMinutes = quiz.TimeLimitMinutes
                },
                Rankings = rankings
            };
        }
    }
}

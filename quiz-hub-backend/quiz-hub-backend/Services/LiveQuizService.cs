using quiz_hub_backend.DTO;
using quiz_hub_backend.Interfaces;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text.Json;
using System.Text;
using quiz_hub_backend.Middleware;

namespace quiz_hub_backend.Services
{
    public class LiveQuizService : ILiveQuizService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<LiveQuizService> _logger;
        private readonly IUserService _userService;

        // In-memory storage for live quiz sessions
        private static readonly ConcurrentDictionary<string, LiveQuizSession> _liveQuizzes = new();

        public LiveQuizService(AppDbContext context, ILogger<LiveQuizService> logger, IUserService userService)
        {
            _context = context;
            _logger = logger;
            _userService = userService;
        }

        public async Task<LiveQuizResponseDTO> CreateLiveQuizAsync(LiveQuizCreateRequestDTO request, int adminId)
        {
            try
            {
                var existingActiveQuiz = _liveQuizzes.Values
                .FirstOrDefault(q => q.Status == LiveQuizStatus.Waiting);

                if (existingActiveQuiz != null)
                {
                    throw new InvalidOperationException("Another live quiz is already active. Only one live quiz can be active at a time.");
                }

                // Validate admin user exists using UserService
                var admin = await _userService.GetUserByIdAsync(adminId);
                if (admin == null)
                {
                    throw new InvalidOperationException("Admin user not found");
                }

                // Generate unique quiz ID
                var quizId = Guid.NewGuid().ToString();

                // Create live quiz session
                var liveQuizSession = new LiveQuizSession
                {
                    QuizId = quizId,
                    Name = request.Name,
                    Description = request.Description,
                    CategoryId = request.CategoryId,
                    AdminId = adminId,
                    Questions = request.Questions,
                    Participants = new List<LiveQuizParticipantDTO>(),
                    Status = LiveQuizStatus.Waiting,
                    CreatedAt = DateTime.UtcNow
                };

                _liveQuizzes.TryAdd(quizId, liveQuizSession);

                _logger.LogInformation($"Live quiz created: {quizId} by admin: {adminId}");

                return new LiveQuizResponseDTO
                {
                    QuizId = quizId,
                    Message = "Live quiz created successfully",
                    Success = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating live quiz: {ex.Message}");
                throw;
            }
        }

        public async Task<LiveQuizResponseDTO> JoinLiveQuizAsync(string quizId, int userId)
        {
            try
            {
                if (!_liveQuizzes.TryGetValue(quizId, out var liveQuiz))
                {
                    throw new InvalidOperationException("Live quiz not found");
                }
                if (liveQuiz.AdminId == userId)
                {
                    throw new InvalidOperationException("Admin cannot join their own quiz as a participant");
                }

                if (liveQuiz.Status != LiveQuizStatus.Waiting)
                {
                    throw new InvalidOperationException("Cannot join quiz - quiz is not in waiting state");
                }

                if (liveQuiz.Participants.Count >= 4)
                {
                    throw new InvalidOperationException("Quiz is full - maximum 4 participants allowed");
                }

                if (liveQuiz.Participants.Any(p => p.UserId == userId))
                {
                    throw new InvalidOperationException("User is already in the quiz");
                }

                // Get user details using UserService
                var userDto = await _userService.GetUserByIdAsync(userId);
                if (userDto == null)
                {
                    throw new InvalidOperationException("User not found");
                }

                // Add participant using UserService data
                var participant = new LiveQuizParticipantDTO
                {
                    UserId = userId,
                    Username = userDto.Username,
                    ProfilePicture = !string.IsNullOrEmpty(userDto.ProfilePicture)
                        ? $"data:image/jpeg;base64,{userDto.ProfilePicture}"
                        : "/api/placeholder/40/40",
                    JoinedAt = DateTime.UtcNow
                };

                liveQuiz.Participants.Add(participant);

                _logger.LogInformation($"User {userId} joined live quiz: {quizId}");

                return new LiveQuizResponseDTO
                {
                    QuizId = quizId,
                    Message = "Successfully joined live quiz",
                    Success = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error joining live quiz: {ex.Message}");
                throw;
            }
        }

        public async Task<LiveQuizResponseDTO> LeaveLiveQuizAsync(string quizId, int userId)
        {
            try
            {
                if (!_liveQuizzes.TryGetValue(quizId, out var liveQuiz))
                {
                    throw new InvalidOperationException("Live quiz not found");
                }

                var participant = liveQuiz.Participants.FirstOrDefault(p => p.UserId == userId);
                if (participant == null)
                {
                    throw new InvalidOperationException("User is not in the quiz");
                }

                liveQuiz.Participants.Remove(participant);

                _logger.LogInformation($"User {userId} left live quiz: {quizId}");

                return new LiveQuizResponseDTO
                {
                    QuizId = quizId,
                    Message = "Successfully left live quiz",
                    Success = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error leaving live quiz: {ex.Message}");
                throw;
            }
        }

        public async Task<LiveQuizResponseDTO> CancelLiveQuizAsync(string quizId, int adminId)
        {
            try
            {
                if (!_liveQuizzes.TryGetValue(quizId, out var liveQuiz))
                {
                    throw new InvalidOperationException("Live quiz not found");
                }

                if (liveQuiz.AdminId != adminId)
                {
                    throw new UnauthorizedAccessException("Only the quiz admin can cancel the quiz");
                }

                liveQuiz.Status = LiveQuizStatus.Cancelled;

                // Remove quiz after a short delay to allow clients to process cancellation
                _ = Task.Run(async () =>
                {
                    await Task.Delay(5000); // 5 second delay
                    _liveQuizzes.TryRemove(quizId, out _);
                });

                _logger.LogInformation($"Live quiz cancelled: {quizId} by admin: {adminId}");

                return new LiveQuizResponseDTO
                {
                    QuizId = quizId,
                    Message = "Live quiz cancelled successfully",
                    Success = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error cancelling live quiz: {ex.Message}");
                throw;
            }
        }

        public async Task<LiveQuizRoomDTO> GetLiveQuizRoomAsync(string quizId, int userId)
        {
            try
            {
                if (!_liveQuizzes.TryGetValue(quizId, out var liveQuiz))
                {
                    throw new InvalidOperationException("Live quiz not found");
                }

                bool canView = liveQuiz.AdminId == userId ||
                              liveQuiz.Participants.Any(p => p.UserId == userId) ||
                              liveQuiz.Status == LiveQuizStatus.Waiting;

                if (!canView && userId != 0) // userId 0 is used for internal calls
                {
                    throw new UnauthorizedAccessException("You don't have permission to view this quiz room");
                }

                return new LiveQuizRoomDTO
                {
                    QuizId = liveQuiz.QuizId,
                    Name = liveQuiz.Name,
                    Description = liveQuiz.Description,
                    AdminId = liveQuiz.AdminId,
                    Participants = liveQuiz.Participants,
                    Questions = liveQuiz.Questions,
                    Status = liveQuiz.Status
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting live quiz room: {ex.Message}");
                throw;
            }
        }

        // Add a method to get quiz room without user permission check (for internal use)
        public async Task<LiveQuizRoomDTO> GetLiveQuizRoomInternalAsync(string quizId)
        {
            return await GetLiveQuizRoomAsync(quizId, 0);
        }

        public async Task<List<LiveQuizParticipantDTO>> GetParticipantsAsync(string quizId)
        {
            if (_liveQuizzes.TryGetValue(quizId, out var liveQuiz))
            {
                return liveQuiz.Participants;
            }
            return new List<LiveQuizParticipantDTO>();
        }

        public async Task<bool> IsUserInQuizAsync(string quizId, int userId)
        {
            if (_liveQuizzes.TryGetValue(quizId, out var liveQuiz))
            {
                return liveQuiz.Participants.Any(p => p.UserId == userId);
            }
            return false;
        }

        public async Task<bool> IsQuizAdminAsync(string quizId, int adminId)
        {
            if (_liveQuizzes.TryGetValue(quizId, out var liveQuiz))
            {
                return liveQuiz.AdminId == adminId;
            }
            return false;
        }

        public async Task<LiveQuizRoomDTO?> GetCurrentActiveLiveQuizAsync()
        {
            var activeQuiz = _liveQuizzes.Values
                .FirstOrDefault(quiz => quiz.Status == LiveQuizStatus.Waiting || quiz.Status == LiveQuizStatus.InProgress);

            if (activeQuiz == null)
                return null;

            return new LiveQuizRoomDTO
            {
                QuizId = activeQuiz.QuizId,
                Name = activeQuiz.Name,
                Description = activeQuiz.Description,
                AdminId = activeQuiz.AdminId,
                Participants = activeQuiz.Participants,
                Questions = activeQuiz.Questions,
                Status = activeQuiz.Status
            };
        }

        public async Task<LiveQuizResponseDTO> StartLiveQuizAsync(string quizId, int adminId)
        {
            try
            {
                if (!_liveQuizzes.TryGetValue(quizId, out var liveQuiz))
                {
                    throw new InvalidOperationException("Live quiz not found");
                }

                if (liveQuiz.AdminId != adminId)
                {
                    throw new UnauthorizedAccessException("Only the quiz admin can start the quiz");
                }

                if (liveQuiz.Status != LiveQuizStatus.Waiting)
                {
                    throw new InvalidOperationException("Quiz is not in waiting state");
                }

                // Initialize quiz gameplay
                liveQuiz.Status = LiveQuizStatus.InProgress;
                liveQuiz.CurrentQuestionIndex = 0;
                liveQuiz.QuestionStartTime = DateTime.UtcNow;
                liveQuiz.QuestionAnswers = new List<LiveQuizAnswerDTO>();

                // Initialize participant scores
                foreach (var participant in liveQuiz.Participants)
                {
                    participant.Score = 0;
                }

                _logger.LogInformation($"Live quiz started: {quizId} by admin: {adminId}");

                return new LiveQuizResponseDTO
                {
                    QuizId = quizId,
                    Message = "Live quiz started successfully",
                    Success = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error starting live quiz: {ex.Message}");
                throw;
            }
        }

        public async Task<LiveQuizResponseDTO> SubmitAnswerAsync(string quizId, int userId, LiveQuizSubmitAnswerDTO answerDto)
        {
            try
            {
                _logger.LogInformation($"=== SUBMIT ANSWER BACKEND DEBUG ===");
                _logger.LogInformation($"QuizId: {quizId}");
                _logger.LogInformation($"UserId: {userId}");
                _logger.LogInformation($"IsDoNotKnow: {answerDto.IsDoNotKnow}");
                _logger.LogInformation($"Answer count: {answerDto.Answer?.Count ?? 0}");
                _logger.LogInformation($"Answer values: [{string.Join(", ", answerDto.Answer?.Select(a => $"'{a}' ({a?.GetType().Name})") ?? new string[0])}]");
                if (!_liveQuizzes.TryGetValue(quizId, out var liveQuiz))
                {
                    throw new InvalidOperationException("Live quiz not found");
                }

                if (liveQuiz.Status != LiveQuizStatus.InProgress)
                {
                    throw new InvalidOperationException("Quiz is not in progress");
                }

                // Check if user already answered this question
                if (liveQuiz.QuestionAnswers.Any(a => a.UserId == userId && a.QuestionIndex == liveQuiz.CurrentQuestionIndex))
                {
                    throw new InvalidOperationException("You have already answered this question");
                }

                var participant = liveQuiz.Participants.FirstOrDefault(p => p.UserId == userId);
                if (participant == null)
                {
                    throw new InvalidOperationException("User is not a participant in this quiz");
                }

                var currentQuestion = liveQuiz.Questions[liveQuiz.CurrentQuestionIndex];
                var answerTime = DateTime.UtcNow;

                int correctAnswerOrder = 0;

                if (!answerDto.IsDoNotKnow)
                {
                    
                    correctAnswerOrder = liveQuiz.QuestionAnswers
                        .Count(a => a.QuestionIndex == liveQuiz.CurrentQuestionIndex && !a.IsDoNotKnow);
                }

                // Calculate points based on answer correctness and speed
                int points = CalculatePoints(currentQuestion, answerDto, liveQuiz.QuestionAnswers.Count(a => a.QuestionIndex == liveQuiz.CurrentQuestionIndex));
                _logger.LogInformation($"CalculatePoints returned: {points}");
                // Record the answer
                var answer = new LiveQuizAnswerDTO
                {
                    UserId = userId,
                    QuestionIndex = liveQuiz.CurrentQuestionIndex,
                    Answer = answerDto.Answer,
                    AnsweredAt = answerTime,
                    Points = points,
                    IsDoNotKnow = answerDto.IsDoNotKnow
                };

                liveQuiz.QuestionAnswers.Add(answer);
                participant.Score += points;

                var currentQuestionAnswers = liveQuiz.QuestionAnswers
              .Count(a => a.QuestionIndex == liveQuiz.CurrentQuestionIndex);

                var totalParticipants = liveQuiz.Participants.Count;

                _logger.LogInformation($"Question {liveQuiz.CurrentQuestionIndex}: {currentQuestionAnswers}/{totalParticipants} participants answered");

                // If all participants have answered, automatically move to next question
                if (currentQuestionAnswers >= totalParticipants)
                {
                    _logger.LogInformation($"All participants answered, moving to next question");

                    // Move to next question
                    liveQuiz.CurrentQuestionIndex++;

                    if (liveQuiz.CurrentQuestionIndex >= liveQuiz.Questions.Count)
                    {
                        // Quiz completed
                        liveQuiz.Status = LiveQuizStatus.Completed;
                        liveQuiz.CompletedAt = DateTime.UtcNow;
                        _logger.LogInformation($"Quiz {quizId} completed");

                        // Broadcast completion immediately
                        _ = Task.Run(async () =>
                        {
                            await Task.Delay(1000);
                            var gameStateForBroadcast = await GetGameStateAsync(quizId, 0);
                            var completionMessage = new
                            {
                                Type = "QUIZ_COMPLETED",
                                Payload = new { quizId = quizId, gameState = gameStateForBroadcast }
                            };
                            await LiveQuizWebSocketMiddleware.BroadcastToAll(completionMessage);
                        });
                    }
                    else
                    {
                        // Reset for next question
                        liveQuiz.QuestionStartTime = DateTime.UtcNow;
                        _logger.LogInformation($"Moving to question {liveQuiz.CurrentQuestionIndex + 1}");

                        // Broadcast next question immediately
                        _ = Task.Run(async () =>
                        {
                            await Task.Delay(1000);
                            var gameStateForBroadcast = await GetGameStateAsync(quizId, 0);

                            // Add this logging:
                            _logger.LogInformation($"Broadcasting next question - Current index: {gameStateForBroadcast.CurrentQuestionIndex}");
                            _logger.LogInformation($"Broadcasting next question - Status: {gameStateForBroadcast.Status}");
                            _logger.LogInformation($"Broadcasting next question - Has current question: {gameStateForBroadcast.CurrentQuestion != null}");

                            var nextQuestionMessage = new
                            {
                                Type = "NEXT_QUESTION",
                                Payload = new
                                {
                                    quizId = quizId,
                                    gameState = gameStateForBroadcast
                                }
                            };

                            _logger.LogInformation($"Message payload: {JsonSerializer.Serialize(nextQuestionMessage)}");

                            await LiveQuizWebSocketMiddleware.BroadcastToAll(nextQuestionMessage);
                        });
                    }
                }

                return new LiveQuizResponseDTO
                {
                    QuizId = quizId,
                    Message = "Answer submitted successfully",
                    Success = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error submitting answer: {ex.Message}");
                throw;
            }
        }
        public async Task<LiveQuizResponseDTO> NextQuestionAsync(string quizId, int adminId)
        {
            try
            {
                if (!_liveQuizzes.TryGetValue(quizId, out var liveQuiz))
                {
                    throw new InvalidOperationException("Live quiz not found");
                }

                if (liveQuiz.AdminId != adminId)
                {
                    throw new UnauthorizedAccessException("Only the quiz admin can move to next question");
                }

                if (liveQuiz.Status != LiveQuizStatus.InProgress)
                {
                    throw new InvalidOperationException("Quiz is not in progress");
                }

                // Move to next question
                liveQuiz.CurrentQuestionIndex++;
                _logger.LogInformation($"Updated CurrentQuestionIndex to: {liveQuiz.CurrentQuestionIndex}");


                if (liveQuiz.CurrentQuestionIndex >= liveQuiz.Questions.Count)
                {
                    // Quiz completed
                    liveQuiz.Status = LiveQuizStatus.Completed;
                    liveQuiz.CompletedAt = DateTime.UtcNow;

                    return new LiveQuizResponseDTO
                    {
                        QuizId = quizId,
                        Message = "Quiz completed",
                        Success = true
                    };
                }
                else
                {

                    // Reset for next question
                    liveQuiz.QuestionStartTime = DateTime.UtcNow;
                    _logger.LogInformation($"Set new question start time, moving to question {liveQuiz.CurrentQuestionIndex + 1} (index {liveQuiz.CurrentQuestionIndex})");

                    // Verify the state before broadcasting
                    _logger.LogInformation($"Quiz state before broadcast - Index: {liveQuiz.CurrentQuestionIndex}, Total: {liveQuiz.Questions.Count}");
                    return new LiveQuizResponseDTO
                    {
                        QuizId = quizId,
                        Message = "Moved to next question",
                        Success = true
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error moving to next question: {ex.Message}");
                throw;
            }
        }

        private object ConvertJsonValue(object value)
        {
            if (value is System.Text.Json.JsonElement jsonElement)
            {
                return jsonElement.ValueKind switch
                {
                    JsonValueKind.True => true,
                    JsonValueKind.False => false,
                    JsonValueKind.Number => jsonElement.TryGetInt32(out int intVal) ? intVal : jsonElement.GetDouble(),
                    JsonValueKind.String => jsonElement.GetString(),
                    _ => jsonElement.ToString()
                };
            }
            return value;
        }
        private int CalculatePoints(LiveQuizQuestionDTO question, LiveQuizSubmitAnswerDTO answerDto, int answerOrder)
        {
            _logger.LogInformation($"Calculating points for question type: {question.Type}");
            _logger.LogInformation($"User answer: [{string.Join(", ", answerDto.Answer?.Select(a => $"'{a}' ({a?.GetType().Name})") ?? new string[0])}]");

            if (answerDto.IsDoNotKnow)
            {
                _logger.LogInformation("User selected 'Don't Know' - returning 0 points");
                return 0;
            }

            // NORMALIZE THE CORRECT ANSWERS FIRST (same logic as GetGameStateAsync)
            var normalizedCorrectAnswers = new List<object>();

            if (question.CorrectAnswers != null && question.CorrectAnswers.Any())
            {
                // Use the existing CorrectAnswers array and convert JsonElements
                normalizedCorrectAnswers.AddRange(question.CorrectAnswers.Where(ca => ca != null).Select(ConvertJsonValue));
                _logger.LogInformation($"Using CorrectAnswers array: [{string.Join(", ", normalizedCorrectAnswers)}]");
            }
            else
            {
                // Fallback to individual properties only if CorrectAnswers is empty
                _logger.LogInformation("CorrectAnswers array is empty, falling back to individual properties");

                switch (question.Type?.ToLower())
                {
                    case "truefalse":
                    case "truefalsequestion":
                        if (question.CorrectAnswerBool.HasValue)
                        {
                            normalizedCorrectAnswers.Add(question.CorrectAnswerBool.Value);
                        }
                        break;

                    case "textinput":
                    case "textinputquestion":
                        if (!string.IsNullOrEmpty(question.CorrectAnswerText))
                        {
                            normalizedCorrectAnswers.Add(question.CorrectAnswerText);
                        }
                        break;

                    case "singlechoice":
                    case "singlechoicequestion":
                        if (question.CorrectAnswer.HasValue)
                        {
                            normalizedCorrectAnswers.Add(question.CorrectAnswer.Value);
                        }
                        break;

                    case "multiplechoice":
                    case "multiplechoicequestion":
                    case "multipleanswerquestion":
                        // Should always have CorrectAnswers array
                        break;
                }

                _logger.LogInformation($"Using fallback properties: [{string.Join(", ", normalizedCorrectAnswers)}]");
            }

            _logger.LogInformation($"Final correct answers for scoring: [{string.Join(", ", normalizedCorrectAnswers)}]");

            if (!normalizedCorrectAnswers.Any())
            {
                _logger.LogError("No correct answers found for scoring!");
                return -1;
            }

            bool isCorrect = false;

            switch (question.Type?.ToLower())
            {
                case "singlechoice":
                case "singlechoicequestion":
                    if (answerDto.Answer.Count == 1)
                    {
                        try
                        {
                            var userAnswerValue = ConvertJsonValue(answerDto.Answer[0]);
                            var singleChoiceAnswer = Convert.ToInt32(userAnswerValue);
                            var singleChoiceCorrect = normalizedCorrectAnswers
                                .Select(ca => Convert.ToInt32(ca))
                                .ToList();
                            isCorrect = singleChoiceCorrect.Contains(singleChoiceAnswer);
                            _logger.LogInformation($"Single choice - User: {singleChoiceAnswer}, Correct: [{string.Join(", ", singleChoiceCorrect)}], Match: {isCorrect}");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Error processing single choice answer: {ex.Message}");
                            return -1;
                        }
                    }
                    break;

                case "multiplechoice":
                case "multiplechoicequestion":
                    if (answerDto.Answer.Count > 0)
                    {
                        try
                        {
                            var multipleChoiceAnswers = answerDto.Answer
                                .Select(a => Convert.ToInt32(ConvertJsonValue(a)))
                                .OrderBy(x => x)
                                .ToList();
                            var multipleChoiceCorrect = normalizedCorrectAnswers
                                .Select(ca => Convert.ToInt32(ca))
                                .OrderBy(x => x)
                                .ToList();
                            isCorrect = multipleChoiceAnswers.Count == multipleChoiceCorrect.Count &&
                                       multipleChoiceAnswers.SequenceEqual(multipleChoiceCorrect);
                            _logger.LogInformation($"Multiple choice - User: [{string.Join(", ", multipleChoiceAnswers)}], Correct: [{string.Join(", ", multipleChoiceCorrect)}], Match: {isCorrect}");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Error processing multiple choice answer: {ex.Message}");
                            return -1;
                        }
                    }
                    break;

                case "truefalse":
                case "truefalsequestion":
                    if (answerDto.Answer.Count == 1)
                    {
                        try
                        {
                            var userAnswerValue = ConvertJsonValue(answerDto.Answer[0]);
                            var trueFalseAnswer = Convert.ToBoolean(userAnswerValue);
                            var trueFalseCorrect = normalizedCorrectAnswers
                                .Select(ca => Convert.ToBoolean(ca))
                                .ToList();
                            isCorrect = trueFalseCorrect.Contains(trueFalseAnswer);
                            _logger.LogInformation($"True/False - User: {trueFalseAnswer}, Correct: [{string.Join(", ", trueFalseCorrect)}], Match: {isCorrect}");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Error processing true/false answer: {ex.Message}");
                            return -1;
                        }
                    }
                    break;

                case "textinput":
                case "textinputquestion":
                    if (answerDto.Answer.Count > 0)
                    {
                        try
                        {
                            var userAnswerValue = ConvertJsonValue(answerDto.Answer[0]);
                            var textInputAnswer = userAnswerValue?.ToString()?.Trim().ToLower();
                            if (!string.IsNullOrEmpty(textInputAnswer))
                            {
                                isCorrect = normalizedCorrectAnswers
                                    .Any(ca => ca?.ToString()?.Trim().ToLower() == textInputAnswer);
                                _logger.LogInformation($"Text input - User: '{textInputAnswer}', Correct answers: [{string.Join(", ", normalizedCorrectAnswers.Select(ca => $"'{ca?.ToString()?.Trim().ToLower()}'"))}], Match: {isCorrect}");
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Error processing text input answer: {ex.Message}");
                            return -1;
                        }
                    }
                    break;

                default:
                    _logger.LogWarning($"Unknown question type: {question.Type}");
                    return -1;
            }

            _logger.LogInformation($"Answer is correct: {isCorrect}");

            if (!isCorrect)
            {
                _logger.LogInformation("Incorrect answer - returning -1 points");
                return -1;
            }

            // Award points based on correct answer order (excluding "Don't Know" answers)
            int points = answerOrder switch
            {
                0 => 5, // First correct answer
                1 => 3, // Second correct answer  
                2 => 2, // Third correct answer
                3 => 1, // Fourth correct answer
                _ => 0  // Beyond 4th correct answer
            };

            _logger.LogInformation($"Correct answer in position {answerOrder} - awarding {points} points");
            return points;
        }

        public async Task<LiveQuizGameStateDTO> GetGameStateAsync(string quizId, int userId)
        {
            try
            {
                if (!_liveQuizzes.TryGetValue(quizId, out var liveQuiz))
                {
                    throw new InvalidOperationException("Live quiz not found");
                }

                // Check if user can view this quiz
                bool canView = userId == 0 || // Internal call
                       liveQuiz.AdminId == userId ||
                       liveQuiz.Participants.Any(p => p.UserId == userId);
                if (!canView)
                {
                    throw new UnauthorizedAccessException("You don't have permission to view this quiz");
                }

                // Normalize the current question if it exists
                LiveQuizQuestionDTO currentQuestion = null;
                if (liveQuiz.Status == LiveQuizStatus.InProgress && liveQuiz.CurrentQuestionIndex < liveQuiz.Questions.Count)
                {
                    var originalQuestion = liveQuiz.Questions[liveQuiz.CurrentQuestionIndex];

                    // Debug the original question
                    _logger.LogInformation($"Original question - Type: {originalQuestion.Type}");
                    _logger.LogInformation($"Original question - CorrectAnswerText: {originalQuestion.CorrectAnswerText}");
                    _logger.LogInformation($"Original question - CorrectAnswerBool: {originalQuestion.CorrectAnswerBool}");
                    _logger.LogInformation($"Original question - CorrectAnswer: {originalQuestion.CorrectAnswer}");
                    _logger.LogInformation($"Original question - CorrectAnswers: {(originalQuestion.CorrectAnswers != null ? string.Join(", ", originalQuestion.CorrectAnswers.Where(ca => ca != null)) : "null")}");
                    _logger.LogInformation($"Original question - TimeToAnswer: {originalQuestion.TimeToAnswer}");

                    // The correct answers are already populated in the CorrectAnswers array by the frontend
                    // So we use them directly first, then fallback to individual properties
                    var normalizedCorrectAnswers = new List<object>();

                    if (originalQuestion.CorrectAnswers != null && originalQuestion.CorrectAnswers.Any())
                    {
                        // Use the existing CorrectAnswers array - it already contains the right data
                        normalizedCorrectAnswers.AddRange(originalQuestion.CorrectAnswers.Where(ca => ca != null));
                        _logger.LogInformation($"Using CorrectAnswers array: [{string.Join(", ", normalizedCorrectAnswers)}]");
                    }
                    else
                    {
                        // Fallback to individual properties only if CorrectAnswers is empty
                        _logger.LogInformation("CorrectAnswers array is empty, falling back to individual properties");

                        switch (originalQuestion.Type?.ToLower())
                        {
                            case "truefalse":
                            case "truefalsequestion":
                                if (originalQuestion.CorrectAnswerBool.HasValue)
                                {
                                    normalizedCorrectAnswers.Add(originalQuestion.CorrectAnswerBool.Value);
                                }
                                break;

                            case "textinput":
                            case "textinputquestion":
                                if (!string.IsNullOrEmpty(originalQuestion.CorrectAnswerText))
                                {
                                    normalizedCorrectAnswers.Add(originalQuestion.CorrectAnswerText);
                                }
                                break;

                            case "singlechoice":
                            case "singlechoicequestion":
                                if (originalQuestion.CorrectAnswer != null)
                                {
                                    normalizedCorrectAnswers.Add(originalQuestion.CorrectAnswer);
                                }
                                break;

                            case "multiplechoice":
                            case "multiplechoicequestion":
                            case "multipleanswerquestion":
                                // This case should always have CorrectAnswers array populated
                                break;
                        }

                        _logger.LogInformation($"Using fallback properties: [{string.Join(", ", normalizedCorrectAnswers)}]");
                    }

                    _logger.LogInformation($"Final normalized correct answers: [{string.Join(", ", normalizedCorrectAnswers)}]");

                    if (normalizedCorrectAnswers.Count == 0)
                    {
                        _logger.LogError($"No correct answers found for question type {originalQuestion.Type}! This will cause all answers to score -1.");
                    }

                    // Determine timer value
                    int timerValue = 30; // default
                    if (originalQuestion.TimeToAnswer > 0)
                    {
                        timerValue = originalQuestion.TimeToAnswer;
                    }

                    _logger.LogInformation($"Setting timer to: {timerValue} seconds");

                    currentQuestion = new LiveQuizQuestionDTO
                    {
                        Text = originalQuestion.Text,
                        Type = originalQuestion.Type,
                        Options = originalQuestion.Options,
                        CorrectAnswers = normalizedCorrectAnswers,
                        Timer = timerValue,
                        TimeToAnswer = timerValue // Also set this for compatibility
                    };
                }

                return new LiveQuizGameStateDTO
                {
                    QuizId = liveQuiz.QuizId,
                    Status = liveQuiz.Status,
                    CurrentQuestionIndex = liveQuiz.CurrentQuestionIndex,
                    CurrentQuestion = currentQuestion,
                    Participants = liveQuiz.Participants.OrderByDescending(p => p.Score).ToList(),
                    TotalQuestions = liveQuiz.Questions.Count,
                    QuestionStartTime = liveQuiz.QuestionStartTime,
                    UserHasAnswered = userId > 0 ? liveQuiz.QuestionAnswers.Any(a => a.UserId == userId && a.QuestionIndex == liveQuiz.CurrentQuestionIndex) : false
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting game state: {ex.Message}");
                throw;
            }
        }
    }

    // Internal class for managing live quiz sessions
    internal class LiveQuizSession
    {
        public string QuizId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public int AdminId { get; set; }
        public List<LiveQuizQuestionDTO> Questions { get; set; }
        public List<LiveQuizParticipantDTO> Participants { get; set; }
        public LiveQuizStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CurrentQuestionIndex { get; set; }
        public DateTime? QuestionStartTime { get; set; }
        public List<LiveQuizAnswerDTO> QuestionAnswers { get; set; } = new();
        public DateTime? CompletedAt { get; set; }
    }
}
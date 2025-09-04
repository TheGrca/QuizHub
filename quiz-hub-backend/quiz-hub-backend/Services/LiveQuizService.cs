using quiz_hub_backend.DTO;
using quiz_hub_backend.Interfaces;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text.Json;
using System.Text;

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
                .FirstOrDefault(quiz => quiz.Status == LiveQuizStatus.Waiting);

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
    }
}
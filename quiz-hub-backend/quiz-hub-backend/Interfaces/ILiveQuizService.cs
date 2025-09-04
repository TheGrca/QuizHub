using quiz_hub_backend.DTO;
using System.Net.WebSockets;

namespace quiz_hub_backend.Interfaces
{
    public interface ILiveQuizService
    {
        Task<LiveQuizResponseDTO> CreateLiveQuizAsync(LiveQuizCreateRequestDTO request, int adminId);
        Task<LiveQuizResponseDTO> JoinLiveQuizAsync(string quizId, int userId);
        Task<LiveQuizResponseDTO> LeaveLiveQuizAsync(string quizId, int userId);
        Task<LiveQuizResponseDTO> CancelLiveQuizAsync(string quizId, int adminId);
        Task<LiveQuizRoomDTO> GetLiveQuizRoomAsync(string quizId, int userId);
        Task<LiveQuizRoomDTO> GetLiveQuizRoomInternalAsync(string quizId);
        Task<List<LiveQuizParticipantDTO>> GetParticipantsAsync(string quizId);
        Task<bool> IsUserInQuizAsync(string quizId, int userId);
        Task<bool> IsQuizAdminAsync(string quizId, int adminId);
        Task<LiveQuizRoomDTO?> GetCurrentActiveLiveQuizAsync();
    }
}

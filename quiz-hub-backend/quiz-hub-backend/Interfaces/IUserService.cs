using quiz_hub_backend.DTO;

namespace quiz_hub_backend.Interfaces
{
    public interface IUserService
    {
        Task<List<QuizListDTO>> GetAllQuizzesAsync(QuizFilterDTO? filters = null);
        Task<List<CategoryDTO>> GetCategoriesAsync();
        Task<QuizResponseDTO?> GetQuizByIdAsync(int quizId);
        Task<QuizSubmissionResultDTO> SubmitQuizAsync(int userId, QuizSubmissionDTO submission);
        Task<QuizResultDetailDTO?> GetQuizResultAsync(int resultId, int userId);
        Task<MyQuizResultsDTO> GetMyQuizResultsAsync(int userId);
        Task<List<QuizProgressDTO>> GetQuizProgressAsync(int userId, int quizId);
        Task<QuizRankingsDTO?> GetQuizRankingsAsync(int quizId);
    }
}

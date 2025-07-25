using quiz_hub_backend.DTO;

namespace quiz_hub_backend.Interfaces
{
    public interface IAdminService
    {
        Task<QuizResponseDTO> CreateQuizAsync(CreateQuizDTO createQuizDto);
        Task<List<CategoryDTO>> GetCategoriesAsync();
        Task<List<QuizResponseDTO>> GetAllQuizzesAsync();
        Task<QuizResponseDTO?> GetQuizByIdAsync(int quizId);
        Task<bool> UpdateQuizAsync(int quizId, CreateQuizDTO updateQuizDto);
        Task<bool> DeleteQuizAsync(int quizId);
    }
}

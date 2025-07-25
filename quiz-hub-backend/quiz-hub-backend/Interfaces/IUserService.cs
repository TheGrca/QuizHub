using quiz_hub_backend.DTO;

namespace quiz_hub_backend.Interfaces
{
    public interface IUserService
    {
        Task<List<QuizListDTO>> GetAllQuizzesAsync(QuizFilterDTO? filters = null);
        Task<List<CategoryDTO>> GetCategoriesAsync();
        Task<QuizResponseDTO?> GetQuizByIdAsync(int quizId);
    }
}

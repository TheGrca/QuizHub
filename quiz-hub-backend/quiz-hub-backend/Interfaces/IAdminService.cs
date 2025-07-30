using quiz_hub_backend.DTO;

namespace quiz_hub_backend.Interfaces
{
    public interface IAdminService
    {
        Task<QuizResponseDTO> CreateQuizAsync(CreateQuizDTO createQuizDto);
        Task<List<CategoryDTO>> GetCategoriesAsync();
        Task<List<QuizResponseDTO>> GetAllQuizzesAsync();
        Task<QuizResponseDTO?> GetQuizByIdAsync(int quizId);

        //Methods for edit page
        Task<QuizEditDetailDTO?> GetQuizForEditAsync(int quizId);
        Task<bool> UpdateQuizWithEditAsync(int quizId, EditQuizDTO editQuizDto);
        Task<bool> DeleteQuizAndAllDataAsync(int quizId);


        //Results
        Task<List<UserSummaryDTO>> GetAllUsersAsync();
        Task<UserDetailResultsDTO?> GetUserResultsAsync(int userId);
    }
}

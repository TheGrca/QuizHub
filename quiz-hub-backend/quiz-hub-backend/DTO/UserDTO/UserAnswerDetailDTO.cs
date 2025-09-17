namespace quiz_hub_backend.DTO
{
    public class UserAnswerDetailDTO
    {
        public string AnswerType { get; set; }
        public int? SelectedOptionIndex { get; set; }
        public string? SelectedOptionIndices { get; set; }
        public bool? UserAnswer { get; set; }
        public string? UserAnswerText { get; set; }
    }
}

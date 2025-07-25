using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.Models
{
    public class TextInputUserAnswer : UserAnswer
    {
        [MaxLength(200)]
        public string UserAnswerText { get; set; }
    }
}

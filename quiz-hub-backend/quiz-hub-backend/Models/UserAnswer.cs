using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.Models
{
    public class UserAnswer
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("QuizResult")]
        public int UserQuizResultId { get; set; }
        public UserQuizResult QuizResult { get; set; }

        [ForeignKey("Question")]
        public int QuestionId { get; set; }
        public virtual Question Question { get; set; }

        public bool IsCorrect { get; set; }
    }
}

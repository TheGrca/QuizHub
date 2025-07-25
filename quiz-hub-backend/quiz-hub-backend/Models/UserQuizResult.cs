using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace quiz_hub_backend.Models
{
    public class UserQuizResult
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public virtual User User { get; set; }

        [ForeignKey("Quiz")]
        public int QuizId { get; set; }
        public virtual Quiz Quiz { get; set; }

        [Required]
        public DateTime CompletionDate { get; set; }

        [Required]
        public int TimeTakenSeconds { get; set; }

        [Required]
        public int Score { get; set; }

        [Required]
        public double Percentage { get; set; }

        public virtual ICollection<UserAnswer> UserAnswers { get; set; }
    }
}

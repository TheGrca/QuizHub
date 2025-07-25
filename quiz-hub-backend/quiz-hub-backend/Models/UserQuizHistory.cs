using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.Models
{
    public class UserQuizHistory
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public virtual User User { get; set; }

        [ForeignKey("Quiz")]
        public int QuizId { get; set; }
        public virtual Quiz Quiz { get; set; }

        public int AttemptCount { get; set; }
        public int BestScore { get; set; }
        public double BestPercentage { get; set; }
        public int BestTimeSeconds { get; set; }
        public DateTime LastAttemptDate { get; set; }
    }
}

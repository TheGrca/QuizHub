using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace quiz_hub_backend.Models
{
    public class GlobalRanking
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Quiz")]
        public int QuizId { get; set; }
        public virtual Quiz Quiz { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public virtual User User { get; set; }

        public int Score { get; set; }
        public int TimeTakenSeconds { get; set; }
        public DateTime CompletionDate { get; set; }
        public int Rank { get; set; }
    }
}

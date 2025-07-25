using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.Models
{
    public enum Difficulty
    {
        Easy,
        Medium,
        Hard
    }

    public class Quiz
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        [Required]
        public int NumberOfQuestions { get; set; }

        [Required]
        public Difficulty Difficulty { get; set; }

        [Required]
        public int TimeLimitMinutes { get; set; }

        [ForeignKey("Category")]
        public int CategoryId { get; set; }
        public virtual Category Category { get; set; }

        public virtual ICollection<Question> Questions { get; set; }
        public virtual ICollection<UserQuizResult> QuizResults { get; set; }
    }
}

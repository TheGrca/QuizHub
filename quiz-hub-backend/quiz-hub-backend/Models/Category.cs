using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; }

        public virtual ICollection<Quiz> Quizzes { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;

namespace quiz_hub_backend.Models
{
    public class MultipleAnswerUserAnswer : UserAnswer
    {
        [MaxLength(10)] 
        public string SelectedOptionIndices { get; set; }
    }
}

namespace quiz_hub_backend.Models
{
    public enum UserType
    {
        User,
        Admin
    }
    public class User
    {
        public int Id { get; set; } 
        public string Username { get; set; }
        public byte[] Image { get; set; }
        public string Email { get; set; }   
        public string Password { get; set; }    
        public UserType isAdmin { get; set; }
    }
}

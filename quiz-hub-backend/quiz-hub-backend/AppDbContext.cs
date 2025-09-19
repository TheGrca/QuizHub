using Microsoft.EntityFrameworkCore;
using quiz_hub_backend.Models;

namespace quiz_hub_backend
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<GlobalRanking> GlobalRankings { get; set; }
        public DbSet<MultipleAnswerQuestion> MultipleAnswerQuestions { get; set; }
        public DbSet<MultipleAnswerUserAnswer> MultipleAnswerUserAnswers { get; set; }
        public DbSet<MultipleChoiceQuestion> MultipleChoiceQuestions { get; set; }
        public DbSet<MultipleChoiceUserAnswer> MultipleChoiceUserAnswers { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<TextInputQuestion> TextInputQuestions { get; set; }
        public DbSet<TextInputUserAnswer> TextInputUserAnswers { get; set; }
        public DbSet<TrueFalseQuestion> TrueFalseQuestions { get; set; }
        public DbSet<TrueFalseUserAnswer> TrueFalseUserAnswers { get; set; }
        public DbSet<UserAnswer> UserAnswers { get; set; }
        public DbSet<UserQuizHistory> UserQuizHistory { get; set; }
        public DbSet<UserQuizResult> UserQuizResults { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserAnswer>()
                .HasOne(ua => ua.QuizResult)
                .WithMany(uqr => uqr.UserAnswers)
                .HasForeignKey(ua => ua.UserQuizResultId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserAnswer>()
                .HasOne(ua => ua.Question)
                .WithMany()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserQuizResult>()
                .HasOne(uqr => uqr.User)
                .WithMany(u => u.QuizResults)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserQuizResult>()
                .HasOne(uqr => uqr.Quiz)
                .WithMany(q => q.QuizResults)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Question>()
                .HasDiscriminator<string>("QuestionType")
                .HasValue<MultipleChoiceQuestion>("MultipleChoice")
                .HasValue<MultipleAnswerQuestion>("MultipleAnswer")
                .HasValue<TrueFalseQuestion>("TrueFalse")
                .HasValue<TextInputQuestion>("TextInput");

            modelBuilder.Entity<UserAnswer>()
                .HasDiscriminator<string>("AnswerType")
                .HasValue<MultipleChoiceUserAnswer>("MultipleChoice")
                .HasValue<MultipleAnswerUserAnswer>("MultipleAnswer")
                .HasValue<TrueFalseUserAnswer>("TrueFalse")
                .HasValue<TextInputUserAnswer>("TextInput");
                

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "Admin",
                    Email = "admin@admin.com",
                    Password = "$2a$11$myz1T0j.fuRSUwvixXDGQOcqmSENj77L9YAK5X3RnZCILqPv2cIYq", 
                    Image = new byte[0], 
                    isAdmin = UserType.Admin
                }
            );

            // Seed Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Programming" },
                new Category { Id = 2, Name = "Math" },
                new Category { Id = 3, Name = "Geography" },
                new Category { Id = 4, Name = "History" },
                new Category { Id = 5, Name = "Sport" }
            );
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace quiz_hub_backend.Migrations
{
    /// <inheritdoc />
    public partial class CreatedModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Quizzes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NumberOfQuestions = table.Column<int>(type: "int", nullable: false),
                    Difficulty = table.Column<int>(type: "int", nullable: false),
                    TimeLimitMinutes = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quizzes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quizzes_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GlobalRankings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuizId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    TimeTakenSeconds = table.Column<int>(type: "int", nullable: false),
                    CompletionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Rank = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlobalRankings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GlobalRankings_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GlobalRankings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Text = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    QuizId = table.Column<int>(type: "int", nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    QuestionType = table.Column<string>(type: "nvarchar(21)", maxLength: 21, nullable: false),
                    MultipleAnswerQuestion_Option1 = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MultipleAnswerQuestion_Option2 = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MultipleAnswerQuestion_Option3 = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MultipleAnswerQuestion_Option4 = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CorrectAnswerIndices = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Option1 = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Option2 = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Option3 = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Option4 = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CorrectAnswerIndex = table.Column<int>(type: "int", nullable: true),
                    CorrectAnswer = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TrueFalseQuestion_CorrectAnswer = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Questions_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserQuizHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    QuizId = table.Column<int>(type: "int", nullable: false),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    BestScore = table.Column<int>(type: "int", nullable: false),
                    BestPercentage = table.Column<double>(type: "float", nullable: false),
                    BestTimeSeconds = table.Column<int>(type: "int", nullable: false),
                    LastAttemptDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserQuizHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserQuizHistory_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserQuizHistory_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserQuizResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    QuizId = table.Column<int>(type: "int", nullable: false),
                    CompletionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TimeTakenSeconds = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    Percentage = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserQuizResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserQuizResults_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserQuizResults_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserQuizResultId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false),
                    AnswerType = table.Column<string>(type: "nvarchar(21)", maxLength: 21, nullable: false),
                    SelectedOptionIndices = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    SelectedOptionIndex = table.Column<int>(type: "int", nullable: true),
                    UserAnswerText = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    UserAnswer = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAnswers_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserAnswers_UserQuizResults_UserQuizResultId",
                        column: x => x.UserQuizResultId,
                        principalTable: "UserQuizResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GlobalRankings_QuizId",
                table: "GlobalRankings",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_GlobalRankings_UserId",
                table: "GlobalRankings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_QuizId",
                table: "Questions",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_Quizzes_CategoryId",
                table: "Quizzes",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAnswers_QuestionId",
                table: "UserAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAnswers_UserQuizResultId",
                table: "UserAnswers",
                column: "UserQuizResultId");

            migrationBuilder.CreateIndex(
                name: "IX_UserQuizHistory_QuizId",
                table: "UserQuizHistory",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_UserQuizHistory_UserId",
                table: "UserQuizHistory",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserQuizResults_QuizId",
                table: "UserQuizResults",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_UserQuizResults_UserId",
                table: "UserQuizResults",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GlobalRankings");

            migrationBuilder.DropTable(
                name: "UserAnswers");

            migrationBuilder.DropTable(
                name: "UserQuizHistory");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "UserQuizResults");

            migrationBuilder.DropTable(
                name: "Quizzes");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}

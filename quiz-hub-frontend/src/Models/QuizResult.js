export class QuizResult {
  constructor(data = {}) {
    this.id = data.id || data.Id || 0;
    this.quizId = data.quizId || data.QuizId || 0;
    this.quizName = data.quizName || data.QuizName || '';
    this.score = data.score || data.Score || 0;
    this.totalPoints = data.totalPoints || data.TotalPoints || 0;
    this.percentage = data.percentage || data.Percentage || 0;
    this.correctAnswers = data.correctAnswers || data.CorrectAnswers || 0;
    this.totalQuestions = data.totalQuestions || data.TotalQuestions || 0;
    this.timeTakenSeconds = data.timeTakenSeconds || data.TimeTakenSeconds || 0;
    this.completionDate = data.completionDate || data.CompletionDate || new Date();
  }

  getPercentage() {
    return this.totalPoints > 0 ? (this.score / this.totalPoints) * 100 : 0;
  }

  formatTime() {
    const minutes = Math.floor(this.timeTakenSeconds / 60);
    const remainingSeconds = this.timeTakenSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
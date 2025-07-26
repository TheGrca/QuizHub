export class Quiz {
  constructor(data = {}) {
    this.id = data.id || data.Id || 0;
    this.name = data.name || data.Name || '';
    this.description = data.description || data.Description || '';
    this.category = data.category || data.Category || '';
    this.difficulty = data.difficulty || data.Difficulty || '';
    this.numberOfQuestions = data.numberOfQuestions || data.NumberOfQuestions || 0;
    this.timeToFinish = data.timeToFinish || data.TimeLimitMinutes || 0;
  }

  getDifficultyColor() {
    switch (this.difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTimeText() {
    return `${this.timeToFinish} min`;
  }
}
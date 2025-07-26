export class Question {
  constructor(data = {}) {
    this.id = data.id || data.Id || 0;
    this.text = data.text || data.Text || '';
    this.questionType = data.questionType || data.QuestionType || '';
    this.points = data.points || data.Points || 1;
    
    // Options (for multiple choice questions)
    this.option1 = data.option1 || data.Option1 || '';
    this.option2 = data.option2 || data.Option2 || '';
    this.option3 = data.option3 || data.Option3 || '';
    this.option4 = data.option4 || data.Option4 || '';
    
    // Correct answers
    this.correctAnswerIndex = data.correctAnswerIndex || data.CorrectAnswerIndex;
    this.correctAnswerIndices = data.correctAnswerIndices || data.CorrectAnswerIndices || '';
    this.correctAnswer = data.correctAnswer || data.CorrectAnswer || '';
    this.trueFalseCorrectAnswer = data.trueFalseCorrectAnswer || data.TrueFalseCorrectAnswer;
  }

  getOptions() {
    return [this.option1, this.option2, this.option3, this.option4].filter(Boolean);
  }

  isMultipleChoice() {
    return this.questionType === 'MultipleChoiceQuestion';
  }

  isMultipleAnswer() {
    return this.questionType === 'MultipleAnswerQuestion';
  }

  isTrueFalse() {
    return this.questionType === 'TrueFalseQuestion';
  }

  isTextInput() {
    return this.questionType === 'TextInputQuestion';
  }
}
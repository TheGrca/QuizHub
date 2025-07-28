const QuestionDisplay = ({ question, answer, onAnswerChange }) => {
  const renderQuestionContent = () => {
    switch (question.questionType) {
      case 'MultipleChoiceQuestion':
        return (
          <div className="space-y-3">
            {[question.option1, question.option2, question.option3, question.option4].map((option, index) => (
              <label key={index} className="flex items-center cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="single-choice"
                  value={index}
                  checked={answer === index}
                  onChange={() => onAnswerChange(index)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  answer === index 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {answer === index && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'MultipleAnswerQuestion':
        return (
          <div className="space-y-3">
            {[question.option1, question.option2, question.option3, question.option4].map((option, index) => (
              <label key={index} className="flex items-center cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={answer && answer.includes(index)}
                  onChange={() => {
                    const currentAnswers = answer || [];
                    const newAnswers = currentAnswers.includes(index)
                      ? currentAnswers.filter(i => i !== index)
                      : [...currentAnswers, index];
                    onAnswerChange(newAnswers);
                  }}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                  answer && answer.includes(index)
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {answer && answer.includes(index) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'TrueFalseQuestion':
        return (
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => onAnswerChange(true)}
              className={`px-8 py-4 rounded-lg font-medium transition-colors ${
                answer === true
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              True
            </button>
            <button
              onClick={() => onAnswerChange(false)}
              className={`px-8 py-4 rounded-lg font-medium transition-colors ${
                answer === false
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              False
            </button>
          </div>
        );

      case 'TextInputQuestion':
        return (
          <textarea
            value={answer || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
        {question.text}
      </h2>
      <div className="mt-6">
        {renderQuestionContent()}
      </div>
    </div>
  );
};

export default QuestionDisplay;
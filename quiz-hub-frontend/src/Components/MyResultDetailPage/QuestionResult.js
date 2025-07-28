import { CheckCircle, XCircle} from 'lucide-react';

const QuestionResult = ({ question, userAnswer, isCorrect, pointsEarned }) => {
  const getCorrectAnswers = () => {
    switch (question.questionType) {
      case 'MultipleChoiceQuestion':
        return [question.correctAnswerIndex];
      case 'MultipleAnswerQuestion':
        return question.correctAnswerIndices.split(',').map(i => parseInt(i));
      case 'TrueFalseQuestion':
        return [question.trueFalseCorrectAnswer];
      case 'TextInputQuestion':
        return [question.correctAnswer];
      default:
        return [];
    }
  };

  const getUserAnswers = () => {
    switch (question.questionType) {
      case 'MultipleChoiceQuestion':
        return userAnswer.selectedOptionIndex !== null ? [userAnswer.selectedOptionIndex] : [];
      case 'MultipleAnswerQuestion':
        return userAnswer.selectedOptionIndices ? userAnswer.selectedOptionIndices.split(',').map(i => parseInt(i)) : [];
      case 'TrueFalseQuestion':
        return userAnswer.userAnswer !== null ? [userAnswer.userAnswer] : [];
      case 'TextInputQuestion':
        return userAnswer.userAnswerText ? [userAnswer.userAnswerText] : [];
      default:
        return [];
    }
  };

  const renderAnswerOptions = () => {
    const correctAnswers = getCorrectAnswers();
    const userAnswers = getUserAnswers();

    switch (question.questionType) {
      case 'MultipleChoiceQuestion':
      case 'MultipleAnswerQuestion':
        const options = [question.option1, question.option2, question.option3, question.option4];
        return (
          <div className="space-y-2">
            {options.map((option, index) => {
              const isCorrectOption = correctAnswers.includes(index);
              const isUserSelected = userAnswers.includes(index);
              
              let className = 'p-3 rounded-lg border ';
              if (isCorrectOption) {
                className += 'bg-green-100 border-green-300 ';
              }
              if (isUserSelected && !isCorrectOption) {
                className += 'bg-red-100 border-red-300 ';
              }
              if (!isCorrectOption && !isUserSelected) {
                className += 'bg-gray-50 border-gray-200 ';
              }

              return (
                <div key={index} className={className}>
                  <div className="flex items-center">
                    <span className="flex-1">{option}</span>
                    {isCorrectOption && (
                      <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                    )}
                    {isUserSelected && !isCorrectOption && (
                      <XCircle className="h-5 w-5 text-red-600 ml-2" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'TrueFalseQuestion':
        const correctAnswer = correctAnswers[0];
        const userAnswer = userAnswers[0];
        
        return (
          <div className="space-y-2">
            <div className={`p-3 rounded-lg border ${
              correctAnswer === true ? 'bg-green-100 border-green-300' : 
              (userAnswer === true && correctAnswer !== true) ? 'bg-red-100 border-red-300' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center">
                <span className="flex-1">True</span>
                {correctAnswer === true && <CheckCircle className="h-5 w-5 text-green-600 ml-2" />}
                {userAnswer === true && correctAnswer !== true && <XCircle className="h-5 w-5 text-red-600 ml-2" />}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${
              correctAnswer === false ? 'bg-green-100 border-green-300' : 
              (userAnswer === false && correctAnswer !== false) ? 'bg-red-100 border-red-300' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center">
                <span className="flex-1">False</span>
                {correctAnswer === false && <CheckCircle className="h-5 w-5 text-green-600 ml-2" />}
                {userAnswer === false && correctAnswer !== false && <XCircle className="h-5 w-5 text-red-600 ml-2" />}
              </div>
            </div>
          </div>
        );

      case 'TextInputQuestion':
        const correctText = correctAnswers[0];
        const userText = userAnswers[0] || 'No answer provided';
        
        return (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-green-100 border border-green-300">
              <div className="text-sm font-medium text-green-800 mb-1">Correct Answer:</div>
              <div className="text-green-700">{correctText}</div>
            </div>
            <div className={`p-3 rounded-lg border ${
              isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
            }`}>
              <div className={`text-sm font-medium mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                Your Answer:
              </div>
              <div className={isCorrect ? 'text-green-700' : 'text-red-700'}>{userText}</div>
            </div>
          </div>
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div className="rounded-lg p-6 border shadow-sm" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex-1 pr-4">
          {question.text}
        </h3>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isCorrect ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <XCircle className="h-4 w-4 mr-1" />
            )}
            {pointsEarned}/{question.points} pts
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        {renderAnswerOptions()}
      </div>
    </div>
  );
};

export default QuestionResult;
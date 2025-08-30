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

  const renderUserAnswerSection = () => {
    const userAnswers = getUserAnswers();

    switch (question.questionType) {
      case 'MultipleChoiceQuestion':
      case 'MultipleAnswerQuestion':
        const options = [question.option1, question.option2, question.option3, question.option4];
        return (
          <div className="space-y-2">
            {options.map((option, index) => {
              const isUserSelected = userAnswers.includes(index);
              
              let className = 'p-3 rounded-lg border ';
              if (isUserSelected) {
                className += 'bg-blue-100 border-blue-300';
              } else {
                className += 'bg-gray-50 border-gray-200';
              }

              return (
                <div key={index} className={className}>
                  <div className="flex items-center">
                    <span className="flex-1">{option}</span>
                    {isUserSelected && (
                      <div className="w-4 h-4 bg-blue-600 rounded-full ml-2"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'TrueFalseQuestion':
        const userAnswer = userAnswers[0];
        
        return (
          <div className="space-y-2">
            <div className={`p-3 rounded-lg border ${
              userAnswer === true ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center">
                <span className="flex-1">True</span>
                {userAnswer === true && <div className="w-4 h-4 bg-blue-600 rounded-full ml-2"></div>}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${
              userAnswer === false ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center">
                <span className="flex-1">False</span>
                {userAnswer === false && <div className="w-4 h-4 bg-blue-600 rounded-full ml-2"></div>}
              </div>
            </div>
          </div>
        );

      case 'TextInputQuestion':
        const userText = userAnswers[0] || 'No answer provided';
        
        return (
          <div className="p-3 rounded-lg bg-blue-100 border border-blue-300">
            <div className="text-blue-700">{userText}</div>
          </div>
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  const renderCorrectAnswerSection = () => {
    const correctAnswers = getCorrectAnswers();

    switch (question.questionType) {
      case 'MultipleChoiceQuestion':
      case 'MultipleAnswerQuestion':
        const options = [question.option1, question.option2, question.option3, question.option4];
        return (
          <div className="space-y-2">
            {correctAnswers.map((correctIndex) => (
              <div key={correctIndex} className="p-3 rounded-lg bg-green-100 border border-green-300">
                <div className="flex items-center">
                  <span className="flex-1">{options[correctIndex]}</span>
                  <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'TrueFalseQuestion':
        const correctAnswer = correctAnswers[0];
        
        return (
          <div className="p-3 rounded-lg bg-green-100 border border-green-300">
            <div className="flex items-center">
              <span className="flex-1">{correctAnswer ? 'True' : 'False'}</span>
              <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
            </div>
          </div>
        );

      case 'TextInputQuestion':
        const correctText = correctAnswers[0];
        
        return (
          <div className="p-3 rounded-lg bg-green-100 border border-green-300">
            <div className="text-green-700">{correctText}</div>
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
      
      <div className="mt-6 space-y-6">
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Your Answer:</h4>
          {renderUserAnswerSection()}
        </div>
        
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Correct Answer:</h4>
          {renderCorrectAnswerSection()}
        </div>
      </div>
    </div>
  );
};

export default QuestionResult;
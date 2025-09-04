import { useState } from 'react';

const TrueFalseQuestion = ({ question, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    if (onAnswer) onAnswer(answer);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{question}</h3>
      <div className="flex space-x-4">
        <button
          onClick={() => handleAnswerSelect(true)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedAnswer === true
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Correct
        </button>
        <button
          onClick={() => handleAnswerSelect(false)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedAnswer === false
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Incorrect
        </button>
      </div>
    </div>
  );
};

export default TrueFalseQuestion;
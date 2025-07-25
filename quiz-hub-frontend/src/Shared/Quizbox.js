import { Clock, FileText, AlertCircle } from 'lucide-react';

// QuizBox Component
const QuizBox = ({ quiz, onClick }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      onClick={() => onClick(quiz.id)}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 p-6 border border-gray-200"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(quiz.difficulty)}`}>
          {quiz.difficulty}
        </span>
        <span className="text-sm text-gray-500 font-medium">{quiz.category}</span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{quiz.name}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{quiz.description}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{quiz.numberOfQuestions} questions</span>
        <span>{quiz.timeToFinish} min</span>
      </div>
    </div>
  );
};

export default QuizBox;
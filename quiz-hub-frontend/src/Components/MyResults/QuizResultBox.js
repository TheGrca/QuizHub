import { Clock, Calendar } from 'lucide-react';

const QuizResultBox = ({ result, onClick }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      onClick={() => onClick(result.id)}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 p-6 border border-gray-200"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(result.difficulty)}`}>
          {result.difficulty}
        </span>
        <span className="text-sm text-gray-500 font-medium">{result.category}</span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{result.quizName}</h3>
      
      {/* Performance Summary */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Score:</span>
          <span className={`text-lg font-bold ${getPerformanceColor(result.percentage)}`}>
            {result.percentage.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{result.correctAnswers}/{result.totalQuestions} correct</span>
          <span>{result.score}/{result.totalPoints} pts</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-3">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {formatTime(result.timeTakenSeconds)}
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(result.completionDate)}
        </div>
      </div>
    </div>
  );
};

export default QuizResultBox;
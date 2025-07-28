import { Clock, FileText, AlertCircle } from 'lucide-react';



const QuizStartModal = ({ isOpen, onClose, quiz, onStart }) => {
  if (!isOpen || !quiz) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-100 rounded-full p-3">
            <AlertCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Ready to Start?
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          Once you begin, the timer will start immediately. Make sure you're ready!
        </p>
        
        {/* Quiz Details */}
        <div 
          className="rounded-lg p-4 mb-6"
          style={{ backgroundColor: '#F8F9FA' }}
        >
          <h3 className="font-semibold text-lg text-gray-900 mb-3">
            {quiz.name}
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Category:</span>
              <span className="text-sm font-medium text-gray-900">{quiz.category}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Difficulty:</span>
              <span className={`text-sm font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                {quiz.difficulty}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Questions:</span>
              <span className="text-sm font-medium text-gray-900 flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                {quiz.numberOfQuestions}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time Limit:</span>
              <span className="text-sm font-medium text-red-600 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {quiz.timeToFinish} minutes
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onStart(quiz.id)}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
};
export default QuizStartModal;
import React, { useState, useEffect } from 'react';
import { Clock, FileText, AlertCircle, Award, TrendingUp, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

// QuizResultBox Component - Modified version of QuizBox for results
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

export default function MyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Fetch all quiz results for the user
  const fetchResults = async () => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user.id) {
        toast.error('User not found. Please login again.');
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/user/my-quiz-results`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-User-Id': user.id.toString()
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        setStats(data.stats);
      } else {
        toast.error('Failed to load quiz results');
      }
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      toast.error('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleResultClick = (resultId) => {
    window.location.href = `/my-results/${resultId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#BBBFCA' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#495464' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#BBBFCA' }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Quiz Results</h1>
        </div>

        {/* Results Grid */}
        <div className="rounded-lg p-8 shadow-md" style={{ backgroundColor: '#E8E8E8' }}>
          {results.length > 0 ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Quiz Attempts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(result => (
                  <QuizResultBox 
                    key={result.id} 
                    result={result} 
                    onClick={handleResultClick}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Quiz Results Yet</h3>
              <p className="text-gray-600 mb-6">You haven't taken any quizzes yet. Start your learning journey!</p>
              <button
                onClick={() => window.location.href = '/home'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Browse Quizzes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
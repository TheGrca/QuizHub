import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Medal, Award, Clock, Target } from 'lucide-react';
import toast from 'react-hot-toast';

// Ranking Item Component
const RankingItem = ({ ranking, index, currentUserId }) => {
  const isCurrentUser = ranking.userId === currentUserId;
  
  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{position}</span>;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`flex items-center p-4 rounded-lg border transition-all ${
        isCurrentUser 
          ? 'bg-blue-50 border-blue-300 shadow-md transform scale-105' 
          : 'bg-white border-gray-200 hover:shadow-md'
      }`}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-12 h-12 mr-4">
        {getRankIcon(index + 1)}
      </div>

      {/* Profile Picture */}
      <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-gray-200">
        <img 
          src={`data:image/jpeg;base64,${ranking.profilePicture}`}
          alt={ranking.username}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${ranking.username}&background=random&color=fff&size=48`;
          }}
        />
      </div>

      {/* User Info */}
      <div className="flex-1">
        <div className="flex items-center">
          <h3 className={`font-semibold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
            {ranking.username}
            {isCurrentUser && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                You
              </span>
            )}
          </h3>
        </div>
        <p className="text-sm text-gray-600">{ranking.email}</p>
      </div>

      {/* Score */}
      <div className="text-center mr-4">
        <div className={`text-xl font-bold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
          {ranking.score}
        </div>
        <div className="text-sm text-gray-600">points</div>
      </div>

      {/* Time */}
      <div className="text-center">
        <div className={`flex items-center text-lg font-medium ${isCurrentUser ? 'text-blue-700' : 'text-gray-700'}`}>
          <Clock className="h-4 w-4 mr-1" />
          {formatTime(ranking.timeTakenSeconds)}
        </div>
        <div className="text-sm text-gray-600">time</div>
      </div>
    </div>
  );
};

export default function QuizRankingsDetail() {
  // Get quiz ID from URL
  const getQuizIdFromUrl = () => {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 1];
  };

  const quizId = getQuizIdFromUrl();
  const [quiz, setQuiz] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch quiz rankings
  const fetchRankings = async () => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user.id) {
        toast.error('User not found. Please login again.');
        window.location.href = '/login';
        return;
      }

      setCurrentUserId(user.id);

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/user/quiz-rankings/${quizId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-User-Id': user.id.toString()
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("quiz" + data.quiz)
        setQuiz(data.quiz);
        setRankings(data.rankings);
      } else {
        toast.error('Failed to load quiz rankings');
        window.location.href = '/rankings';
      }
    } catch (error) {
      console.error('Error fetching quiz rankings:', error);
      toast.error('Failed to load quiz rankings');
      window.location.href = '/rankings';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#BBBFCA' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#495464' }}></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#BBBFCA' }}>
        <div className="text-center">
          <p className="text-gray-600 text-lg">Quiz not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#BBBFCA' }}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => window.location.href = '/rankings'}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Rankings
          </button>
          <div className="flex items-center mb-2">
            <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Quiz Leaderboard</h1>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="rounded-lg p-6 shadow-md mb-8" style={{ backgroundColor: '#E8E8E8' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.name}</h2>
          <p className="text-gray-600 mb-4">{quiz.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-lg font-bold text-gray-900">{quiz.category}</div>
              <div className="text-gray-600">Category</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-lg font-bold text-gray-900">{quiz.difficulty}</div>
              <div className="text-gray-600">Difficulty</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-lg font-bold text-gray-900">{quiz.numberOfQuestions}</div>
              <div className="text-gray-600">Questions</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-lg font-bold text-gray-900">{quiz.timeLimitMinutes} min</div>
              <div className="text-gray-600">Time Limit</div>
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className="rounded-lg p-6 shadow-md" style={{ backgroundColor: '#E8E8E8' }}>
          <div className="flex items-center mb-6">
            <Target className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-900">
              Top Performers ({rankings.length} players)
            </h3>
          </div>

          {rankings.length > 0 ? (
            <div className="space-y-3">
              {rankings.map((ranking, index) => (
                <RankingItem
                  key={ranking.userId}
                  ranking={ranking}
                  index={index}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to take this quiz and claim the top spot!</p>
              <button
                onClick={() => window.location.href = `/quiz/${quizId}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Take Quiz Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
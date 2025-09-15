import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Target, Users } from 'lucide-react';
import RankingItem from './RankingItem';
import toast from 'react-hot-toast';
import AuthService from '../../Services/AuthService';
import UserService from '../../Services/UserService';

export default function QuizRankingsDetail() {
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
  const [error, setError] = useState(null);

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const fetchRankings = async () => {
    try {
      if (!AuthService.isAuthenticated()) {
        toast.error('Please login to view quiz rankings');
        navigateTo('/login');
        return;
      }

      const user = AuthService.getCurrentUser();
      console.log('Current user:', user);
      
      if (!user || !user.id) {
        toast.error('User not found. Please login again.');
        navigateTo('/login');
        return;
      }

      setCurrentUserId(user.id);
      const data = await UserService.getQuizRankings(quizId);
      
      if (data && data.quiz) {
        setQuiz(data.quiz);
      } else {
        throw new Error('No quiz data received');
      }
      
      if (data && data.rankings) {
        setRankings(data.rankings);
      } else {
        setRankings([]);
      }

    } catch (error) {
      setError(error.message || 'Failed to load quiz rankings');
      toast.error(error.message || 'Failed to load quiz rankings');
      
      if (error.message && error.message.includes('login')) {
        navigateTo('/login');
      } 
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRankings = () => {
    navigateTo('/rankings');
  };

  const handleTakeQuiz = () => {
    navigateTo(`/quiz/${quizId}`);
  };

  useEffect(() => {
    fetchRankings();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto mb-4" 
            style={{ borderColor: '#495464' }}
          ></div>
          <p className="text-lg" style={{ color: '#495464' }}>Loading rankings...</p>
        </div>
      </div>
    );
  }

  if (!quiz && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div className="text-center p-8 rounded-2xl shadow-lg" style={{ backgroundColor: '#E8E8E8' }}>
          <Trophy className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464', opacity: 0.5 }} />
          <p className="text-lg mb-4" style={{ color: '#495464' }}>Quiz not found</p>
          <button
            onClick={handleBackToRankings}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: '#495464',
              color: 'white'
            }}
          >
            Back to Rankings
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div className="text-center p-8 rounded-2xl shadow-lg" style={{ backgroundColor: '#E8E8E8' }}>
          <Trophy className="h-16 w-16 mx-auto mb-4" style={{ color: '#ef4444', opacity: 0.7 }} />
          <p className="text-lg mb-2" style={{ color: '#495464' }}>Error Loading Rankings</p>
          <p className="text-sm mb-4" style={{ color: '#495464', opacity: 0.7 }}>{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchRankings();
              }}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
              style={{ 
                backgroundColor: '#22c55e',
                color: 'white'
              }}
            >
              Try Again
            </button>
            <button
              onClick={handleBackToRankings}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
              style={{ 
                backgroundColor: '#495464',
                color: 'white'
              }}
            >
              Back to Rankings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: '#BBBFCA',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBackToRankings}
            className="flex items-center mb-4 font-medium transition-all duration-200 hover:opacity-80"
            style={{ color: '#495464' }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Rankings
          </button>
          <div className="flex items-center mb-2">
            <Trophy className="h-8 w-8 mr-3" style={{ color: '#495464' }}/>
            <h1 className="text-3xl font-bold" style={{ color: '#495464' }}>
              Quiz Leaderboard
            </h1>
          </div>
          <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
            See how players performed on this quiz
          </p>
        </div>

        {/* Quiz Info */}
        <div className="rounded-lg p-6 shadow-md mb-8" style={{ backgroundColor: '#E8E8E8' }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#495464' }}>
            {quiz.name}
          </h2>
          <p className="mb-4" style={{ color: '#495464', opacity: 0.8 }}>
            {quiz.description}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F4F4F2' }}>
              <div className="text-lg font-bold" style={{ color: '#495464' }}>
                {quiz.category}
              </div>
              <div className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                Category
              </div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F4F4F2' }}>
              <div className="text-lg font-bold" style={{ color: '#495464' }}>
                {quiz.difficulty}
              </div>
              <div className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                Difficulty
              </div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F4F4F2' }}>
              <div className="text-lg font-bold" style={{ color: '#495464' }}>
                {quiz.numberOfQuestions}
              </div>
              <div className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                Questions
              </div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F4F4F2' }}>
              <div className="text-lg font-bold" style={{ color: '#495464' }}>
                {quiz.timeLimitMinutes} min
              </div>
              <div className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                Time Limit
              </div>
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className="rounded-lg p-6 shadow-md" style={{ backgroundColor: '#E8E8E8' }}>
          <div className="flex items-center mb-6">
            <Target className="h-6 w-6 mr-2" style={{ color: '#495464' }} />
            <h3 className="text-xl font-bold" style={{ color: '#495464' }}>
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
              <Trophy className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464', opacity: 0.4 }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#495464' }}>
                No Results Yet
              </h3>
              <p className="mb-6" style={{ color: '#495464', opacity: 0.7 }}>
                Be the first to take this quiz and claim the top spot!
              </p>
              <button
                onClick={handleTakeQuiz}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 flex items-center mx-auto"
                style={{ 
                  backgroundColor: '#495464',
                  color: 'white'
                }}
              >
                <Users className="h-5 w-5 mr-2" />
                Take Quiz Now
              </button>
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        {rankings.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={handleTakeQuiz}
              className="px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 inline-flex items-center"
              style={{ 
                backgroundColor: '#495464',
                color: 'white'
              }}
            >
              <Trophy className="h-5 w-5 mr-2" />
              Take This Quiz Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
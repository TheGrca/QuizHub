// LiveQuizResults.js - Create this new component
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award, Clock, Home } from 'lucide-react';
import AuthService from '../../Services/AuthService';
import LiveQuizGameService from '../../Services/LiveQuizService';
import toast from 'react-hot-toast';

const LiveQuizResults = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(20);
  const [user] = useState(AuthService.getCurrentUser());

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    loadResults();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Navigate to home when countdown reaches 0
      navigate('/');
    }
  }, [countdown, navigate]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const state = await LiveQuizGameService.getGameState(quizId);
      setGameState(state);
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load results');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 1:
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 2:
        return <Award className="h-8 w-8 text-amber-600" />;
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
            {index + 1}
          </div>
        );
    }
  };

  const getRankColors = (index) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 1:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 2:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div 
          className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
          style={{ borderColor: '#495464' }}
        ></div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#BBBFCA' }}>
        <div className="text-center">
          <p className="text-gray-600 mb-4">Results not found</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: '#BBBFCA',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-12 w-12 mr-4 text-yellow-500" />
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#495464' }}>
                Quiz Complete!
              </h1>
              <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
                Final Results
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center justify-center mt-6">
            <div className="bg-white rounded-lg shadow-lg px-6 py-4 flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-lg font-semibold text-gray-700">
                Returning to home in
              </span>
              <div className={`text-2xl font-bold px-3 py-1 rounded ${
                countdown <= 5 ? 'text-red-500 bg-red-50' : 'text-blue-500 bg-blue-50'
              }`}>
                {countdown}s
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#495464' }}>
              Final Leaderboard
            </h2>
            
            <div className="space-y-4">
              {gameState.participants?.map((participant, index) => (
                <div
                  key={`participant-${participant.userId}-${index}`}
                  className={`flex items-center p-6 rounded-xl border-2 transition-all duration-200 ${getRankColors(index)}`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 mr-6">
                    {getRankIcon(index)}
                  </div>
                  
                  {/* Profile Picture */}
                  <img
                    src={participant.profilePicture || '/api/placeholder/48/48'}
                    alt={participant.username}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md mr-4"
                  />
                  
                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold text-gray-800">
                        {participant.username}
                      </h3>
                      {index === 0 && (
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          WINNER
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {index === 0 ? '🏆 Champion' : 
                       index === 1 ? '🥈 Runner-up' :
                       index === 2 ? '🥉 Third Place' : 
                       `#${index + 1} Place`}
                    </p>
                  </div>
                  
                  {/* Score */}
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: '#495464' }}>
                      {participant.score}
                    </div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Manual Return Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 mx-auto px-6 py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#495464' }}
              >
                <Home className="h-4 w-4" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveQuizResults;
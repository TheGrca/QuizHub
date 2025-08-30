import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Trophy, BarChart3, Clock, Calendar, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthService from '../../Services/AuthService';
import AdminService from '../../Services/AdminService'
import UserResults from '../UserResults/UserResults';
export default function UserResultsDetailPage() {
  // Get user ID from URL
  const getUserIdFromUrl = () => {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 1];
  };

  const userId = getUserIdFromUrl();
  const [userResults, setUserResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigate function
  const navigateTo = (path) => {
    window.location.href = path;
  };

  // Fetch user results
  const fetchUserResults = async () => {
    try {
      console.log('Fetching user results for ID:', userId);
      const results = await AdminService.getUserResults(userId);
      console.log('User results received:', results);
      
      setUserResults(results);
      setError(null);
    } catch (error) {
      console.error('Error fetching user results:', error);
      setError(error.message || 'Failed to fetch user results');
      toast.error(error.message || 'Failed to fetch user results');
    } finally {
      setLoading(false);
    }
  };

  // Initialize page
  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!AuthService.isAuthenticated() || !AuthService.isAdmin()) {
      toast.error('Access denied. Admin privileges required.');
      navigateTo('/login');
      return;
    }

    fetchUserResults();
  }, [userId]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get percentage color
  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

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
          <p className="text-lg" style={{ color: '#495464' }}>Loading user results...</p>
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
          <User className="h-16 w-16 mx-auto mb-4" style={{ color: '#ef4444' }} />
          <p className="text-lg mb-2" style={{ color: '#495464' }}>Error Loading User Results</p>
          <p className="text-sm mb-4" style={{ color: '#495464', opacity: 0.7 }}>{error}</p>
          <button
            onClick={() => navigateTo('/user-results')}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: '#495464',
              color: 'white'
            }}
          >
            Back to User List
          </button>
        </div>
      </div>
    );
  }

  if (!userResults) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div className="text-center p-8 rounded-2xl shadow-lg" style={{ backgroundColor: '#E8E8E8' }}>
          <User className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464', opacity: 0.5 }} />
          <p className="text-lg mb-4" style={{ color: '#495464' }}>User not found</p>
          <button
            onClick={() => navigateTo('/user-results')}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: '#495464',
              color: 'white'
            }}
          >
            Back to User List
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
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigateTo('/user-results')}
              className="p-2 rounded-lg transition-all duration-200 hover:opacity-70 mr-4"
              style={{ backgroundColor: '#E8E8E8' }}
            >
              <ArrowLeft className="h-6 w-6" style={{ color: '#495464' }} />
            </button>
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2" style={{ borderColor: '#495464' }}>
                <img 
                        src={userResults.profilePicture ? 
                          `data:image/jpeg;base64,${userResults.profilePicture}` : 
                          `https://ui-avatars.com/api/?name=${userResults.username}&background=random&color=fff&size=48`
                        }
                  alt={userResults.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${userResults.username}&background=random&color=fff&size=64`;
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#495464' }}>
                  {userResults.username}
                </h1>
                <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
                  {userResults.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">    
          {/* Quiz Results Panel */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#E8E8E8' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: '#495464' }}>
                  Quiz Results ({userResults.quizResults ? userResults.quizResults.length : 0})
                </h2>
              </div>

              {userResults.quizResults && userResults.quizResults.length > 0 ? (
                <div className="space-y-4">
                  {userResults.quizResults.map((result, index) => (
                    <div 
                      key={result.resultId}
                      className="p-4 rounded-lg border-2"
                      style={{ backgroundColor: '#F4F4F2', borderColor: '#BBBFCA' }}
                    >
                      <div className="flex items-center justify-between">
                        {/* Quiz Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg" style={{ color: '#495464' }}>
                              {result.quizName}
                            </h3>
                            <span 
                              className="px-2 py-1 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: getDifficultyColor(result.difficulty) }}
                            >
                              {result.difficulty}
                            </span>
                            <span 
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{ backgroundColor: '#BBBFCA', color: '#495464' }}
                            >
                              {result.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm" style={{ color: '#495464', opacity: 0.8 }}>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(result.completionDate)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {result.timeTakenSeconds}
                            </div>
                          </div>
                        </div>

                        {/* Results */}
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-lg font-bold" style={{ color: '#495464' }}>
                              {result.correctAnswers}/{result.totalQuestions}
                            </div>
                            <div className="text-xs" style={{ color: '#495464', opacity: 0.7 }}>
                              Correct
                            </div>
                          </div>

                          <div className="text-center">
                            <div 
                              className="text-xl font-bold"
                              style={{ color: getPercentageColor(result.percentage) }}
                            >
                              {result.percentage.toFixed(1)}%
                            </div>
                            <div className="text-xs" style={{ color: '#495464', opacity: 0.7 }}>
                              Score
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464', opacity: 0.3 }} />
                  <p className="text-lg mb-2" style={{ color: '#495464' }}>
                    No quiz results yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
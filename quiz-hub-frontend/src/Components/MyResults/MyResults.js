import { useState, useEffect } from 'react';
import { FileText, Trophy, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import QuizResultBox from './QuizResultBox';
import AuthService from '../../Services/AuthService';
import UserService from '../../Services/UserService';

export default function MyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const fetchResults = async () => {
    try {
      if (!AuthService.isAuthenticated()) {
        console.log('User not authenticated');
        toast.error('Please login to view your results');
        navigateTo('/login');
        return;
      }

      const user = AuthService.getCurrentUser();
      
      if (!user || !user.id) {
        toast.error('User not found. Please login again.');
        navigateTo('/login');
        return;
      }
      const data = await UserService.getMyQuizResults();
      
      if (data && data.results) {
        setResults(data.results);
      } else {
        setResults([]);
      }
      
      if (data && data.stats) {
        setStats(data.stats);
      } else {
        setStats(null);
      }

    } catch (error) {
      setError(error.message || 'Failed to load quiz results');    
      toast.error(error.message || 'Failed to load quiz results');  
      if (error.message && error.message.includes('login')) {
        navigateTo('/login');
      } else {
        console.log('Staying on page to show error state');
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleResultClick = (resultId) => {
    navigateTo(`/my-results/${resultId}`);
  };

  const handleBrowseQuizzes = () => {
    navigateTo('/home');
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
          <p className="text-lg" style={{ color: '#495464' }}>Loading your results...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div className="text-center p-8 rounded-2xl shadow-lg" style={{ backgroundColor: '#E8E8E8' }}>
          <BarChart3 className="h-16 w-16 mx-auto mb-4" style={{ color: '#ef4444', opacity: 0.7 }} />
          <p className="text-lg mb-2" style={{ color: '#495464' }}>Error Loading Results</p>
          <p className="text-sm mb-4" style={{ color: '#495464', opacity: 0.7 }}>{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchResults();
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
              onClick={handleBrowseQuizzes}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
              style={{ 
                backgroundColor: '#495464',
                color: 'white'
              }}
            >
              Browse Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }
//My results UI
  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: '#BBBFCA',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-8 w-8 mr-3" style={{ color: '#495464' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#495464' }}>
              My Quiz Results
            </h1>
          </div>
          <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
            Track your progress and review your quiz performance
          </p>
        </div>

        {/* Results Grid */}
        <div className="rounded-lg p-8 shadow-md" style={{ backgroundColor: '#E8E8E8' }}>
          {results.length > 0 ? (
            <>
              <h2 className="text-xl font-bold mb-6" style={{ color: '#495464' }}>
                Recent Quiz Attempts ({results.length} total)
              </h2>
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
              <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464', opacity: 0.4 }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#495464' }}>
                No Quiz Results Yet
              </h3>
              <p className="mb-6" style={{ color: '#495464', opacity: 0.7 }}>
                You haven't taken any quizzes yet. Start your learning journey!
              </p>
              <button
                onClick={handleBrowseQuizzes}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 inline-flex items-center"
                style={{ 
                  backgroundColor: '#3b82f6',
                  color: 'white'
                }}
              >
                <Trophy className="h-5 w-5 mr-2" />
                Browse Quizzes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
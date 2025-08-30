import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Search, Clock, FileText, AlertCircle, Zap, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import QuizBox from '../../Shared/Quizbox';
import QuizStartModal from '../../Shared/QuizStartModal';
import AuthService from '../../Services/AuthService';
import UserService from '../../Services/UserService';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [liveQuiz, setLiveQuiz] = useState(null); // New state for live quiz
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: ''
  });
  const [fetchingQuizzes, setFetchingQuizzes] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const wsRef = useRef(null); // WebSocket reference

  const navigateTo = (path) => {
    window.location.href = path;
  };

  // Initialize WebSocket connection for live quizzes
  const initializeWebSocket = () => {
    if (!user) return;
    try {
      wsRef.current = new WebSocket('ws://localhost:5175/ws'); // Updated to correct port

      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
        
        // Register user as connected
        const message = {
          type: 'USER_CONNECTED',
          payload: {
            userId: user.id.toString(),
            username: user.username
          }
        };
        wsRef.current.send(JSON.stringify(message));
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          switch (data.Type) {
            case 'LIVE_QUIZ_CREATED':
              // Show live quiz at the top
              console.log('Live quiz received:', data.Payload);
              setLiveQuiz(data.Payload);
              toast.success('🎉 A new live quiz is available!', {
                duration: 4000,
                style: {
                  background: '#22c55e',
                  color: 'white',
                }
              });
              break;
              
            case 'LIVE_QUIZ_ENDED':
              // Remove live quiz
              setLiveQuiz(null);
              toast.info('Live quiz has ended');
              break;
              
            default:
              console.log('Unknown message type:', data.Type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error - live quiz updates may not work');
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (user) {
            console.log('Attempting to reconnect WebSocket...');
            initializeWebSocket();
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const fetchQuizzes = async () => {
    setFetchingQuizzes(true);
    try {
      const fetchedQuizzes = await UserService.fetchQuizzes(filters);
      setQuizzes(fetchedQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error(error.message || 'Failed to fetch quizzes');
    } finally {
      setFetchingQuizzes(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await UserService.fetchCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleQuizClick = (quizId) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setShowModal(true);
    }
  };

  const handleLiveQuizJoin = () => {
    if (liveQuiz) {
      // Navigate to live quiz join page or send join message
      const quizName = liveQuiz.quizData.Name.replace(/\s+/g, '-').toLowerCase();
      navigateTo(`/live-quiz/${quizName}`);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedQuiz(null);
  };

  const handleQuizStart = (quizId) => {
    setShowModal(false);
    setSelectedQuiz(null);
    navigateTo(`/quiz/${quizId}`);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchQuizzes();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigateTo('/login');
      return;
    }

    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) {
      navigateTo('/login');
      return;
    }

    // Check if user is admin and redirect accordingly
    if (currentUser.isAdmin()) {
      navigateTo('/add-quiz');
      return;
    }

    setUser(currentUser);
    setLoading(false);

    // Fetch initial data
    fetchCategories();
    fetchQuizzes();
  }, []);

  // Initialize WebSocket when user is set
  useEffect(() => {
    if (user) {
      initializeWebSocket();
    }
  }, [user]);

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

  if (!user) {
    return null; 
  }

  return (
    <div>
      <div className="min-h-screen" style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segue UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Search className="h-8 w-8 mr-3" style={{ color: '#495464' }} />
              <h1 className="text-3xl font-bold" style={{ color: '#495464' }}>
                Quiz Dashboard
              </h1>
            </div>
            <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
              Take quizzes to test your knowledge
            </p>
          </div>

          {/* Live Quiz Banner */}
          {liveQuiz && (
            <div className="mb-8">
              <div 
                className="w-full rounded-2xl shadow-lg p-6 border-2"
                style={{ 
                  backgroundColor: '#22c55e', 
                  borderColor: '#16a34a',
                  animation: 'pulse 2s infinite'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="h-8 w-8 mr-3 text-white" />
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        🔴 LIVE: {liveQuiz.QuizData.Name}
                      </h2>
                      <p className="text-green-100 text-lg">
                        {liveQuiz.QuizData.Description}
                      </p>
                      <div className="flex items-center mt-2 text-green-100">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {liveQuiz.Questions.Length} questions • Real-time competition
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleLiveQuizJoin}
                      className="px-8 py-3 rounded-lg font-bold text-green-600 bg-white hover:bg-gray-100 transition-all duration-200 shadow-lg"
                    >
                      JOIN LIVE QUIZ
                    </button>
                    <div className="mt-2 text-green-100 text-sm text-center">
                      Limited spots available!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="py-6">
            <div className="flex gap-4 justify-between items-center">
              {/* Search Bar */}
              <div className="flex-1 max-w-md relative">
                <div className="relative">
                  <Search 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" 
                    style={{ color: '#495464' }}
                  />
                  <input
                    type="text"
                    placeholder="Search quizzes..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      backgroundColor: '#E8E8E8',
                      color: '#495464',
                      focusRingColor: '#495464'
                    }}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                {/* Category Filter */}
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: '#E8E8E8',
                    color: '#495464',
                    focusRingColor: '#495464'
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Difficulty Filter */}
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: '#E8E8E8',
                    color: '#495464',
                    focusRingColor: '#495464'
                  }}
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Regular Quizzes Section */}
          <div className="pb-8">
            {liveQuiz && (
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#495464' }}>
                Regular Quizzes
              </h2>
            )}
            
            <div 
              className="w-full rounded-2xl shadow-lg p-8"
              style={{ backgroundColor: '#E8E8E8' }}
            >
              {fetchingQuizzes ? (
                <div className="flex items-center justify-center py-12">
                  <div 
                    className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent"
                    style={{ borderColor: '#495464' }}
                  ></div>
                  <span className="ml-3 text-gray-600">Loading quizzes...</span>
                </div>
              ) : quizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map(quiz => (
                    <QuizBox 
                      key={quiz.id} 
                      quiz={quiz} 
                      onClick={handleQuizClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464', opacity: 0.5 }} />
                  <p className="text-gray-600 text-lg">No quizzes found matching your criteria.</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quiz Start Modal */}
        <QuizStartModal
          isOpen={showModal}
          onClose={handleModalClose}
          quiz={selectedQuiz}
          onStart={handleQuizStart}
        />
      </div>
    </div>
  );
}
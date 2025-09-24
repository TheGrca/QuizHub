import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Zap, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import QuizBox from '../../Shared/Quizbox';
import QuizStartModal from '../../Shared/QuizStartModal';
import AuthService from '../../Services/AuthService';
import UserService from '../../Services/UserService';
import LiveQuizService from '../../Services/LiveQuizService';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [liveQuiz, setLiveQuiz] = useState(null); 
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: ''
  });
  const [fetchingQuizzes, setFetchingQuizzes] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const wsRef = useRef(null); 

  const navigateTo = (path) => {
    window.location.href = path;
  };

  //If the user visits this page and is not authenticated, gets redirected to login page, or if user is Admin redirect to add-quiz page
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
    fetchCurrentLiveQuiz();
  }, []);

  //Function for fetching current live quiz
 const fetchCurrentLiveQuiz = async () => {
  try {
    const currentQuiz = await LiveQuizService.getCurrentActiveLiveQuiz();
    setLiveQuiz(currentQuiz);
  } catch (error) {
    console.error('Error fetching current live quiz:', error);
  }
};

// Initialize WebSocket
useEffect(() => {
    if (user) {
      initializeWebSocket();
      fetchCurrentLiveQuiz();
    }
}, [user]);

  // Initialize WebSocket connection for live quizzes
  const initializeWebSocket = () => {
    if (!user) return;  
    try {
      wsRef.current = new WebSocket('ws://localhost:5175/ws');     
      wsRef.current.onopen = () => {    
        // Register user as connected
        const message = {
          type: 'USER_CONNECTED',
          payload: {
            userId: user.id.toString(),
            username: user.username
          }
        };        
        //Sending USER_CONNECTED message
        wsRef.current.send(JSON.stringify(message));
      };

      wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);    
        // Handle both possible message formats (Type and type)
        const messageType = data.Type || data.type;
        
        switch (messageType) {
          case 'LIVE_QUIZ_CREATED':
            const payload = data.Payload || data.payload;
            setLiveQuiz(payload);
            toast.success('🎉 A new live quiz is available!');
            break;
            
          case 'QUIZ_CANCELLED':
              const cancelPayload = data.Payload || data.payload;
              setLiveQuiz(null);
              toast.error('The quiz has been cancelled');
              break;
                            
          default:
            console.log('Unknown message type:', messageType);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        }
   };

      wsRef.current.onerror = (error) => {
            toast.error('Connection error');
          };

      wsRef.current.onclose = (event) => {
      // Only attempt to reconnect if it wasn't a normal close
        if (event.code !== 1000 && user) {
          setTimeout(() => {
            initializeWebSocket();
            }, 5000);
          }
        };
      } catch (error) {
          toast.error('Failed to connect to live quiz updates');
      }
  };

  // Cleanup WebSocket 
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  //Constant for fetching quizzes
const fetchQuizzes = async () => {
    setFetchingQuizzes(true);
    try {
      const fetchedQuizzes = await UserService.fetchQuizzes(filters);
      setQuizzes(fetchedQuizzes);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch quizzes');
    } finally {
      setFetchingQuizzes(false);
    }
};

  //Constant for fetching categories
const fetchCategories = async () => {
  try {
    const fetchedCategories = await UserService.fetchCategories();
    setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
 };

//Handle for clicking a quiz
const handleQuizClick = (quizId) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setShowModal(true);
    }
};

//Handle for joining a live quiz
const handleLiveQuizJoin = () => {
  let quizId = null;
  
  if (liveQuiz?.quizData?.quizId) {
    quizId = liveQuiz.quizData.quizId;
  } else if (liveQuiz?.quizId) {
    quizId = liveQuiz.quizId;
  }  
  if (quizId) {
    navigateTo(`/live-quiz-room/${quizId}`);
  } else {
    console.log("No valid quiz ID found");
  }
};

//Navigating to the quiz
const handleQuizStart = (quizId) => {
    setShowModal(false);
    setSelectedQuiz(null);
    navigateTo(`/quiz/${quizId}`);
};

//Filter for quizzes
const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  //For searching quizzes, for example no need for calling after typing one letter
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchQuizzes();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);


  //Closing modal for showing quiz
const handleModalClose = () => {
    setShowModal(false);
    setSelectedQuiz(null);
};

//UI when page is loading
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

  //Page UI
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
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#495464' }}>
                Live Quiz Available
              </h2>
            <div 
              className="w-full rounded-2xl shadow-lg p-8 border-2 border-opacity-20"
              style={{ 
                backgroundColor: '#E8E8E8',
                borderColor: '#495464'
              }}
            >
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="p-3 rounded-xl mr-4"
                    style={{ backgroundColor: '#495464' }}
                  >
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <h2 className="text-2xl font-bold mr-3" style={{ color: '#495464' }}>
                        {liveQuiz.quizData?.name || liveQuiz?.name  ||'Live Quiz'}
                      </h2>
                      <div 
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: '#495464' }}
                      >
                        LIVE
                      </div>
                    </div>
                    <p className="text-lg mb-2" style={{ color: '#495464', opacity: 0.7 }}>
                      {liveQuiz.quizData?.description || liveQuiz?.description  ||'Join the live quiz competition!'}
                    </p>
                    <div className="flex items-center" style={{ color: '#495464', opacity: 0.6 }}>
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm mr-4">
                        {liveQuiz.questions?.length || 0} questions
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <button
                    onClick={handleLiveQuizJoin}
                    className="px-8 py-3 rounded-lg font-medium text-white hover:opacity-90 transition-all duration-200 shadow-lg mb-2"
                    style={{ backgroundColor: '#495464' }}
                  >
                    Join Live Quiz
                  </button>
                  <div className="text-xs" style={{ color: '#495464', opacity: 0.6 }}>
                    Limited to 4 players
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
import React, { useState, useEffect } from 'react';
import { LogOut, Search, Clock, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import QuizBox from '../../Shared/Quizbox';

// Quiz Start Modal Component
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

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: ''
  });
  const [fetchingQuizzes, setFetchingQuizzes] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Navigate function using window.location for compatibility
  const navigateTo = (path) => {
    window.location.href = path;
  };

  // Fetch quizzes from API
  const fetchQuizzes = async () => {
    setFetchingQuizzes(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/user/quizzes?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        const fetchedQuizzes = await response.json();
        setQuizzes(fetchedQuizzes);
      } else {
        toast.error('Failed to fetch quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to fetch quizzes');
    } finally {
      setFetchingQuizzes(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/user/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        const fetchedCategories = await response.json();
        setCategories(fetchedCategories);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Handle quiz click - show modal first
  const handleQuizClick = (quizId) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setShowModal(true);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedQuiz(null);
  };

  // Handle quiz start - navigate to quiz page
  const handleQuizStart = (quizId) => {
    setShowModal(false);
    setSelectedQuiz(null);
    navigateTo(`/quiz/${quizId}`);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchQuizzes();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      // Redirect to login if not authenticated
      navigateTo('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.IsAdmin == 1) {
        navigateTo('/add-quiz');
        return;
      }
      setUser(parsedUser);
      
      // Fetch initial data
      fetchCategories();
      fetchQuizzes();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigateTo('/login');
    } finally {
      setLoading(false);
    }
  }, []);

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
    return null; // Will redirect to login
  }

  return (
    <div>
      <div className="min-h-screen" style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {/* Search and Filter Section */}
        <div className="px-8 py-6">
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

        {/* Quiz Display Area */}
        <div className="px-8 pb-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
  );
}
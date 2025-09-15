import { useState, useEffect } from 'react';
import { Search, Trophy, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import QuizBox from '../../Shared/Quizbox';
import AuthService from '../../Services/AuthService';
import UserService from '../../Services/UserService';

export default function Rankings() {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: ''
  });
  const [loading, setLoading] = useState(true);
  const [fetchingQuizzes, setFetchingQuizzes] = useState(false);

  const navigateTo = (path) => {
    window.location.href = path;
  };

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      toast.error('Please login to view rankings');
      navigateTo('/login');
      return;
    }
    fetchCategories();
    fetchQuizzes();
    setLoading(false);
  }, []);

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

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await UserService.fetchCategories();
      setCategories(fetchedCategories);
    } catch (error) {
       toast.error(error.message || 'Error fetching categories');
    }
  };

  const handleQuizClick = (quizId) => {
    navigateTo(`/rankings/${quizId}`);
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

  //Rankings UI
return (
  <div>
    <div className="min-h-screen" style={{ 
      backgroundColor: '#BBBFCA',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Trophy className="h-8 w-8 mr-3" style={{ color: '#495464' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#495464' }}>
              Quiz Rankings
            </h1>
          </div>
          <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
            See how you stack up against other quiz takers
          </p>
        </div>
        
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
        <div className="pb-8">
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
                <span className="ml-3" style={{ color: '#495464' }}>Loading quizzes...</span>
              </div>
            ) : quizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map(quiz => (
                  <QuizBox 
                    key={quiz.id} 
                    quiz={quiz} 
                    onClick={handleQuizClick}
                    showRankingHint={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464', opacity: 0.5 }} />
                <p className="text-lg mb-2" style={{ color: '#495464' }}>
                  No quizzes found matching your criteria.
                </p>
                <p className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                  Try adjusting your search or filters to find quiz rankings.
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
import { useState, useEffect } from 'react';
import { Search, Edit3, Settings, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import QuizBox from '../../Shared/Quizbox';
import AuthService from '../../Services/AuthService';
import AdminService from '../../Services/AdminService';

export default function EditQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigate function
  const navigateTo = (path) => {
    window.location.href = path;
  };

  // Fetch all quizzes
  const fetchQuizzes = async () => {
    try {
      console.log('Fetching quizzes...');
      const fetchedQuizzes = await AdminService.getAllQuizzes();
      console.log('Fetched quizzes:', fetchedQuizzes);
      
      const transformedQuizzes = fetchedQuizzes.map(quiz => ({
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        category: quiz.categoryName || quiz.category,
        difficulty: quiz.difficulty?.toString() || quiz.difficultyName,
        numberOfQuestions: quiz.numberOfQuestions,
        timeToFinish: quiz.timeLimitMinutes 
      }));
      
      setQuizzes(transformedQuizzes);
      setFilteredQuizzes(transformedQuizzes);
      setError(null);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError(error.message || 'Failed to fetch quizzes');
      toast.error(error.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredQuizzes(quizzes);
    } else {
      const filtered = quizzes.filter(quiz =>
        quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    }
  }, [searchTerm, quizzes]);

  // Initialize page
  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!AuthService.isAuthenticated() || !AuthService.isAdmin()) {
      toast.error('Access denied. Admin privileges required.');
      navigateTo('/login');
      return;
    }

    fetchQuizzes();
  }, []);

  const handleQuizClick = (quizId) => {
    navigateTo(`/edit-quiz/${quizId}`);
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
          <p className="text-lg" style={{ color: '#495464' }}>Loading quizzes...</p>
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
          <Settings className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464', opacity: 0.7 }} />
          <p className="text-lg mb-2" style={{ color: '#495464' }}>Error Loading Quizzes</p>
          <p className="text-sm mb-4" style={{ color: '#495464', opacity: 0.7 }}>{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchQuizzes();
              }}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
              style={{ 
                backgroundColor: '#495464',
                color: 'white'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <Settings className="h-8 w-8 mr-3" style={{ color: '#495464' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#495464' }}>
              Edit Quizzes
            </h1>
          </div>
          <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
            Select a quiz to edit its details and questions
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="py-6">
          <div className="flex gap-4 justify-between items-center">
            <div className="flex-1 max-w-md relative">
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" 
                  style={{ color: '#495464' }}
                />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: '#E8E8E8',
                    color: '#495464',
                    focusRingColor: '#495464'
                  }}
                />
              </div>
            </div>
            <div className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
              {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''} found
            </div>
          </div>
        </div>

        {/* Quiz Display Area */}
        <div className="pb-8">
          <div 
            className="w-full rounded-2xl shadow-lg p-8"
            style={{ backgroundColor: '#E8E8E8' }}
          >
            {filteredQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map(quiz => (
                  <div key={quiz.id} className="relative group">
                    <QuizBox 
                      quiz={quiz} 
                      onClick={handleQuizClick}
                    />
                    {/* Edit indicator overlay */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div 
                        className="p-2 rounded-full shadow-lg"
                        style={{ backgroundColor: '#495464' }}
                      >
                        <Edit3 className="h-4 w-4" style={{ color: 'white' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464', opacity: 0.5 }} />
                <p className="text-lg mb-2" style={{ color: '#495464' }}>
                  {searchTerm ? 'No quizzes found matching your search.' : 'No quizzes available to edit.'}
                </p>
                <p className="text-sm mb-6" style={{ color: '#495464', opacity: 0.7 }}>
                  {searchTerm ? 'Try adjusting your search term.' : 'Create your first quiz to get started.'}
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
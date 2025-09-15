import { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';

const Navbar = ({ isAdmin }) => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  if (!user) return null;

return (
  <nav 
    className="shadow-sm border-b-2 px-8 py-4"
    style={{ 
      backgroundColor: '#495464',
      borderBottomColor: '#BBBFCA',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}
  >
    <div className="flex items-center justify-between">
      <div 
        className="text-2xl font-bold cursor-pointer"
        style={{ color: '#BBBFCA' }}
        onClick={() => navigateTo(isAdmin ? '/add-quiz' : '/home')}
      >
        QuizHub
      </div>

      <div className="flex items-center space-x-6">
        {isAdmin ? (
          // Admin Navigation
          <>
            <button
              onClick={() => navigateTo('/add-quiz')}
              className="px-4 py-2 rounded-lg hover:bg-opacity-20 hover:bg-white transition-all duration-200"
              style={{ color: '#BBBFCA' }}
            >
              Add Quiz
            </button>
            <button
              onClick={() => navigateTo('/live-quiz-arena')}
              className="px-4 py-2 rounded-lg hover:bg-opacity-20 hover:bg-white transition-all duration-200"
              style={{ color: '#BBBFCA' }}
            >
              Start Live Quiz
            </button>
            <button
              onClick={() => navigateTo('/edit-quiz')}
              className="px-4 py-2 rounded-lg hover:bg-opacity-20 hover:bg-white transition-all duration-200"
              style={{ color: '#BBBFCA' }}
            >
              Edit Quiz
            </button>
            <button
              onClick={() => navigateTo('/user-results')}
              className="px-4 py-2 rounded-lg hover:bg-opacity-20 hover:bg-white transition-all duration-200"
              style={{ color: '#BBBFCA' }}
            >
              User Results
            </button>
          </>
        ) : (
          // User Navigation
          <>
            <button
              onClick={() => navigateTo('/home')}
              className="px-4 py-2 rounded-lg hover:bg-opacity-20 hover:bg-white transition-all duration-200"
              style={{ color: '#BBBFCA' }}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('/my-results')}
              className="px-4 py-2 rounded-lg hover:bg-opacity-20 hover:bg-white transition-all duration-200"
              style={{ color: '#BBBFCA' }}
            >
              My Results
            </button>
            <button
              onClick={() => navigateTo('/rankings')}
              className="px-4 py-2 rounded-lg hover:bg-opacity-20 hover:bg-white transition-all duration-200"
              style={{ color: '#BBBFCA' }}
            >
              Rankings
            </button>
          </>
        )}

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-opacity-20 hover:bg-white transition-all duration-200"
            style={{ color: '#BBBFCA' }}
          >
            {/* Show profile picture only for regular users, not admin */}
            {!isAdmin && user.profilePictureBase64 ? (
              <img
                src={`data:image/jpeg;base64,${user.profilePictureBase64}`}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8" />
            )}
            <span className="font-medium">{user.username}</span>
          </button>

          {/* Logout */}
          {showDropdown && (
            <div 
              className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-50"
              style={{ backgroundColor: '#E8E8E8' }}
            >
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm hover:bg-opacity-50 hover:bg-gray-300 transition-colors duration-200"
                style={{ color: '#495464' }}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </nav>
);
};

export default Navbar;
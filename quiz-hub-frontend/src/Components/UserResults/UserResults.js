import React, { useState, useEffect } from 'react';
import { Search, Users, BarChart3, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthService from '../../Services/AuthService';
import AdminService from '../../Services/AdminService';

export default function UserResults() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigate function
  const navigateTo = (path) => {
    window.location.href = path;
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const fetchedUsers = await AdminService.getAllUsers();
      console.log('Fetched users:', fetchedUsers);
      
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Initialize page
  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!AuthService.isAuthenticated() || !AuthService.isAdmin()) {
      toast.error('Access denied. Admin privileges required.');
      navigateTo('/login');
      return;
    }

    fetchUsers();
  }, []);

  // Handle user click
  const handleUserClick = (userId) => {
    navigateTo(`/user-results/${userId}`);
  };

  // Format date
  const formatDate = (dateString) => {
    if (dateString === '0001-01-01T00:00:00' || !dateString) {
      return 'Never';
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <p className="text-lg" style={{ color: '#495464' }}>Loading users...</p>
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
          <Users className="h-16 w-16 mx-auto mb-4" style={{ color: '#ef4444', opacity: 0.7 }} />
          <p className="text-lg mb-2" style={{ color: '#495464' }}>Error Loading Users</p>
          <p className="text-sm mb-4" style={{ color: '#495464', opacity: 0.7 }}>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchUsers();
            }}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: '#22c55e',
              color: 'white'
            }}
          >
            Try Again
          </button>
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
        {/* Header */}
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 mr-3" style={{ color: '#495464' }} />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#495464' }}>
                  User Results
                </h1>
                <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
                  View all users and their quiz performance
                </p>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-4 justify-between items-center">
            <div className="flex-1 max-w-md relative">
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" 
                  style={{ color: '#495464' }}
                />
                <input
                  type="text"
                  placeholder="Search users..."
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
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Users Display Area */}
        <div className="px-8 pb-8">
          <div 
            className="w-full rounded-2xl shadow-lg p-8"
            style={{ backgroundColor: '#E8E8E8' }}
          >
            {filteredUsers.length > 0 ? (
              <div className="space-y-4">
                {filteredUsers.map(user => (
                  <div 
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className="flex items-center p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md"
                    style={{ 
                      backgroundColor: '#F4F4F2',
                      borderColor: '#BBBFCA'
                    }}
                  >
                    {/* Profile Picture */}
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2" style={{ borderColor: '#BBBFCA' }}>
                      <img 
                        src={user.profilePictureBase64 ? 
                          `data:image/jpeg;base64,${user.profilePictureBase64}` : 
                          `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&size=48`
                        }
                        alt={user.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&size=48`;
                        }}
                      />
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-semibold" style={{ color: '#495464' }}>
                          {user.username}
                        </h3>
                      </div>
                      <p className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                        {user.email}
                      </p>
                    </div>

                    {/* Quiz Stats */}
                    <div className="flex items-center gap-6 mr-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <BarChart3 className="h-4 w-4 mr-1" style={{ color: '#3b82f6' }} />
                          <span className="text-lg font-bold" style={{ color: '#495464' }}>
                            {user.totalQuizzesTaken}
                          </span>
                        </div>
                        <div className="text-xs" style={{ color: '#495464', opacity: 0.7 }}>
                          Quizzes
                        </div>
                      </div>
                    </div>

                    {/* Arrow Indicator */}
                    <div className="text-right">
                      <svg 
                        className="h-5 w-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: '#495464', opacity: 0.5 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464', opacity: 0.5 }} />
                <p className="text-lg mb-2" style={{ color: '#495464' }}>
                  {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import Navbar from '../../Shared/Navbar';
export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
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

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div>
      <Navbar/>
    <div className="min-h-screen" style={{ 
      backgroundColor: '#BBBFCA',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:opacity-90"
          style={{ 
            backgroundColor: '#495464',
            color: 'white'
          }}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-6" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div 
          className="w-full max-w-2xl p-12 rounded-2xl shadow-lg text-center"
          style={{ backgroundColor: '#E8E8E8' }}
        >
          {/* Profile Picture */}
          <div className="mb-8">
            <img
              src={`data:image/jpeg;base64,${user.profilePictureBase64}`}
              alt={`${user.username}'s profile`}
              className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg"
              style={{ border: '4px solid #495464' }}
            />
          </div>

          {/* Welcome Message */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold" style={{ color: '#495464' }}>
              Hello, {user.username}!
            </h2>
            
            <p className="text-xl" style={{ color: '#495464', opacity: 0.8 }}>
              Welcome back to QuizHub
            </p>

            {/* User Info */}
            <div className="mt-8 space-y-3">
              <div 
                className="inline-block px-4 py-2 rounded-xl"
                style={{ backgroundColor: '#F4F4F2' }}
              >
                <span className="text-sm font-medium" style={{ color: '#495464' }}>
                  Email: {user.email}
                </span>
              </div>
              
              <div 
                className="inline-block px-4 py-2 rounded-xl ml-3"
                style={{ backgroundColor: '#F4F4F2' }}
              >
                <span className="text-sm font-medium" style={{ color: '#495464' }}>
                  Role: {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Future Features Placeholder */}
          <div className="mt-12">
            <div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: '#F4F4F2' }}
            >
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#495464' }}>
                Coming Soon
              </h3>
              <p style={{ color: '#495464', opacity: 0.7 }}>
                Quiz features and more functionality will be added here!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
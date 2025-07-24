import React, { useState, useEffect, useRef } from 'react';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (userData && token) {
        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
        } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/login';
    }
    }
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Home', href: '/home' },
    { name: 'Rankings', href: '/rankings' },
    { name: 'My Results', href: '/my-results' }
  ];

  if (!user) {
    return null; // Don't render navbar if user is not loaded
  }

  return (
    <nav 
      className="w-full px-6 py-8 shadow-sm"
      style={{ 
        backgroundColor: '#E8E8E8',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <a 
            href="/home"
            className="text-4xl font-bold hover:opacity-80 transition-opacity duration-200"
            style={{ color: '#495464' }}
          >
            QuizHub
          </a>
        </div>

        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-xl font-medium hover:opacity-80 transition-opacity duration-200"
              style={{ color: '#495464' }}
            >
              {item.name}
            </a>
          ))}

          <div className="flex items-center space-x-3">
            <span 
              className="text-xl font-medium"
              style={{ color: '#080808ff' }}
            >
              {user.username}
            </span>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full transition-all duration-200"
                style={{ focusRingColor: '#BBBFCA' }}
              >
                <img
                  src={`data:image/jpeg;base64,${user.profilePictureBase64}`}
                  alt={`${user.username}'s profile`}
                  className="w-12 h-12 rounded-full object-cover hover:opacity-90 transition-opacity duration-200"
                  style={{ border: '2px solid #495464' }}
                />
              </button>

              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-50"
                  style={{ backgroundColor: '#F4F4F2' }}
                >
                  <div className="py-2">

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200 text-left"
                        style={{ color: '#495464' }}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
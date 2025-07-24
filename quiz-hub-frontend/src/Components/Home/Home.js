import React, { useState, useEffect } from 'react';
import { LogOut, Search } from 'lucide-react';
import Navbar from '../../Shared/Navbar';
import QuizBox from '../../Shared/Quizbox';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hardcoded quizzes for testing
  const sampleQuizzes = [
    {
      id: 1,
      name: "JavaScript Fundamentals",
      description: "Test your knowledge of JavaScript basics including variables, functions, and data types. Perfect for beginners learning web development.",
      category: "Programming",
      difficulty: "Easy",
      numberOfQuestions: 10,
      timeToFinish: 15
    },
    {
      id: 2,
      name: "World War II History",
      description: "Comprehensive quiz covering major events, battles, and figures from World War II. Explore the timeline of this pivotal period in history.",
      category: "History",
      difficulty: "Medium",
      numberOfQuestions: 20,
      timeToFinish: 30
    },
    {
      id: 3,
      name: "Advanced React Concepts",
      description: "Challenge yourself with advanced React topics including hooks, context, performance optimization, and modern patterns.",
      category: "Programming",
      difficulty: "Hard",
      numberOfQuestions: 15,
      timeToFinish: 25
    },
    {
      id: 4,
      name: "Ancient Civilizations",
      description: "Journey through ancient Egypt, Greece, Rome, and Mesopotamia. Test your knowledge of these foundational civilizations.",
      category: "History",
      difficulty: "Easy",
      numberOfQuestions: 12,
      timeToFinish: 20
    },
    {
      id: 5,
      name: "Python Data Structures",
      description: "Master Python's built-in data structures including lists, dictionaries, sets, and tuples. Essential for data science and backend development.",
      category: "Programming",
      difficulty: "Medium",
      numberOfQuestions: 18,
      timeToFinish: 35
    },
    {
      id: 6,
      name: "Medieval Europe",
      description: "Explore the Middle Ages covering feudalism, the Crusades, major monarchs, and cultural developments in medieval European society.",
      category: "History",
      difficulty: "Hard",
      numberOfQuestions: 25,
      timeToFinish: 40
    }
  ];

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
                className="px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: '#E8E8E8',
                  color: '#495464',
                  focusRingColor: '#495464'
                }}
              >
                <option value="">All Categories</option>
                <option value="programming">Programming</option>
                <option value="history">History</option>
              </select>

              {/* Difficulty Filter */}
              <select
                className="px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: '#E8E8E8',
                  color: '#495464',
                  focusRingColor: '#495464'
                }}
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sampleQuizzes.map(quiz => (
                <QuizBox key={quiz.id} quiz={quiz} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
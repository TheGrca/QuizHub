import React, { useState } from 'react';
import { Eye, EyeOff, Mail, User } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) {
      setError('');
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log("Usao")
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data)
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        window.location.href = '/home';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

 return (
    <div className="min-h-screen flex flex-col" style={{ 
      backgroundColor: '#BBBFCA',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header with QuizHub */}
      <div className="absolute top-6 left-6">
        <h1 className="text-4xl font-bold" style={{ color: '#495464' }}>
          QuizHub
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div 
          className="w-full max-w-xl p-10 rounded-2xl shadow-lg"
          style={{ backgroundColor: '#E8E8E8' }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#495464' }}>
              Welcome Back to QuizHub
            </h2>
            <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
              Sign in to your account
            </p>
          </div>

          <div className="space-y-6">
            {/* Email/Username Input */}
            <div>
              <label 
                htmlFor="emailOrUsername" 
                className="block text-xl font-semibold mb-3"
                style={{ color: '#495464', fontFamily: 'inherit' }}
              >
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5" style={{ color: '#BBBFCA' }} />
                </div>
                <input
                  type="text"
                  id="emailOrUsername"
                  name="emailOrUsername"
                  value={formData.emailOrUsername}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-4 text-base rounded-xl border-0 focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ 
                    backgroundColor: '#F4F4F2',
                    color: '#495464',
                    fontFamily: 'inherit',
                    border: '1px solid #BBBFCA'
                  }}
                  placeholder="Enter your email or username"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-xl font-semibold mb-3"
                style={{ color: '#495464', fontFamily: 'inherit' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-12 py-4 text-base rounded-xl border-0 focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ 
                    backgroundColor: '#F4F4F2',
                    color: '#495464',
                    fontFamily: 'inherit',
                    border: '1px solid #BBBFCA'
                  }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" style={{ color: '#BBBFCA' }} />
                  ) : (
                    <Eye className="h-5 w-5" style={{ color: '#BBBFCA' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#495464',
                focusRingColor: '#BBBFCA'
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div 
                    className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"
                  ></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p style={{ color: '#495464', opacity: 0.7 }}>
              Don't have an account?{' '}
              <a 
                href="/Register" 
                className="font-semibold hover:underline transition-colors duration-200"
                style={{ color: '#495464' }}
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
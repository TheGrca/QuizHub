import React, { useState } from 'react';
import { Eye, EyeOff, Mail, User, Upload, Image } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    profilePicture: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      if (errors.profilePicture) {
        setErrors(prev => ({
          ...prev,
          profilePicture: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    if (!formData.profilePicture) {
      newErrors.profilePicture = 'Profile picture is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate registration process
    setTimeout(() => {
      console.log('Register attempt:', {
        ...formData,
        profilePicture: formData.profilePicture?.name
      });
      setIsLoading(false);
    }, 1500);
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
              Join QuizHub
            </h2>
            <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
              Create your account
            </p>
          </div>

          <div className="space-y-6">
            {/* Username Input */}
            <div>
              <label 
                htmlFor="username" 
                className="block text-xl font-semibold mb-3"
                style={{ color: '#495464', fontFamily: 'inherit' }}
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5" style={{ color: '#BBBFCA' }} />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-4 text-base rounded-xl border-0 focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ 
                    backgroundColor: '#F4F4F2',
                    color: '#495464',
                    fontFamily: 'inherit',
                    border: errors.username ? '2px solid #ef4444' : '1px solid #BBBFCA'
                  }}
                  placeholder="Choose a username"
                  required
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-xl font-semibold mb-3"
                style={{ color: '#495464', fontFamily: 'inherit' }}
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" style={{ color: '#BBBFCA' }} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-4 text-base rounded-xl border-0 focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ 
                    backgroundColor: '#F4F4F2',
                    color: '#495464',
                    fontFamily: 'inherit',
                    border: errors.email ? '2px solid #ef4444' : '1px solid #BBBFCA'
                  }}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Profile Picture Input */}
            <div>
              <label 
                htmlFor="profilePicture" 
                className="block text-xl font-semibold mb-3"
                style={{ color: '#495464', fontFamily: 'inherit' }}
              >
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile Preview"
                      className="w-16 h-16 rounded-full object-cover"
                      style={{ border: errors.profilePicture ? '2px solid #ef4444' : '2px solid #BBBFCA' }}
                    />
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: '#F4F4F2',
                        border: errors.profilePicture ? '2px solid #ef4444' : '2px solid #BBBFCA'
                      }}
                    >
                      <Image className="h-8 w-8" style={{ color: '#BBBFCA' }} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="profilePicture"
                    className="cursor-pointer inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: '#495464',
                      color: 'white'
                    }}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Choose Image
                  </label>
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    required
                  />
                  <p className="mt-2 text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                    Upload a profile picture (JPG, PNG)
                  </p>
                </div>
              </div>
              {errors.profilePicture && (
                <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>
                  {errors.profilePicture}
                </p>
              )}
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
                    border: errors.password ? '2px solid #ef4444' : '1px solid #BBBFCA'
                  }}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" style={{ color: '#BBBFCA' }} />
                  ) : (
                    <Eye className="h-5 w-5" style={{ color: '#BBBFCA' }} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Register Button */}
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
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p style={{ color: '#495464', opacity: 0.7 }}>
              Already have an account?{' '}
              <a 
                href="/login" 
                className="font-semibold hover:underline transition-colors duration-200"
                style={{ color: '#495464' }}
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
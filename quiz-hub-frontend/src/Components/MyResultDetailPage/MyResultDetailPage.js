import { useState, useEffect } from 'react';
import { Clock, Award, ArrowLeft, TrendingUp, BarChart3, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import QuestionResult from './QuestionResult';
import AuthService from '../../Services/AuthService';
import UserService from '../../Services/UserService';

const getResultIdFromUrl = () => {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 1];
  };


export default function QuizResultDetail() {
  const resultId = getResultIdFromUrl();
  const [result, setResult] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigateTo = (path) => {
    window.location.href = path;
  };


const fetchResult = async () => {
  try {
    if (!AuthService.isAuthenticated()) {
      toast.error('Please login to view quiz results');
      navigateTo('/login');
      return;
    }

    const user = AuthService.getCurrentUser();
    
    if (!user || !user.id) {
      toast.error('User not found. Please login again.');
      navigateTo('/login');
      return;
    }
    const resultData = await UserService.getQuizResultDetail(resultId);
    
    if (resultData) {
      setResult(resultData);
      
      // Set progress data if available
      if (resultData.progressData && Array.isArray(resultData.progressData) && resultData.progressData.length > 0) {
        const formattedProgressData = resultData.progressData.map(item => ({
          ...item,
          date: new Date(item.date).toISOString().split('T')[0] 
        }));
        setProgressData(formattedProgressData);
      } else {
        setProgressData([]);
      }
    } else {
      throw new Error('No result data received');
    }
  } catch (error) {
    setError(error.message || 'Failed to load quiz result');
    toast.error(error.message || 'Failed to load quiz result');
    
    if (error.message && error.message.includes('login')) {
      navigateTo('/login');
    } 
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    });
  };

  const formatTooltipDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 border rounded-lg shadow-lg" style={{ backgroundColor: '#F4F4F2', borderColor: '#BBBFCA' }}>
          <p className="font-medium" style={{ color: '#495464' }}>{`Attempt ${data.attemptNumber}`}</p>
          <p style={{ color: '#3b82f6' }}>{`Score: ${data.score}/${data.maxPoints} points`}</p>
          <p style={{ color: '#495464', opacity: 0.7 }}>{`Date: ${formatTooltipDate(data.date)}`}</p>
          <p style={{ color: '#495464', opacity: 0.7 }}>{`Percentage: ${data.percentage.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  const handleBackToResults = () => {
    navigateTo('/my-results');
  };

  const handleTakeAnotherQuiz = () => {
    navigateTo('/home');
  };

  const handleRetakeQuiz = () => {
    navigateTo(`/quiz/${result.quizId}`);
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
          <p className="text-lg" style={{ color: '#495464' }}>Loading quiz results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div className="text-center p-8 rounded-2xl shadow-lg" style={{ backgroundColor: '#E8E8E8' }}>
          <BarChart3 className="h-16 w-16 mx-auto mb-4" style={{ color: '#ef4444', opacity: 0.7 }} />
          <p className="text-lg mb-2" style={{ color: '#495464' }}>Error Loading Result</p>
          <p className="text-sm mb-4" style={{ color: '#495464', opacity: 0.7 }}>{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchResult();
              }}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
              style={{ 
                backgroundColor: '#22c55e',
                color: 'white'
              }}
            >
              Try Again
            </button>
            <button
              onClick={handleBackToResults}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
              style={{ 
                backgroundColor: '#495464',
                color: 'white'
              }}
            >
              Back to Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div className="text-center p-8 rounded-2xl shadow-lg" style={{ backgroundColor: '#E8E8E8' }}>
          <Target className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464', opacity: 0.5 }} />
          <p className="text-lg mb-4" style={{ color: '#495464' }}>Quiz result not found</p>
          <button
            onClick={handleBackToResults}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: '#495464',
              color: 'white'
            }}
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  //Results Detail Page UI
  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: '#BBBFCA',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBackToResults}
            className="flex items-center mb-4 font-medium transition-all duration-200 hover:opacity-80"
            style={{ color: '#495464' }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to My Results
          </button>
          <div className="flex items-center">
            <Target className="h-8 w-8 mr-3" style={{ color: '#495464' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#495464' }}>
              Quiz Results
            </h1>
          </div>
        </div>

        {/* Results Summary */}
        <div className="rounded-lg p-8 shadow-md mb-8" style={{ backgroundColor: '#E8E8E8' }}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#495464' }}>
              {result.quizName}
            </h2>
            <div className="flex items-center justify-center mb-4">
              <Award className="h-8 w-8 mr-2" style={{ color: '#f59e0b' }} />
              <span className="text-3xl font-bold" style={{ color: getPercentageColor(result.percentage) }}>
                {result.percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F4F4F2' }}>
              <div className="text-2xl font-bold" style={{ color: '#495464' }}>
                {result.correctAnswers}/{result.totalQuestions}
              </div>
              <div className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                Questions Correct
              </div>
            </div>

            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F4F4F2' }}>
              <div className="text-2xl font-bold" style={{ color: '#495464' }}>
                {result.score}/{result.totalPoints}
              </div>
              <div className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                Points Earned
              </div>
            </div>

            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F4F4F2' }}>
              <div className="flex items-center justify-center text-2xl font-bold" style={{ color: '#495464' }}>
                <Clock className="h-6 w-6 mr-2" />
                {formatTime(result.timeTakenSeconds)}
              </div>
              <div className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                Time Taken
              </div>
            </div>
          </div>
        </div>

        {/* Question Results */}
        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-bold" style={{ color: '#495464' }}>
            Question Details
          </h3>
          {result.questionResults && result.questionResults.map((questionResult, index) => (
            <QuestionResult
              key={questionResult.question.id}
              question={questionResult.question}
              userAnswer={questionResult.userAnswer}
              isCorrect={questionResult.isCorrect}
              pointsEarned={questionResult.pointsEarned}
            />
          ))}
        </div>

        {/* Progress Chart - Only show if multiple attempts */}
        {progressData.length > 1 && (
          <div className="rounded-lg p-8 shadow-md mb-8" style={{ backgroundColor: '#E8E8E8' }}>
            <div className="flex items-center mb-6">
              <TrendingUp className="h-6 w-6 mr-2" style={{ color: '#3b82f6' }} />
              <h3 className="text-xl font-bold" style={{ color: '#495464' }}>
                Progress Over Time
              </h3>
            </div>
            
            <div className="rounded-lg p-4" style={{ backgroundColor: '#F4F4F2', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#BBBFCA" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#495464"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    domain={[0, progressData[0]?.maxPoints || 100]}
                    stroke="#495464"
                    fontSize={12}
                    label={{ value: 'Points', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

              <div className="mt-4 text-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: '#495464' }}>
                      {progressData.length}
                    </div>
                    <div className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                      Total Attempts
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: '#22c55e' }}>
                      {Math.max(...progressData.map(p => p.percentage)).toFixed(1)}%
                    </div>
                    <div className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                      Best Percentage
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={handleTakeAnotherQuiz}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 inline-flex items-center"
            style={{ 
              backgroundColor: '#353b42ff',
              color: 'white'
            }}
          >
            <Target className="h-5 w-5 mr-2" />
            Take Another Quiz
          </button>
          <button
            onClick={handleRetakeQuiz}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 inline-flex items-center"
            style={{ 
              backgroundColor: '#495464',
              color: 'white'
            }}
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Retake This Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Award, ArrowLeft, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

// Question Result Component
const QuestionResult = ({ question, userAnswer, isCorrect, pointsEarned }) => {
  const getCorrectAnswers = () => {
    switch (question.questionType) {
      case 'MultipleChoiceQuestion':
        return [question.correctAnswerIndex];
      case 'MultipleAnswerQuestion':
        return question.correctAnswerIndices.split(',').map(i => parseInt(i));
      case 'TrueFalseQuestion':
        return [question.trueFalseCorrectAnswer];
      case 'TextInputQuestion':
        return [question.correctAnswer];
      default:
        return [];
    }
  };

  const getUserAnswers = () => {
    switch (question.questionType) {
      case 'MultipleChoiceQuestion':
        return userAnswer.selectedOptionIndex !== null ? [userAnswer.selectedOptionIndex] : [];
      case 'MultipleAnswerQuestion':
        return userAnswer.selectedOptionIndices ? userAnswer.selectedOptionIndices.split(',').map(i => parseInt(i)) : [];
      case 'TrueFalseQuestion':
        return userAnswer.userAnswer !== null ? [userAnswer.userAnswer] : [];
      case 'TextInputQuestion':
        return userAnswer.userAnswerText ? [userAnswer.userAnswerText] : [];
      default:
        return [];
    }
  };

  const renderAnswerOptions = () => {
    const correctAnswers = getCorrectAnswers();
    const userAnswers = getUserAnswers();

    switch (question.questionType) {
      case 'MultipleChoiceQuestion':
      case 'MultipleAnswerQuestion':
        const options = [question.option1, question.option2, question.option3, question.option4];
        return (
          <div className="space-y-2">
            {options.map((option, index) => {
              const isCorrectOption = correctAnswers.includes(index);
              const isUserSelected = userAnswers.includes(index);
              
              let className = 'p-3 rounded-lg border ';
              if (isCorrectOption) {
                className += 'bg-green-100 border-green-300 ';
              }
              if (isUserSelected && !isCorrectOption) {
                className += 'bg-red-100 border-red-300 ';
              }
              if (!isCorrectOption && !isUserSelected) {
                className += 'bg-gray-50 border-gray-200 ';
              }

              return (
                <div key={index} className={className}>
                  <div className="flex items-center">
                    <span className="flex-1">{option}</span>
                    {isCorrectOption && (
                      <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                    )}
                    {isUserSelected && !isCorrectOption && (
                      <XCircle className="h-5 w-5 text-red-600 ml-2" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'TrueFalseQuestion':
        const correctAnswer = correctAnswers[0];
        const userAnswer = userAnswers[0];
        
        return (
          <div className="space-y-2">
            <div className={`p-3 rounded-lg border ${
              correctAnswer === true ? 'bg-green-100 border-green-300' : 
              (userAnswer === true && correctAnswer !== true) ? 'bg-red-100 border-red-300' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center">
                <span className="flex-1">True</span>
                {correctAnswer === true && <CheckCircle className="h-5 w-5 text-green-600 ml-2" />}
                {userAnswer === true && correctAnswer !== true && <XCircle className="h-5 w-5 text-red-600 ml-2" />}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${
              correctAnswer === false ? 'bg-green-100 border-green-300' : 
              (userAnswer === false && correctAnswer !== false) ? 'bg-red-100 border-red-300' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center">
                <span className="flex-1">False</span>
                {correctAnswer === false && <CheckCircle className="h-5 w-5 text-green-600 ml-2" />}
                {userAnswer === false && correctAnswer !== false && <XCircle className="h-5 w-5 text-red-600 ml-2" />}
              </div>
            </div>
          </div>
        );

      case 'TextInputQuestion':
        const correctText = correctAnswers[0];
        const userText = userAnswers[0] || 'No answer provided';
        
        return (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-green-100 border border-green-300">
              <div className="text-sm font-medium text-green-800 mb-1">Correct Answer:</div>
              <div className="text-green-700">{correctText}</div>
            </div>
            <div className={`p-3 rounded-lg border ${
              isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
            }`}>
              <div className={`text-sm font-medium mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                Your Answer:
              </div>
              <div className={isCorrect ? 'text-green-700' : 'text-red-700'}>{userText}</div>
            </div>
          </div>
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div className="rounded-lg p-6 border shadow-sm" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex-1 pr-4">
          {question.text}
        </h3>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isCorrect ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <XCircle className="h-4 w-4 mr-1" />
            )}
            {pointsEarned}/{question.points} pts
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        {renderAnswerOptions()}
      </div>
    </div>
  );
};

export default function QuizResultDetail() {
  // Get result ID from URL
  const getResultIdFromUrl = () => {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 1];
  };

  const resultId = getResultIdFromUrl();
  const [result, setResult] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch quiz result
  const fetchResult = async () => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user.id) {
        toast.error('User not found. Please login again.');
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/user/quiz-result/${resultId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-User-Id': user.id.toString()
        },
      });

      if (response.ok) {
        const resultData = await response.json();
        setResult(resultData);
      } else {
        toast.error('Failed to load quiz results');
        window.location.href = '/my-results';
      }
    } catch (error) {
      console.error('Error fetching quiz result:', error);
      toast.error('Failed to load quiz results');
      window.location.href = '/my-results';
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
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Attempt ${data.attemptNumber}`}</p>
          <p className="text-blue-600">{`Score: ${data.score}/${data.maxPoints} points`}</p>
          <p className="text-gray-600">{`Date: ${formatTooltipDate(data.date)}`}</p>
          <p className="text-gray-600">{`Percentage: ${data.percentage.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#BBBFCA' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#495464' }}></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#BBBFCA' }}>
        <div className="text-center">
          <p className="text-gray-600 text-lg">Quiz result not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#BBBFCA' }}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => window.location.href = '/my-results'}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to My Results
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
        </div>

        {/* Results Summary */}
        <div className="rounded-lg p-8 shadow-md mb-8" style={{ backgroundColor: '#E8E8E8' }}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.quizName}</h2>
            <div className="flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-yellow-500 mr-2" />
              <span className={`text-3xl font-bold ${getPercentageColor(result.percentage)}`}>
                {result.percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {result.correctAnswers}/{result.totalQuestions}
              </div>
              <div className="text-gray-600">Questions Correct</div>
            </div>

            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {result.score}/{result.totalPoints}
              </div>
              <div className="text-gray-600">Points Earned</div>
            </div>

            <div className="text-center p-4 bg-white rounded-lg">
              <div className="flex items-center justify-center text-2xl font-bold text-gray-900">
                <Clock className="h-6 w-6 mr-2" />
                {formatTime(result.timeTakenSeconds)}
              </div>
              <div className="text-gray-600">Time Taken</div>
            </div>
          </div>
        </div>

        {/* Question Results */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Question Details</h3>
          {result.questionResults.map((questionResult, index) => (
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
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-900">Progress Over Time</h3>
            </div>
            
            <div className="bg-white rounded-lg p-4" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#6b7280"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    domain={[0, progressData[0]?.maxPoints || 100]}
                    stroke="#6b7280"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {progressData.length}
                  </div>
                  <div className="text-gray-600">Total Attempts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {Math.max(...progressData.map(p => p.score))}
                  </div>
                  <div className="text-gray-600">Best Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {Math.max(...progressData.map(p => p.percentage)).toFixed(1)}%
                  </div>
                  <div className="text-gray-600">Best Percentage</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => window.location.href = '/home'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Take Another Quiz
          </button>
          <button
            onClick={() => window.location.href = `/quiz/${result.quizId}`}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Retake This Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
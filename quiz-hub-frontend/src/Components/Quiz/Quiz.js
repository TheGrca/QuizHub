import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import QuestionDisplay from './QuestionDisplay';
import FinishQuizModal from './FinishQuizModal';
import AuthService from '../../Services/AuthService'
import UserService from '../../Services/UserService';

export default function Quiz() {
  const getQuizIdFromUrl = () => {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 1];
  };

  const id = getQuizIdFromUrl();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const fetchQuiz = async () => {
    try {
      if (!AuthService.isAuthenticated()) {
        toast.error('Please login to access this quiz');
        navigateTo('/login');
        return;
      }

      const quizData = await UserService.getQuizById(id);
      setQuiz(quizData);
      setTimeLeft(quizData.timeLimitMinutes * 60); 
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error(error.message || 'Failed to load quiz');
      navigateTo('/home');
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const user = AuthService.getCurrentUser();
      
      if (!user || !user.id) {
        toast.error('User not found. Please login again.');
        navigateTo('/login');
        return;
      }
      
      const userAnswers = quiz.questions.map((question, index) => ({
        QuestionId: question.id,
        AnswerType: question.questionType,
        ...(question.questionType === 'MultipleChoiceQuestion' && {
          SelectedOptionIndex: answers[index] !== undefined ? answers[index] : null
        }),
        ...(question.questionType === 'MultipleAnswerQuestion' && {
          SelectedOptionIndices: answers[index] ? answers[index].join(',') : ''
        }),
        ...(question.questionType === 'TrueFalseQuestion' && {
          UserAnswer: answers[index] !== undefined ? answers[index] : null
        }),
        ...(question.questionType === 'TextInputQuestion' && {
          UserAnswerText: answers[index] || ''
        })
      }));

      const submissionData = {
        UserId: user.id,
        QuizId: parseInt(id),
        TimeTakenSeconds: (quiz.timeLimitMinutes * 60) - timeLeft,
        UserAnswers: userAnswers
      };

      const result = await UserService.submitQuiz(submissionData);
      
      navigateTo(`/my-results/${result.resultId}`);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error(error.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !submitting && !hasSubmitted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz && !submitting && !hasSubmitted) {
      setHasSubmitted(true);

      toast.error('Time is up! Submitting quiz automatically.');
      submitQuiz();
    }
  }, [timeLeft, submitting, quiz, hasSubmitted]);

  useEffect(() => {
    fetchQuiz();
  }, [id]);


  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = () => {
    setShowFinishModal(true);
  };

  const handleConfirmFinish = () => {
    setShowFinishModal(false);
    setHasSubmitted(true);
    submitQuiz();
  };

  const handleBackToHome = () => {
    navigateTo('/home');
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
          <p className="text-lg" style={{ color: '#495464' }}>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div className="text-center p-8 rounded-2xl shadow-lg" style={{ backgroundColor: '#E8E8E8' }}>
          <p className="text-lg mb-4" style={{ color: '#495464' }}>Quiz not found</p>
          <button
            onClick={handleBackToHome}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: '#495464',
              color: 'white'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: '#BBBFCA',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with timer and progress */}
        <div className="mb-6 rounded-lg p-6 shadow-md" style={{ backgroundColor: '#E8E8E8' }}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold" style={{ color: '#495464' }}>{quiz.name}</h1>
            <div className={`flex items-center px-4 py-2 rounded-lg font-medium ${
              timeLeft < 300 ? 'text-red-700' : 'text-blue-700'
            }`} style={{ 
              backgroundColor: timeLeft < 300 ? '#fee2e2' : '#dbeafe' 
            }}>
              <Clock className="h-5 w-5 mr-2" />
              {formatTime(timeLeft)}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full rounded-full h-2" style={{ backgroundColor: '#BBBFCA' }}>
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
                backgroundColor: '#495464'
              }}
            ></div>
          </div>
          <div className="flex justify-between text-sm mt-2" style={{ color: '#495464', opacity: 0.7 }}>
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{currentQuestion.points} points</span>
          </div>
        </div>

        {/* Question content */}
        <div className="rounded-lg p-8 shadow-md mb-6" style={{ backgroundColor: '#E8E8E8' }}>
          <QuestionDisplay
            question={currentQuestion}
            answer={answers[currentQuestionIndex]}
            onAnswerChange={handleAnswerChange}
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentQuestionIndex === 0
                ? 'cursor-not-allowed opacity-50'
                : 'hover:opacity-90'
            }`}
            style={{ 
              backgroundColor: currentQuestionIndex === 0 ? '#BBBFCA' : '#495464',
              color: 'white'
            }}
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleFinish}
              disabled={submitting}
              className="px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#495464',
                color: 'white'
              }}
            >
              {submitting ? 'Submitting...' : 'Finish Quiz'}
              {!submitting && <CheckCircle className="ml-2 h-5 w-5" />}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 flex items-center"
              style={{ 
                backgroundColor: '#495464',
                color: 'white'
              }}
            >
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Finish confirmation modal */}
      <FinishQuizModal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={handleConfirmFinish}
        answeredQuestions={Object.keys(answers).length}
        totalQuestions={quiz?.questions?.length || 0}
      />
    </div>
  );
}
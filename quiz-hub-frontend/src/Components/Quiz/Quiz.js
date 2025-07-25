import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Finish Quiz Confirmation Modal
const FinishQuizModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-yellow-100 rounded-full p-3">
            <CheckCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Finish Quiz?
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to finish the quiz? You cannot change your answers after submitting.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Continue Quiz
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Finish Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

// Question Component
const QuestionDisplay = ({ question, answer, onAnswerChange }) => {
  const renderQuestionContent = () => {
    switch (question.questionType) {
      case 'MultipleChoiceQuestion':
        return (
          <div className="space-y-3">
            {[question.option1, question.option2, question.option3, question.option4].map((option, index) => (
              <label key={index} className="flex items-center cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="single-choice"
                  value={index}
                  checked={answer === index}
                  onChange={() => onAnswerChange(index)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  answer === index 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {answer === index && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'MultipleAnswerQuestion':
        return (
          <div className="space-y-3">
            {[question.option1, question.option2, question.option3, question.option4].map((option, index) => (
              <label key={index} className="flex items-center cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={answer && answer.includes(index)}
                  onChange={() => {
                    const currentAnswers = answer || [];
                    const newAnswers = currentAnswers.includes(index)
                      ? currentAnswers.filter(i => i !== index)
                      : [...currentAnswers, index];
                    onAnswerChange(newAnswers);
                  }}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                  answer && answer.includes(index)
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {answer && answer.includes(index) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'TrueFalseQuestion':
        return (
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => onAnswerChange(true)}
              className={`px-8 py-4 rounded-lg font-medium transition-colors ${
                answer === true
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              True
            </button>
            <button
              onClick={() => onAnswerChange(false)}
              className={`px-8 py-4 rounded-lg font-medium transition-colors ${
                answer === false
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              False
            </button>
          </div>
        );

      case 'TextInputQuestion':
        return (
          <textarea
            value={answer || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
        {question.text}
      </h2>
      <div className="mt-6">
        {renderQuestionContent()}
      </div>
    </div>
  );
};

export default function Quiz() {
  // Get quiz ID from URL
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

  // Fetch quiz data
  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/user/quiz/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        const quizData = await response.json();
        setQuiz(quizData);
        setTimeLeft(quizData.timeLimitMinutes * 60); // Convert to seconds
      } else {
        toast.error('Failed to load quiz');
        window.location.href = '/home';
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
      window.location.href = '/home';
    } finally {
      setLoading(false);
    }
  };

  // Submit quiz
  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const userAnswers = quiz.questions.map((question, index) => ({
        questionId: question.id,
        answerType: question.questionType,
        ...(question.questionType === 'MultipleChoiceQuestion' && {
          selectedOptionIndex: answers[index] !== undefined ? answers[index] : null
        }),
        ...(question.questionType === 'MultipleAnswerQuestion' && {
          selectedOptionIndices: answers[index] ? answers[index].join(',') : ''
        }),
        ...(question.questionType === 'TrueFalseQuestion' && {
          userAnswer: answers[index] !== undefined ? answers[index] : null
        }),
        ...(question.questionType === 'TextInputQuestion' && {
          userAnswerText: answers[index] || ''
        })
      }));

      const submissionData = {
        quizId: parseInt(id),
        timeTakenSeconds: (quiz.timeLimitMinutes * 60) - timeLeft,
        userAnswers
      };

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/user/submit-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        const result = await response.json();
        window.location.href = `/my-results/${result.resultId}`;
      } else {
        toast.error('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !submitting) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz) {
      // Time's up - auto submit
      submitQuiz();
    }
  }, [timeLeft, submitting, quiz]);

  // Load quiz on component mount
  useEffect(() => {
    fetchQuiz();
  }, [id]);

  // Format time display
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
    submitQuiz();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#BBBFCA' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#495464' }}></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#BBBFCA' }}>
        <div className="text-center">
          <p className="text-gray-600 text-lg">Quiz not found</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#BBBFCA' }}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with timer and progress */}
        <div className="mb-6" style={{ backgroundColor: '#E8E8E8' }} className="rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.name}</h1>
            <div className={`flex items-center px-4 py-2 rounded-lg font-medium ${
              timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="h-5 w-5 mr-2" />
              {formatTime(timeLeft)}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
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
            className={`px-6 py-3 rounded-lg font-medium ${
              currentQuestionIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleFinish}
              disabled={submitting}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center"
            >
              {submitting ? 'Submitting...' : 'Finish Quiz'}
              <CheckCircle className="ml-2 h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center"
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
      />
    </div>
  );
}
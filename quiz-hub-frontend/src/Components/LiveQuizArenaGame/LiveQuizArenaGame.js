import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Clock, Users, Brain, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthService from '../../Services/AuthService';
import LiveQuizGameService from '../../Services/LiveQuizService';
import SingleChoiceQuestion from '../../Shared/SingleChoiceQuestion';
import MultipleChoiceQuestion from '../../Shared/MutipleChoiceQuestion';
import TrueFalseQuestion from '../../Shared/TrueFalseQuestion';
import TextInputQuestion from '../../Shared/TextInputQuestion';

export default function LiveQuizGame() {
  const { quizId, questionNumber } = useParams();
  const navigate = useNavigate();
  const wsRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 second timer
  const [isDoNotKnow, setIsDoNotKnow] = useState(false);

  const navigateTo = (path) => {
    navigate(path);
  };

  // Initialize user and WebSocket
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigateTo('/login');
      return;
    }

    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      navigateTo('/login');
      return;
    }

    setUser(currentUser);
    initializeWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Initialize WebSocket connection
  const initializeWebSocket = () => {
    try {
      wsRef.current = new WebSocket('ws://localhost:5175/ws');
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected for game');
        if (user) {
          const message = {
            type: 'USER_CONNECTED',
            payload: {
              userId: user.id.toString(),
              username: user.username
            }
          };
          wsRef.current.send(JSON.stringify(message));
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error in game:', error);
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed in game');
        // Attempt to reconnect
        if (user) {
          setTimeout(initializeWebSocket, 5000);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (data) => {
    const messageType = data.Type || data.type;
    
    switch (messageType) {
    case 'LEADERBOARD_UPDATED':
      // Only update leaderboard, keep everything else the same
      const leaderboardPayload = data.Payload || data.payload;
      if (leaderboardPayload.participants) {
        setGameState(prevState => ({
          ...prevState,
          participants: leaderboardPayload.participants
        }));
      }
      break;
        
 case 'NEXT_QUESTION':
  console.log('NEXT_QUESTION received:', data);
  const nextPayload = data.Payload || data.payload;
  
  if (nextPayload?.gameState) {
    const newGameState = nextPayload.gameState;
    
    // Handle both casing possibilities
    const currentQuestionIndex = newGameState.CurrentQuestionIndex ?? newGameState.currentQuestionIndex;
    
    console.log('Current question index:', currentQuestionIndex);
    
    // Normalize participants from PascalCase to camelCase to match LEADERBOARD_UPDATED format
    let normalizedParticipants = [];
    const rawParticipants = newGameState.Participants || newGameState.participants;
    
    if (rawParticipants && rawParticipants.length > 0) {
      normalizedParticipants = rawParticipants.map(p => ({
        userId: p.UserId || p.userId,
        username: p.Username || p.username,
        profilePicture: p.ProfilePicture || p.profilePicture,
        score: p.Score ?? p.score ?? 0,
        joinedAt: p.JoinedAt || p.joinedAt
      }));
      console.log('Normalized participants:', normalizedParticipants);
    }
    
    setGameState(prevState => ({
      ...newGameState,
      // Normalize the property names for frontend use
      currentQuestionIndex: currentQuestionIndex,
      status: newGameState.Status ?? newGameState.status,
      // Use normalized participants that match LEADERBOARD_UPDATED format
      participants: normalizedParticipants.length > 0 ? normalizedParticipants : (prevState?.participants || []),
      currentQuestion: newGameState.CurrentQuestion ?? newGameState.currentQuestion,
      totalQuestions: newGameState.TotalQuestions ?? newGameState.totalQuestions,
      questionStartTime: newGameState.QuestionStartTime ?? newGameState.questionStartTime
    }));
    
    if (typeof currentQuestionIndex === 'number') {
      console.log(`Navigating to question ${currentQuestionIndex}`);
      navigate(`/live-quiz-game/${quizId}/${currentQuestionIndex}`, { replace: true });
      resetForNewQuestion();
    }
  }
  break;
        
case 'QUIZ_COMPLETED':
  const completedPayload = data.Payload || data.payload;
  if (completedPayload.gameState) {
    setGameState(completedPayload.gameState);
    toast.success('Quiz completed! Showing final results...');
    // Navigate to results page with results route
    setTimeout(() => {
      navigate(`/live-quiz-game/${quizId}/results`);
    }, 1000); // Reduced delay since we'll have a countdown on the results page
  }
  break;
    }
  };

  // Load initial game state
  useEffect(() => {
    if (user && quizId) {
      loadGameState();
    }
  }, [user, quizId]);

  // Timer effect
useEffect(() => {
  const questionTimer = gameState?.currentQuestion?.Timer || 
                       gameState?.currentQuestion?.timer || 
                       gameState?.currentQuestion?.timeToAnswer ||
                       30; // fallback to 30 if none found
  
  const questionStartTime = gameState?.QuestionStartTime || gameState?.questionStartTime;
  const gameStatus = gameState?.Status || gameState?.status;

  console.log('Timer effect triggered:', {
    questionStartTime,
    questionTimer,
    hasAnswered,
    status: gameStatus,
    currentQuestion: gameState?.currentQuestion
  });

  if (questionStartTime && questionTimer && !hasAnswered && (gameStatus === 'InProgress' || gameStatus === 1)) {
    const startTime = new Date(questionStartTime);
    
    const updateTimer = () => {
      const now = new Date();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, questionTimer - elapsed);
      
      console.log(`Timer update: ${remaining}s remaining (${elapsed}s elapsed of ${questionTimer}s)`);
      
      setTimeLeft(remaining);
      
      if (remaining === 0 && !hasAnswered) {
        console.log('Time up! Auto-submitting as Don\'t Know');
        handleSubmitAnswer(true);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }
}, [gameState?.QuestionStartTime, gameState?.questionStartTime, 
    gameState?.currentQuestion?.Timer, gameState?.currentQuestion?.timer, gameState?.currentQuestion?.timeToAnswer,
    gameState?.Status, gameState?.status, hasAnswered]);
const loadGameState = async () => {
  try {
    setLoading(true);
    const state = await LiveQuizGameService.getGameState(quizId);
    setGameState(state);
    setHasAnswered(state.userHasAnswered);
    // Remove: setTimeLeft(30);
    
    const currentQuestionIndex = parseInt(questionNumber);
    if (currentQuestionIndex !== state.currentQuestionIndex) {
      navigate(`/live-quiz-game/${quizId}/${state.currentQuestionIndex}`, { replace: true });
    }
  } catch (error) {
    console.error('Error loading game state:', error);
    toast.error('Failed to load game state');
    navigate('/');
  } finally {
    setLoading(false);
  }
};

  const resetForNewQuestion = () => {
    setCurrentAnswer(null);
    setHasAnswered(false);
    setIsDoNotKnow(false);
  };

const handleAnswerChange = useCallback((answer) => {
  console.log('handleAnswerChange called with:', answer, 'Type:', typeof answer);
  if (!hasAnswered) {
    setCurrentAnswer(answer);
    setIsDoNotKnow(false);
    console.log('Answer set to:', answer);
  } else {
    console.log('Answer not set - already answered');
  }
}, [hasAnswered]);

useEffect(() => {
  console.log('Current answer state:', currentAnswer, 'Has answered:', hasAnswered, 'Is do not know:', isDoNotKnow);
}, [currentAnswer, hasAnswered, isDoNotKnow]);

  const handleDoNotKnow = () => {
    if (!hasAnswered) {
      setIsDoNotKnow(true);
      setCurrentAnswer(null);
    }
  };

 const handleSubmitAnswer = async (autoSubmitAsDoNotKnow = false) => {
   if (hasAnswered) return;

  console.log('=== SUBMIT ANSWER DEBUG ===');
  console.log('autoSubmitAsDoNotKnow:', autoSubmitAsDoNotKnow);
  console.log('currentAnswer before processing:', currentAnswer);
  console.log('currentAnswer type:', typeof currentAnswer);
  console.log('isDoNotKnow before processing:', isDoNotKnow);

  try {
    const finalIsDoNotKnow = autoSubmitAsDoNotKnow || isDoNotKnow;
    let finalAnswer;
    
    if (finalIsDoNotKnow) {
      finalAnswer = [];
    } else if (currentAnswer !== null) {
      // Ensure currentAnswer is always wrapped in array for consistency
      finalAnswer = Array.isArray(currentAnswer) ? currentAnswer : [currentAnswer];
    } else {
      finalAnswer = [];
    }
    
    console.log('Final processing:');
    console.log('- finalIsDoNotKnow:', finalIsDoNotKnow);
    console.log('- finalAnswer:', finalAnswer);
    console.log('- finalAnswer types:', finalAnswer.map(a => typeof a));
    console.log('- finalAnswer values:', finalAnswer.map(a => JSON.stringify(a)));
    console.log('- Question type:', gameState?.currentQuestion?.type);
    
    // Convert boolean to string for backend compatibility
    if (gameState?.currentQuestion?.type?.toLowerCase().includes('truefalse')) {
      finalAnswer = finalAnswer.map(a => a.toString());
      console.log('- Converted to strings for True/False:', finalAnswer);
    }
    
    console.log('About to call submitAnswer with:', {
      quizId,
      finalAnswer,
      finalIsDoNotKnow
    });
    
    await LiveQuizGameService.submitAnswer(quizId, finalAnswer, finalIsDoNotKnow);
    setHasAnswered(true);
    
    if (finalIsDoNotKnow) {
      toast.info('Answer submitted: Don\'t Know');
    } else {
      toast.success('Answer submitted successfully!');
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
    toast.error(error.message);
  }
};

  const renderQuestion = useMemo(() => {
  if (!gameState?.currentQuestion) return null;

  const question = gameState.currentQuestion;
  
  // Handle both possible property names and add null check
  const questionType = question.Type || question.type;
  
  if (!questionType) {
    console.error('Question type is undefined:', question);
    return <div className="p-4 text-red-500">Error: Question type is missing</div>;
  }

  // Only log once when question changes, not on every render
  console.log('Rendering question type:', questionType);
  console.log('Question data:', question);
  
  const questionProps = {
    question: question.Text || question.text,
    onAnswer: handleAnswerChange
  };

  switch (questionType.toLowerCase()) {
    case 'singlechoice':
    case 'singlechoicequestion':
      return <SingleChoiceQuestion {...questionProps} options={question.Options || question.options} />;
    
    case 'multiplechoice':
    case 'multiplechoicequestion':
      return <MultipleChoiceQuestion {...questionProps} options={question.Options || question.options} />;
    
    case 'truefalse':
    case 'truefalsequestion':
      return <TrueFalseQuestion {...questionProps} />;
    
    case 'textinput':
    case 'textinputquestion':
      return <TextInputQuestion {...questionProps} placeholder="Type your answer here..." />;
    
    default:
      return <div className="p-4 text-red-500">Unknown question type: {questionType}</div>;
  }
}, [gameState?.currentQuestion, handleAnswerChange]);

  const renderLeaderboard = () => {
    if (!gameState?.participants) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-800">Leaderboard</h3>
        </div>
        
        <div className="space-y-3">
         {gameState.participants.map((participant, index) => (
            <div
                key={`participant-${participant.userId}-${index}`} // Add this key
                className={`flex items-center p-3 rounded-lg ${
                index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 mr-3 text-sm font-bold">
                {index + 1}
              </div>
              
              <img
                src={participant.profilePicture || '/api/placeholder/32/32'}
                alt={participant.username}
                className="w-8 h-8 rounded-full mr-3"
              />
              
              <div className="flex-1">
                <div className="font-medium text-gray-800">{participant.username}</div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg text-gray-800">{participant.score}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#BBBFCA' }}>
        <div className="text-center">
          <p className="text-gray-600 mb-4">Game not found or not available</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: '#BBBFCA',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Brain className="h-8 w-8 mr-3" style={{ color: '#495464' }} />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#495464' }}>
                Live Quiz Game
              </h1>
              <p className="text-sm opacity-70" style={{ color: '#495464' }}>
                Question {(gameState.currentQuestionIndex || 0) + 1} of {gameState.totalQuestions}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Timer */}
            <div className="flex items-center px-4 py-2 bg-white rounded-lg shadow">
              <Clock className="h-5 w-5 mr-2 text-red-500" />
              <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
                {timeLeft}s
              </span>
            </div>
            
            {/* Participants Count */}
            <div className="flex items-center px-4 py-2 bg-white rounded-lg shadow">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-bold text-gray-700">
                {gameState.participants?.length || 0}
              </span>
            </div>
            
            {/* Leave Quiz */}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to leave the quiz?')) {
                  navigate('/');
                }
              }}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Area */}
<div className="lg:col-span-3">
  <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
    {(() => {
      // Check if quiz is completed first
      if (gameState?.status === 'Completed' || gameState?.status === 2 || gameState?.Status === 'Completed' || gameState?.Status === 2) {
        // Immediately redirect to results without showing loading state
        setTimeout(() => {
          navigate(`/live-quiz-game/${quizId}/results`);
        }, 100); // Very short delay
        
        return (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
            <p className="text-gray-600">Redirecting to results...</p>
          </div>
        );
      }
      
      // Check if we have a current question
      if (gameState?.currentQuestion) {
        return (
          <>
            {renderQuestion}
            
            {/* Answer Options */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {/* Don't Know Button */}
              <button
                onClick={handleDoNotKnow}
                disabled={hasAnswered}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isDoNotKnow
                    ? 'bg-gray-500 text-white'
                    : hasAnswered
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Don't Know
              </button>
              
              {/* Submit Answer Button */}
              <button
                onClick={() => handleSubmitAnswer(false)}
                disabled={hasAnswered || (currentAnswer === null && !isDoNotKnow)}
                className={`flex-1 px-8 py-3 rounded-lg font-medium transition-colors ${
                  hasAnswered
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : (currentAnswer !== null || isDoNotKnow)
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {hasAnswered ? 'Answer Submitted!' : 'Confirm Answer'}
              </button>
            </div>
            
            {/* Status Messages */}
            {hasAnswered && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-green-700 font-medium">
                  Answer submitted! Waiting for other players...
                </p>
              </div>
            )}
          </>
        );
      }
      
      // Default loading state (only shown if not completed and no current question)
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading question...</p>
          <p className="text-xs text-gray-400 mt-2">
            Status: {gameState?.status || gameState?.Status}, Current Question: {gameState?.currentQuestion ? 'Found' : 'Missing'}
          </p>
        </div>
      );
    })()}
  </div>
</div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            {renderLeaderboard()}
          </div>
        </div>
      </div>
    </div>
  );
}
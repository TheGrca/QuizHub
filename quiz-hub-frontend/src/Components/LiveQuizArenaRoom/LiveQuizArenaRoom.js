import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, Crown, X, Play, Clock, Zap } from 'lucide-react';
import AuthService from '../../Services/AuthService';
import LiveQuizService from '../../Services/LiveQuizService';

const LiveQuizArenaRoom = () => {
  const { quizName } = useParams();
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const [user] = useState(AuthService.getCurrentUser());
  const [quizRoom, setQuizRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const quizId = quizName; 

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    initializeRoom();
    initializeWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const initializeRoom = async () => {
    try {
      setLoading(true);
      const roomData = await LiveQuizService.getQuizRoom(quizId);
      setQuizRoom(roomData);
      setParticipants(roomData.participants || []);
      setIsAdmin(roomData.adminId === user.id);
    } catch (error) {
      console.error('Failed to load quiz room:', error);
      toast.error('Failed to load quiz room');
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  const initializeWebSocket = () => {
    try {
          if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
      wsRef.current = new WebSocket(process.env.REACT_APP_WS_URL);

      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
        
        const message = {
          type: 'USER_CONNECTED',
          payload: {
            userId: user.id.toString(),
            username: user.username
          }
        };
        wsRef.current.send(JSON.stringify(message));

        if (!isAdmin) {
          handleJoinQuiz();
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          switch (data.Type) {
            case 'PARTICIPANTS_UPDATED':
         const updatePayload = data.Payload || data.payload;
          if (updatePayload?.quizId === quizId) {
            console.log('Updating participants to:', updatePayload.participants);
            
            // Update both states
            setParticipants(updatePayload.participants || []);
            setQuizRoom(prevRoom => ({
              ...prevRoom,
              participants: updatePayload.participants || []
            }));
          }
          break;
              
            case 'QUIZ_CANCELLED':
              if (data.Payload.quizId === quizId) {
                toast.error('Quiz has been cancelled by the admin');
                navigate('/home');
              }
              break;

              case 'QUIZ_STARTED':
            console.log('Quiz started message received:', data);
            const startPayload = data.Payload || data.payload;
            
            toast.success('Quiz is starting! Redirecting...');
            
            // Navigate to the game page
            setTimeout(() => {
              navigate(`/live-quiz-game/${quizId}/0`);
            }, 1000);
            break;
              
            default:
              console.log('Unknown message type:', data.Type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error');
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  const handleJoinQuiz = async () => {
   try {
    if (isAdmin) {
      console.log('Admin cannot join their own quiz');
      return;
    }

    await LiveQuizService.joinQuiz(quizId);
    
     const updatedRoom = await LiveQuizService.getQuizRoom(quizId);
    setParticipants(updatedRoom.participants || []);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'USER_JOINED_QUIZ',
        payload: {
          quizId: quizId,
          userId: user.id
        }
      };
      wsRef.current.send(JSON.stringify(message));
    }
  } catch (error) {
    console.error('Failed to join quiz:', error);
    if (!error.message.includes('Admin cannot join')) {
      toast.error('Failed to join quiz');
      navigate('/home');
    }
  }
  };

 const handleLeaveQuiz = async () => {
  try {
    await LiveQuizService.leaveQuiz(quizId);
     const updatedRoom = await LiveQuizService.getQuizRoom(quizId);
    setParticipants(updatedRoom.participants || []);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'USER_LEFT_QUIZ',
        payload: {
          quizId: quizId,
          userId: user.id
        }
      };
      wsRef.current.send(JSON.stringify(message));
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    navigate('/home');
  } catch (error) {
    console.error('Failed to leave quiz:', error);
    toast.error('Failed to leave quiz');
  }
};

  const handleCancelQuiz = async () => {
    try {
      await LiveQuizService.cancelQuiz(quizId);
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const message = {
          type: 'QUIZ_CANCELLED',
          payload: {
            quizId: quizId,
            adminId: user.id
          }
        };
        wsRef.current.send(JSON.stringify(message));
      }
      
      toast.success('Quiz cancelled successfully');
      navigate('/home');
    } catch (error) {
      console.error('Failed to cancel quiz:', error);
      toast.error('Failed to cancel quiz');
    }
  };

const handleStartQuiz = async () => {
  try {
    if (!quizRoom?.participants?.length) {
      toast.error('Cannot start quiz with no participants');
      return;
    }

    await LiveQuizService.startQuiz(quizId);
    setTimeout(() => {
      navigate('/');
    }, 1000);
    
  } catch (error) {
    console.error('Error starting quiz:', error);
    toast.error(error.message || 'Failed to start quiz');
  }
};

const renderParticipantSlot = (index) => {
    const participant = participants[index];
    const isEmpty = !participant;

    return (
      <div
        key={index}
        className={`relative rounded-xl p-6 border-2 transition-all duration-300 ${
          isEmpty 
            ? 'border-dashed border-gray-300 bg-gray-50' 
            : 'border-green-500 bg-white shadow-lg'
        }`}
        style={{ minHeight: '120px' }}
      >
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Users className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Waiting for player...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative mb-3">
              <img
                src={participant.profilePicture || '/api/placeholder/48/48'}
                alt={participant.username || 'Player'}
                className="w-12 h-12 rounded-full border-2 border-green-500"
                onError={(e) => {
                  console.log('Image failed to load:', e.target.src);
                  e.target.src = '/api/placeholder/48/48';
                }}
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <h3 className="font-semibold text-gray-800 text-center">{participant.username || 'Unknown Player'}</h3>
            <p className="text-xs text-gray-500 text-center mt-1">
              Joined {participant.joinedAt ? new Date(participant.joinedAt).toLocaleTimeString() : 'Recently'}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#BBBFCA' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#495464' }}></div>
          <p className="text-lg" style={{ color: '#495464' }}>Loading quiz room...</p>
        </div>
      </div>
    );
  }

  if (!quizRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#BBBFCA' }}>
        <div className="text-center">
          <X className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#495464' }}>Quiz Room Not Found</h2>
          <p className="text-lg mb-4" style={{ color: '#495464', opacity: 0.7 }}>
            The quiz room you're looking for doesn't exist or has been cancelled.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#495464' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="h-8 w-8 mr-3" style={{ color: '#495464' }} />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#495464' }}>
                  {quizRoom.name}
                </h1>
                <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
                  {quizRoom.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center px-4 py-2 rounded-lg" style={{ backgroundColor: '#E8E8E8' }}>
                <Clock className="h-4 w-4 mr-2" style={{ color: '#495464' }} />
                <span style={{ color: '#495464' }}>
                  {quizRoom.questions?.length || 0} Questions
                </span>
              </div>
              {isAdmin && (
                <Crown className="h-6 w-6" style={{ color: '#495464' }} />
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div 
          className="rounded-2xl shadow-lg p-8"
          style={{ backgroundColor: '#E8E8E8' }}
        >
          {/* Participants Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: '#495464' }}>
                Players ({participants.length}/4)
              </h2>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${participants.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm" style={{ color: '#495464' }}>
                  {participants.length > 0 ? 'Players Connected' : 'Waiting for Players'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }, (_, index) => renderParticipantSlot(index))}
            </div>
          </div>

          {/* Quiz Status */}
          <div className="border-t pt-6" style={{ borderColor: '#495464', borderOpacity: 0.2 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span style={{ color: '#495464' }}>Waiting for players</span>
                </div>
                {participants.length > 0 && (
                  <span className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                    Ready to start when you are!
                  </span>
                )}
              </div>

              {/* Admin Controls */}
              {isAdmin ? (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelQuiz}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-black-500 text-white hover:bg-red-600 transition-colors"
                    style={{ color: '#ffffffff', backgroundColor: '#495464'}}
                  >
                    <X className="h-4 w-4" />
                    Cancel Quiz
                  </button>
                  <button
                    onClick={handleStartQuiz}
                    disabled={participants.length === 0}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                      participants.length > 0
                        ? 'text-white hover:opacity-90'
                        : 'cursor-not-allowed opacity-50'
                    }`}
                    style={{ 
                      backgroundColor: participants.length > 0 ? '#495464' : '#BBBFCA'
                    }}
                  >
                    <Play className="h-4 w-4" />
                    Start Quiz
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLeaveQuiz}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border-2 hover:bg-red-50 transition-colors"
                  style={{ 
                    color: '#495464',
                    borderColor: '#495464',
                    borderOpacity: 0.3
                  }}
                >
                  <X className="h-4 w-4" />
                  Leave Quiz
                </button>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'white', opacity: 0.8 }}>
            <h3 className="font-semibold mb-2" style={{ color: '#495464' }}>
              {isAdmin ? 'Admin Instructions:' : 'Player Instructions:'}
            </h3>
            <ul className="text-sm space-y-1" style={{ color: '#495464', opacity: 0.8 }}>
              {isAdmin ? (
                <>
                  <li>• Wait for players to join the quiz room</li>
                  <li>• Click "Start Quiz" when ready to begin</li>
                  <li>• You can cancel the quiz at any time</li>
                </>
              ) : (
                <>
                  <li>• You have joined the quiz room - wait for the admin to start</li>
                  <li>• You can leave the quiz room at any time</li>
                  <li>• Get ready for an exciting live quiz experience!</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveQuizArenaRoom;
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, Zap, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthService from '../../Services/AuthService';
import UserService from '../../Services/UserService';

export default function LiveQuizRoom() {
  const [quizData, setQuizData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantProfiles, setParticipantProfiles] = useState({}); // Store fetched profiles
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const wsRef = useRef(null);
  const user = AuthService.getCurrentUser();

  const navigateTo = (path) => {
    window.location.href = path;
  };

  // Fetch profile picture for a specific user
  const fetchUserProfile = async (userId) => {
    try {
      if (participantProfiles[userId]) return; // Already fetched
      
      const profile = await UserService.getUserProfile();
      setParticipantProfiles(prev => ({
        ...prev,
        [userId]: profile.profilePictureBase64
      }));
    } catch (error) {
      console.error(`Failed to fetch profile for user ${userId}:`, error);
      // Don't show error to user, just use default avatar
    }
  };

  // Fetch profiles for all participants
  const fetchAllProfiles = async (newParticipants) => {
    const regularParticipants = newParticipants.filter(p => !p.IsAdmin);
    for (const participant of regularParticipants) {
      if (!participantProfiles[participant.UserId]) {
        await fetchUserProfile(participant.UserId);
      }
    }
  };

  // Initialize WebSocket connection
  const initializeWebSocket = () => {
    if (!user) return;

    try {
      wsRef.current = new WebSocket('ws://localhost:5175/ws');

      wsRef.current.onopen = () => {
        console.log('Quiz room WebSocket connection established');
        
        // Join the quiz room
        const message = {
          type: 'JOIN_QUIZ_ROOM',
          payload: {
            userId: user.id.toString(),
            username: user.username,
            profilePicture: user.profilePictureBase64 || null,
            isAdmin: user.role === 1
          }
        };
        wsRef.current.send(JSON.stringify(message));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Quiz room message received:', data);
          
          switch (data.Type) {
            case 'QUIZ_ROOM_STATE':
              // Update room state with current participants and quiz data
              setQuizData(data.Payload.QuizData);
              const newParticipants = data.Payload.Participants || [];
              setParticipants(newParticipants);
              fetchAllProfiles(newParticipants);
              setLoading(false);
              break;
              
            case 'USER_JOINED_ROOM':
              // Add new participant
              setParticipants(prev => {
                const updated = [...prev, data.Payload];
                fetchAllProfiles(updated);
                return updated;
              });
              toast.success(`${data.Payload.Username} joined the room`);
              break;
              
            case 'USER_LEFT_ROOM':
              // Remove participant
              setParticipants(prev => prev.filter(p => p.UserId !== data.Payload.UserId));
              toast.info(`${data.Payload.Username} left the room`);
              break;
              
            case 'QUIZ_STOPPED':
              // Quiz was stopped by admin
              toast.error('Quiz was canceled by the admin');
              navigateTo('/home');
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
        console.log('Quiz room WebSocket connection closed');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  // Handle admin stopping the quiz
  const handleStopQuiz = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'STOP_QUIZ',
        payload: {
          adminId: user.id.toString()
        }
      };
      wsRef.current.send(JSON.stringify(message));
    }
  };

  // Handle starting the quiz (placeholder for now)
  const handleStartQuiz = () => {
    toast.info('Start quiz functionality will be implemented next');
  };

  // Handle leaving the room
  const handleLeaveRoom = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'LEAVE_QUIZ_ROOM',
        payload: {
          userId: user.id.toString()
        }
      };
      wsRef.current.send(JSON.stringify(message));
    }
    
    // Navigate back
    if (user.role === 1) {
      navigateTo('/live-quiz-arena');
    } else {
      navigateTo('/home');
    }
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigateTo('/login');
      return;
    }

    setIsAdmin(user.role === 1);
    initializeWebSocket();
  }, []);

  // Render participant slot
  const renderParticipantSlot = (participant, index) => {
    if (!participant) {
      return (
        <div 
          key={index}
          className="flex flex-col items-center p-6 rounded-lg border-2 border-dashed"
          style={{ 
            backgroundColor: '#F4F4F2',
            borderColor: '#BBBFCA'
          }}
        >
          <div className="w-16 h-16 rounded-full mb-3 flex items-center justify-center" style={{ backgroundColor: '#E8E8E8' }}>
            <Users className="h-8 w-8" style={{ color: '#495464', opacity: 0.5 }} />
          </div>
          <p className="text-sm" style={{ color: '#495464', opacity: 0.6 }}>
            Waiting for player...
          </p>
        </div>
      );
    }

    return (
      <div 
        key={participant.UserId}
        className="flex flex-col items-center p-6 rounded-lg border"
        style={{ 
          backgroundColor: '#F4F4F2',
          borderColor: '#495464'
        }}
      >
        <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2" style={{ borderColor: '#495464' }}>
          <img 
            src={participantProfiles[participant.UserId] ? 
              `data:image/jpeg;base64,${participantProfiles[participant.UserId]}` : 
              `https://ui-avatars.com/api/?name=${participant.Username}&background=random&color=fff&size=64`
            }
            alt={participant.Username}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${participant.Username}&background=random&color=fff&size=64`;
            }}
          />
        </div>
        <p className="font-medium text-center" style={{ color: '#495464' }}>
          {participant.Username}
          {participant.IsAdmin && (
            <span className="block text-xs" style={{ color: '#495464', opacity: 0.7 }}>
              (Admin)
            </span>
          )}
        </p>
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

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: '#BBBFCA',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleLeaveRoom}
            className="flex items-center mb-4 font-medium transition-all duration-200 hover:opacity-70"
            style={{ color: '#495464' }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Leave Room
          </button>
          
          <div className="flex items-center mb-4">
            <Zap className="h-8 w-8 mr-3" style={{ color: '#495464' }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#495464' }}>
                {quizData?.Name || 'Live Quiz Room'}
              </h1>
              <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
                {quizData?.Description || 'Waiting for quiz data...'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-8">
          <div 
            className="w-full rounded-2xl shadow-lg p-8"
            style={{ backgroundColor: '#E8E8E8' }}
          >
            {/* Participants Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#495464' }}>
                Players ({participants.filter(p => !p.IsAdmin).length}/4)
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[0, 1, 2, 3].map(index => {
                  const regularParticipants = participants.filter(p => !p.IsAdmin);
                  return renderParticipantSlot(regularParticipants[index], index);
                })}
              </div>
            </div>

            {/* Quiz Info */}
            {quizData && (
              <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#F4F4F2' }}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#495464' }}>
                  Quiz Information
                </h3>
                <p className="text-sm" style={{ color: '#495464', opacity: 0.8 }}>
                  Questions: {quizData.Questions?.length || 0}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              {isAdmin && (
                <>
                  <button
                    onClick={handleStopQuiz}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: '#ef4444',
                      color: 'white'
                    }}
                  >
                    <X className="h-4 w-4" />
                    Stop Quiz
                  </button>
                  
                  <button
                    onClick={handleStartQuiz}
                    disabled={participants.length === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      participants.length > 0 
                        ? 'hover:opacity-90' 
                        : 'cursor-not-allowed opacity-50'
                    }`}
                    style={{ 
                      backgroundColor: participants.length > 0 ? '#22c55e' : '#BBBFCA',
                      color: 'white'
                    }}
                  >
                    <Zap className="h-4 w-4" />
                    Start Quiz
                  </button>
                </>
              )}
              
              {!isAdmin && (
                <div className="text-center">
                  <p className="text-lg" style={{ color: '#495464' }}>
                    Waiting for the admin to start the quiz...
                  </p>
                  <p className="text-sm mt-2" style={{ color: '#495464', opacity: 0.7 }}>
                    Make sure you're ready!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
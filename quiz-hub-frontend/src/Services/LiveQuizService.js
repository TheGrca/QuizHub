// Services/LiveQuizService.js
import AuthService from './AuthService';

class LiveQuizService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL;
  }

  // Create a new live quiz
 async createLiveQuiz(quizData) {
    try {
      const headers = AuthService.getAuthHeaders();
      
      // Debug logging
      console.log('Request headers:', headers);
      console.log('Quiz data:', quizData);
      console.log('Current user:', AuthService.getCurrentUser());
      console.log('Token:', AuthService.getToken());

      const response = await fetch(`${this.baseURL}/livequiz/create`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(quizData),
      });

      // Check if response has content before trying to parse JSON
      const responseText = await response.text();
      
      // Log the response for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response text:', responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        console.error('Response text was:', responseText);
        throw new Error(`Invalid response format: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating live quiz:', error);
      throw error;
    }
  }

  // Join a live quiz
  async joinQuiz(quizId) {
    try {
      const response = await fetch(`${this.baseURL}/livequiz/join`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({ quizId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join quiz');
      }

      return data;
    } catch (error) {
      console.error('Error joining quiz:', error);
      throw error;
    }
  }

  // Leave a live quiz
  async leaveQuiz(quizId) {
    try {
      const response = await fetch(`${this.baseURL}/livequiz/leave`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({ quizId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to leave quiz');
      }

      return data;
    } catch (error) {
      console.error('Error leaving quiz:', error);
      throw error;
    }
  }

  // Cancel a live quiz (admin only)
  async cancelQuiz(quizId) {
    try {
      const response = await fetch(`${this.baseURL}/livequiz/cancel`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({ quizId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel quiz');
      }

      return data;
    } catch (error) {
      console.error('Error cancelling quiz:', error);
      throw error;
    }
  }

  // Get live quiz room data
  async getQuizRoom(quizId) {
    try {
      const response = await fetch(`${this.baseURL}/livequiz/room/${quizId}`, {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get quiz room');
      }

      return data;
    } catch (error) {
      console.error('Error getting quiz room:', error);
      throw error;
    }
  }

  // Get participants of a live quiz
  async getParticipants(quizId) {
    try {
      const response = await fetch(`${this.baseURL}/livequiz/participants/${quizId}`, {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get participants');
      }

      return data;
    } catch (error) {
      console.error('Error getting participants:', error);
      throw error;
    }
  }

  async getCurrentActiveLiveQuiz() {
  try {
    const response = await fetch(`${this.baseURL}/livequiz/current`, {
      method: 'GET',
      headers: AuthService.getAuthHeaders(),
    });

    // Check if response has content
    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle empty response (no active quiz)
    if (!responseText || responseText.trim() === '') {
      return null;
    }

    // Try to parse JSON
    try {
      const data = JSON.parse(responseText);
      return data;
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      console.error('Response text was:', responseText);
      return null; // Return null instead of throwing error
    }

  } catch (error) {
    console.error('Error getting current live quiz:', error);
    return null; // Return null instead of throwing error for this case
  }
  }
   async startQuiz(quizId) {
    try {
      const response = await fetch(`${this.baseURL}/livequiz/start`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({ quizId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start quiz');
      }

      return data;
    } catch (error) {
      console.error('Error starting quiz:', error);
      throw error;
    }
  }
   async submitAnswer(quizId, answer, isDoNotKnow = false) {
    try {
      const response = await fetch(`${this.baseURL}/livequiz/submit-answer`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({
          quizId,
          answer: Array.isArray(answer) ? answer : [answer],
          isDoNotKnow
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit answer');
      }

      return data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }
   async nextQuestion(quizId) {
    try {
      const response = await fetch(`${this.baseURL}/livequiz/next-question`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({ quizId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to move to next question');
      }

      return data;
    } catch (error) {
      console.error('Error moving to next question:', error);
      throw error;
    }
  }
  async getGameState(quizId) {
    try {
      const response = await fetch(`${this.baseURL}/livequiz/game-state/${quizId}`, {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get game state');
      }

      return data;
    } catch (error) {
      console.error('Error getting game state:', error);
      throw error;
    }
  }
}

export default new LiveQuizService();
import AuthService from './AuthService';

class UserService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL;
  }

  getAuthHeaders() {
    return AuthService.getAuthHeaders();
  }

  async fetchQuizzes(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);

      const response = await fetch(`${this.baseURL}/user/quizzes?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }

      const quizzes = await response.json();
      return quizzes;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw new Error('Failed to fetch quizzes');
    }
  }

  async fetchCategories() {
    try {
      const response = await fetch(`${this.baseURL}/user/categories`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const categories = await response.json();
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  async getQuizById(quizId) {
    try {
      const response = await fetch(`${this.baseURL}/user/quiz/${quizId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }

      const quiz = await response.json();
      return quiz;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw new Error('Failed to fetch quiz');
    }
  }

  async submitQuiz(submissionData) {
    try {
      const response = await fetch(`${this.baseURL}/user/submit-quiz`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to submit quiz');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw new Error('Failed to submit quiz');
    }
  }

  async getUserQuizHistory() {
    try {
      const response = await fetch(`${this.baseURL}/user/quiz-history`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz history');
      }

      const history = await response.json();
      return history;
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      throw new Error('Failed to fetch quiz history');
    }
  }

  async getUserProfile() {
    try {
      const response = await fetch(`${this.baseURL}/user/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile = await response.json();
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  async getQuizRankings(quizId) {
    try {
      const user = AuthService.getCurrentUser();
      
      if (!user || !user.id) {
        throw new Error('User not found. Please login again.');
      }

      console.log('Fetching rankings for quiz:', quizId);
      console.log('User ID:', user.id);

      const response = await fetch(`${this.baseURL}/user/quiz-rankings/${quizId}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'X-User-Id': user.id.toString()
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to load quiz rankings: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Rankings data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching quiz rankings:', error);
      throw error; 
    }
  }
  async getMyQuizResults() {
    try {
      const user = AuthService.getCurrentUser();
      
      if (!user || !user.id) {
        throw new Error('User not found. Please login again.');
      }

      console.log('Fetching quiz results for user:', user.id);

      const response = await fetch(`${this.baseURL}/user/my-quiz-results`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'X-User-Id': user.id.toString()
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to load quiz results: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Quiz results data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      throw error;
    }
  }
  async getQuizResultDetail(resultId) {
    try {
      const user = AuthService.getCurrentUser();
      
      if (!user || !user.id) {
        throw new Error('User not found. Please login again.');
      }

      console.log('Fetching quiz result details for resultId:', resultId);
      console.log('User ID:', user.id);

      const response = await fetch(`${this.baseURL}/user/quiz-result/${resultId}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'X-User-Id': user.id.toString()
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to load quiz result: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Quiz result data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching quiz result:', error);
      throw error;
    }
  }

}



export default new UserService();
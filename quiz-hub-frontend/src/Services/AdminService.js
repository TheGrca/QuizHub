// src/services/AdminService.js - Updated to match your actual backend endpoints
import AuthService from './AuthService';

class AdminService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL;
  }

  // Get authenticated headers
  getAuthHeaders() {
    return AuthService.getAuthHeaders();
  }
  async getAllQuizzes() {
    try {
      const response = await fetch(`${this.baseURL}/admin/quizzes`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to fetch quizzes');
      }

      const quizzes = await response.json();
      console.log('Raw quizzes from API:', quizzes);
      return quizzes;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw new Error('Failed to fetch quizzes');
    }
  }

  async getQuizForEdit(quizId) {
    try {
      const response = await fetch(`${this.baseURL}/admin/quiz/${quizId}/edit`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to fetch quiz details');
      }

      const quiz = await response.json();
      return quiz;
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      throw new Error('Failed to fetch quiz details');
    }
  }

  async updateQuizWithEdit(quizId, editQuizData) {
    try {
      const response = await fetch(`${this.baseURL}/admin/quiz/${quizId}/edit`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(editQuizData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to update quiz');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw new Error('Failed to update quiz');
    }
  }

  async deleteQuizCompletely(quizId) {
    try {
      const response = await fetch(`${this.baseURL}/admin/quiz/${quizId}/delete`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to delete quiz');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw new Error('Failed to delete quiz');
    }
  }

  async getCategories() {
    try {
      const response = await fetch(`${this.baseURL}/admin/categories`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to fetch categories');
      }

      const categories = await response.json();
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  async updateQuiz(quizId, quizData) {
    try {
      const response = await fetch(`${this.baseURL}/admin/quiz/${quizId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        throw new Error('Failed to update quiz');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw new Error('Failed to update quiz');
    }
  }

  async getAllUsers() {
    try {
      const response = await fetch(`${this.baseURL}/admin/users`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to fetch users');
      }

      const users = await response.json();
      console.log('Users fetched:', users);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async getUserResults(userId) {
    try {
      const response = await fetch(`${this.baseURL}/admin/user/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to fetch user results');
      }

      const userResults = await response.json();
      console.log('User results fetched:', userResults);
      return userResults;
    } catch (error) {
      console.error('Error fetching user results:', error);
      throw new Error('Failed to fetch user results');
    }
  }

}

export default new AdminService();
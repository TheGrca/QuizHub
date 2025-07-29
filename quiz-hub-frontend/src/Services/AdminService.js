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

  // Get all quizzes for admin (uses your existing GetAllQuizzes endpoint)
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

  // Get quiz for editing with full details including correct answers
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

  // Update quiz with full edit capabilities
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

  // Delete quiz completely (removes from all users)
  async deleteQuizCompletely(quizId) {
    try {
      const response = await fetch(`${this.baseURL}/admin/quiz/${quizId}/complete`, {
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

  // Add question to quiz
  async addQuestionToQuiz(quizId, questionData) {
    try {
      const response = await fetch(`${this.baseURL}/admin/quiz/${quizId}/question`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to add question');
      }

      const question = await response.json();
      return question;
    } catch (error) {
      console.error('Error adding question:', error);
      throw new Error('Failed to add question');
    }
  }

  // Update single question
  async updateQuestion(questionId, questionData) {
    try {
      const response = await fetch(`${this.baseURL}/admin/question/${questionId}/edit`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to update question');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating question:', error);
      throw new Error('Failed to update question');
    }
  }

  // Delete single question
  async deleteQuestion(questionId) {
    try {
      const response = await fetch(`${this.baseURL}/admin/question/${questionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to delete question');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw new Error('Failed to delete question');
    }
  }

  // Get categories (uses your existing GetCategories endpoint)
  async getCategories() {
    try {
      const response = await fetch(`${this.baseURL}/admin/GetCategories`, {
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

  // Update quiz
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

  // Delete quiz
  async deleteQuiz(quizId) {
    try {
      const response = await fetch(`${this.baseURL}/admin/quiz/${quizId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw new Error('Failed to delete quiz');
    }
  }

  // Create question
  async createQuestion(quizId, questionData) {
    try {
      const response = await fetch(`${this.baseURL}/admin/quiz/${quizId}/questions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        throw new Error('Failed to create question');
      }

      const question = await response.json();
      return question;
    } catch (error) {
      console.error('Error creating question:', error);
      throw new Error('Failed to create question');
    }
  }

  // Update question
  async updateQuestion(questionId, questionData) {
    try {
      const response = await fetch(`${this.baseURL}/admin/quiz/questions/${questionId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        throw new Error('Failed to update question');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating question:', error);
      throw new Error('Failed to update question');
    }
  }

  // Delete question
  async deleteQuestion(questionId) {
    try {
      const response = await fetch(`${this.baseURL}/admin/quiz/questions/${questionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw new Error('Failed to delete question');
    }
  }

  // Get categories
  async getCategories() {
    try {
      const response = await fetch(`${this.baseURL}/admin/quiz/categories`, {
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
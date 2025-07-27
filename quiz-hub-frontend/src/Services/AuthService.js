// src/services/AuthService.js
import { User } from '../Models/User';

class AuthService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL;
  }

  async login(emailOrUsername, password) {
    const loginData = {
      emailOrUsername,
      password
    };

    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    const user = new User(data.user);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(user));

    return {
      token: data.token,
      user
    };
  }

  async register(username, email, password, profilePicture) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('profilePicture', profilePicture);

    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    const user = new User(data.user);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(user));

    return {
      token: data.token,
      user
    };
  }

  async checkUsernameUniqueness(username) {
    try {
      const response = await fetch(
        `${this.baseURL}/auth/check-username/${username}`
      );
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check username');
      }
      
      return data.isUnique;
    } catch (error) {
      console.error('Error checking username:', error);
      throw new Error('Failed to check username availability');
    }
  }

  async checkEmailUniqueness(email) {
    try {
      const response = await fetch(
        `${this.baseURL}/auth/check-email/${email}`
      );
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check email');
      }
      
      return data.isUnique;
    } catch (error) {
      console.error('Error checking email:', error);
      throw new Error('Failed to check email availability');
    }
  }


  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? new User(JSON.parse(userData)) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user ? user.isAdmin() : false;
  }

  getAuthHeaders() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (user) {
      headers['X-User-Id'] = user.id.toString();
    }

    return headers;
  }
}

export default new AuthService();
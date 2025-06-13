import axios from 'axios';

class AuthService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'https://api.ptoconnect.com';
    this.tokenKey = 'pto_expenses_token';
    this.userKey = 'pto_expenses_user';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async login(credentials) {
    try {
      const response = await this.api.post('/api/auth/login', credentials);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store token and user data
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
        
        return {
          success: true,
          user: user,
          token: token
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      } else if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Too many login attempts. Please try again later.'
        };
      } else if (!navigator.onLine) {
        return {
          success: false,
          error: 'No internet connection. Please check your connection and try again.'
        };
      } else {
        return {
          success: false,
          error: error.response?.data?.message || 'Login failed. Please try again.'
        };
      }
    }
  }

  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        // Call logout endpoint to invalidate token on server
        await this.api.post('/api/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      
      // Clear any cached data
      this.clearCache();
    }
  }

  async checkAuthStatus() {
    try {
      const token = this.getToken();
      const user = this.getUser();
      
      if (!token || !user) {
        return { isAuthenticated: false };
      }

      // Verify token with server
      const response = await this.api.get('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        return {
          isAuthenticated: true,
          user: response.data.user || user
        };
      } else {
        // Token is invalid, clear local storage
        await this.logout();
        return { isAuthenticated: false };
      }
    } catch (error) {
      console.error('Auth check error:', error);
      
      if (error.response?.status === 401) {
        // Token expired or invalid
        await this.logout();
        return { isAuthenticated: false };
      }
      
      // If offline, trust local storage
      if (!navigator.onLine) {
        const token = this.getToken();
        const user = this.getUser();
        
        if (token && user) {
          return {
            isAuthenticated: true,
            user: user,
            offline: true
          };
        }
      }
      
      return { isAuthenticated: false };
    }
  }

  async refreshToken() {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('No token available');
      }

      const response = await this.api.post('/api/auth/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const { token: newToken, user } = response.data;
        
        // Update stored token and user
        localStorage.setItem(this.tokenKey, newToken);
        localStorage.setItem(this.userKey, JSON.stringify(user));
        
        return {
          success: true,
          token: newToken,
          user: user
        };
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // If refresh fails, logout user
      await this.logout();
      
      return {
        success: false,
        error: 'Session expired. Please login again.'
      };
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post('/api/auth/register', userData);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Registration successful'
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.status === 409) {
        return {
          success: false,
          error: 'An account with this email already exists'
        };
      } else {
        return {
          success: false,
          error: error.response?.data?.message || 'Registration failed. Please try again.'
        };
      }
    }
  }

  async forgotPassword(email) {
    try {
      const response = await this.api.post('/api/auth/forgot-password', { email });
      
      return {
        success: true,
        message: response.data.message || 'Password reset email sent'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send password reset email'
      };
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await this.api.post('/api/auth/reset-password', {
        token,
        password: newPassword
      });
      
      return {
        success: true,
        message: response.data.message || 'Password reset successful'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed'
      };
    }
  }

  // Token management
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  // User management
  getUser() {
    try {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Utility methods
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  getUserRole() {
    const user = this.getUser();
    return user?.role || 'member';
  }

  getOrganizationId() {
    const user = this.getUser();
    return user?.organization_id;
  }

  hasPermission(permission) {
    const user = this.getUser();
    return user?.permissions?.includes(permission) || false;
  }

  // Cache management
  clearCache() {
    try {
      // Clear any cached data related to the user
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('pto_expenses_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Token validation
  isTokenExpired(token = null) {
    try {
      const tokenToCheck = token || this.getToken();
      
      if (!tokenToCheck) {
        return true;
      }

      // Decode JWT token (basic check)
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return true;
    }
  }

  // Auto-refresh token if needed
  async ensureValidToken() {
    try {
      const token = this.getToken();
      
      if (!token) {
        return false;
      }

      // Check if token is close to expiring (within 5 minutes)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      
      if (timeUntilExpiry < 300) { // 5 minutes
        const refreshResult = await this.refreshToken();
        return refreshResult.success;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Development helpers
  async loginAsDemo() {
    // For development/demo purposes
    if (process.env.NODE_ENV === 'development') {
      return await this.login({
        email: 'demo@ptoconnect.com',
        password: 'demo123'
      });
    }
    
    return {
      success: false,
      error: 'Demo login only available in development'
    };
  }
}

export const authService = new AuthService();

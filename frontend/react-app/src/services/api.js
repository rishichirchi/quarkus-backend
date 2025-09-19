import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // This will proxy to the session server
  withCredentials: true, // Include cookies for session management
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle different error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - could redirect to login
      console.log('Unauthorized request');
    }
    
    // Return a standardized error format
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'An unexpected error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Auth API endpoints
export const authAPI = {
  // Get current session status
  getSession: () => api.get('/session'),
  
  // Debug session
  debugSession: () => api.get('/debug-session'),
  
  // Refresh user data from backend
  refreshUser: () => api.post('/refresh-user'),
  
  // Login user
  login: (email, password) => api.post('/login', { email, password }),
  
  // Register new user
  signup: (email, password) => api.post('/signup', { email, password }),
  
  // Logout user
  logout: () => api.post('/logout'),
  
  // Verify email with token
  verifyEmail: (token) => api.get(`/verify-email?token=${token}`),
  
  // Resend verification email
  resendVerification: (email) => api.post('/resend-verification', { email }),
  
  // Get dashboard data (protected route)
  getDashboard: () => api.get('/dashboard')
};

// Health check endpoint
export const healthAPI = {
  checkHealth: () => api.get('/health')
};

export default api;

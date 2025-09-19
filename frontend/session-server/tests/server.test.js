const request = require('supertest');
const axios = require('axios');

// Mock axios for backend API calls
jest.mock('axios');
const mockedAxios = axios;

const app = require('../server');

describe('Session Server API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    test('GET /health should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'healthy',
        service: 'session-server'
      });
    });
  });

  describe('Session Management', () => {
    test('GET /api/session should return unauthenticated for new session', async () => {
      const response = await request(app).get('/api/session');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        authenticated: false,
        user: null
      });
    });
  });

  describe('Authentication', () => {
    test('POST /api/signup should create new user', async () => {
      const mockBackendResponse = {
        data: {
          id: 1,
          email: 'test@example.com',
          message: 'Please check your email to validate your account',
          success: true
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockBackendResponse);

      const response = await request(app)
        .post('/api/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBackendResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/users/signup',
        {
          email: 'test@example.com',
          password: 'Password123'
        }
      );
    });

    test('POST /api/login should authenticate user and create session', async () => {
      const mockBackendResponse = {
        data: {
          id: 1,
          email: 'test@example.com',
          emailValidated: false,
          message: 'Login successful',
          loginSuccess: true
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockBackendResponse);

      const agent = request.agent(app);
      
      const response = await agent
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        id: 1,
        email: 'test@example.com',
        emailValidated: false
      });

      // Verify session was created
      const sessionResponse = await agent.get('/api/session');
      expect(sessionResponse.body.authenticated).toBe(true);
    });

    test('POST /api/login should reject invalid credentials', async () => {
      const mockError = {
        response: {
          status: 401,
          data: 'Invalid credentials'
        }
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('POST /api/logout should destroy session', async () => {
      const mockBackendResponse = {
        data: {
          id: 1,
          email: 'test@example.com',
          emailValidated: false,
          loginSuccess: true
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockBackendResponse);

      const agent = request.agent(app);
      
      // Login first
      await agent
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      // Logout
      const logoutResponse = await agent.post('/api/logout');
      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);

      // Verify session was destroyed
      const sessionResponse = await agent.get('/api/session');
      expect(sessionResponse.body.authenticated).toBe(false);
    });
  });

  describe('Protected Routes', () => {
    test('GET /api/dashboard should require authentication', async () => {
      const response = await request(app).get('/api/dashboard');
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    test('GET /api/dashboard should return data for authenticated user', async () => {
      const mockBackendResponse = {
        data: {
          id: 1,
          email: 'test@example.com',
          emailValidated: true,
          loginSuccess: true
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockBackendResponse);

      const agent = request.agent(app);
      
      // Login first
      await agent
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      // Access dashboard
      const dashboardResponse = await agent.get('/api/dashboard');
      expect(dashboardResponse.status).toBe(200);
      expect(dashboardResponse.body.message).toBe(
        'Your email is validated. You can access the portal'
      );
    });
  });

  describe('Email Verification', () => {
    test('GET /api/verify-email should verify email with valid token', async () => {
      const mockBackendResponse = {
        data: 'Email verified successfully'
      };

      mockedAxios.get.mockResolvedValueOnce(mockBackendResponse);

      const response = await request(app)
        .get('/api/verify-email?token=valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/users/verify?token=valid-token'
      );
    });

    test('POST /api/resend-verification should resend verification email', async () => {
      const mockBackendResponse = {
        data: 'Verification email sent successfully'
      };

      mockedAxios.post.mockResolvedValueOnce(mockBackendResponse);

      const response = await request(app)
        .post('/api/resend-verification')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/users/resend-verification?email=test@example.com'
      );
    });
  });

  describe('Input Validation', () => {
    test('POST /api/signup should validate required fields', async () => {
      const response = await request(app)
        .post('/api/signup')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });

    test('POST /api/login should validate required fields', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });

    test('GET /api/verify-email should validate token parameter', async () => {
      const response = await request(app).get('/api/verify-email');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Verification token is required');
    });
  });
});

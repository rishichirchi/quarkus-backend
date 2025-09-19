const express = require('express');
const session = require('express-session');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for production deployment behind nginx/load balancer
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple session configuration - using memory store for simplicity
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: false, // Set to false for development, should be true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Backend service configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  console.log('RequireAuth check - Session exists:', !!req.session);
  console.log('RequireAuth check - User exists:', !!(req.session && req.session.user));
  console.log('RequireAuth check - User data:', req.session ? req.session.user : 'no session');
  
  if (!req.session || !req.session.user) {
    console.log('RequireAuth failed - no user in session');
    return res.status(401).json({ error: 'Authentication required' });
  }
  console.log('RequireAuth passed');
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'session-server' });
});

// Get current session info - for checking if user is already logged in
app.get('/api/session', (req, res) => {
  console.log('Checking session - Session exists:', !!req.session);
  console.log('Checking session - User data:', req.session ? req.session.user : 'no session');
  
  if (req.session && req.session.user) {
    console.log('User found in session:', req.session.user);
    res.json({
      authenticated: true,
      user: req.session.user,
      redirectTo: '/dashboard' // Tell frontend user is logged in, go to dashboard
    });
  } else {
    console.log('No user in session, user needs to login');
    res.json({
      authenticated: false,
      user: null,
      redirectTo: '/login' // Tell frontend user needs to login
    });
  }
});

// Debug endpoint to check session
app.get('/api/debug-session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    hasUser: !!(req.session && req.session.user),
    userID: req.session && req.session.user ? req.session.user.id : null,
    userEmail: req.session && req.session.user ? req.session.user.email : null
  });
});

// Refresh user data from backend
app.post('/api/refresh-user', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    console.log('Refreshing user data for userId:', userId);
    
    // Get fresh user data from backend
    const response = await axios.get(`${BACKEND_URL}/users/validate/${userId}`);
    console.log('Backend response:', response.data);
    
    if (response.data && response.data.loginSuccess) {
      // Update session with fresh data
      req.session.user = {
        id: response.data.id,
        email: response.data.email,
        emailValidated: response.data.emailValidated
      };
      
      console.log('Updated session user:', req.session.user);
      
      res.json({
        success: true,
        user: req.session.user,
        message: 'User data refreshed successfully'
      });
    } else {
      console.log('Invalid response from backend:', response.data);
      res.status(400).json({ error: 'Failed to refresh user data' });
    }
  } catch (error) {
    console.error('Refresh user error:', error.response?.data || error.message);
    console.error('Full error:', error);
    
    if (error.response && error.response.status === 404) {
      res.status(404).json({ 
        error: 'User no longer exists in database', 
        shouldLogout: true 
      });
    } else {
      res.status(500).json({ error: 'Internal server error during refresh' });
    }
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('Signup attempt for email:', email);

    // Call backend signup endpoint
    const response = await axios.post(`${BACKEND_URL}/users/signup`, {
      email,
      password
    });

    console.log('Signup backend response:', response.data);

    if (response.data.success) {
      // Create session immediately after successful signup
      req.session.user = {
        id: response.data.id,
        email: response.data.email,
        emailValidated: response.data.emailValidated || false
      };

      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: 'Session save failed' });
        }

        console.log('Created and saved session for new user:', req.session.user);

        res.json({
          success: true,
          user: req.session.user,
          message: response.data.message || 'Account created successfully',
          redirectTo: '/dashboard' // Tell frontend to redirect to dashboard
        });
      });
    } else {
      res.status(400).json({ error: response.data.message || 'Signup failed' });
    }
  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json(
        error.response.data || { error: 'Signup failed' }
      );
    } else {
      res.status(500).json({ error: 'Internal server error during signup' });
    }
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('Login attempt for email:', email);

    // Call backend login endpoint
    const response = await axios.post(`${BACKEND_URL}/users/login`, {
      email,
      password
    });

    console.log('Login backend response:', response.data);

    if (response.data.loginSuccess) {
      // Store user info in session
      req.session.user = {
        id: response.data.id,
        email: response.data.email,
        emailValidated: response.data.emailValidated
      };

      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: 'Session save failed' });
        }

        console.log('Created and saved session for logged in user:', req.session.user);

        res.json({
          success: true,
          user: req.session.user,
          message: response.data.message,
          redirectTo: '/dashboard' // Tell frontend to redirect to dashboard
        });
      });
    } else {
      res.status(401).json({ error: 'Login failed' });
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    
    if (error.response && error.response.status === 401) {
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      res.status(500).json({ error: 'Internal server error during login' });
    }
  }
});

// Logout endpoint
app.post('/api/logout', requireAuth, (req, res) => {
  const userEmail = req.session.user.email;
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    
    console.log('User logged out:', userEmail);
    res.clearCookie('sessionId'); // Clear the session cookie
    res.json({ 
      success: true, 
      message: 'Logged out successfully',
      redirectTo: '/login' // Tell frontend to redirect to login
    });
  });
});

// Email verification endpoint
app.get('/api/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Call backend verify endpoint
    const response = await axios.get(`${BACKEND_URL}/users/verify?token=${token}`);

    // If user is logged in, update their session
    if (req.session && req.session.user) {
      req.session.user.emailValidated = true;
    }

    res.json({
      success: true,
      message: response.data || 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data || 'Email verification failed'
      });
    } else {
      res.status(500).json({ error: 'Internal server error during email verification' });
    }
  }
});

// Resend verification email endpoint
app.post('/api/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Resending verification email for:', email);

    // Call backend resend verification endpoint - sending email as query parameter
    const response = await axios.post(`${BACKEND_URL}/users/resend-verification?email=${encodeURIComponent(email)}`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Resend verification backend response:', response.data);

    res.json({
      success: true,
      message: response.data || 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error - Status:', error.response?.status);
    console.error('Resend verification error - Data:', error.response?.data);
    console.error('Resend verification error - Message:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data || 'Failed to resend verification email'
      });
    } else {
      res.status(500).json({ error: 'Internal server error during resend verification' });
    }
  }
});

// Protected route example - Dashboard data
app.get('/api/dashboard', requireAuth, (req, res) => {
  const { user } = req.session;
  
  // Clear dashboard logic based on email validation status
  const dashboardData = {
    user: {
      id: user.id,
      email: user.email,
      emailValidated: user.emailValidated
    },
    emailStatus: {
      isValidated: user.emailValidated,
      message: user.emailValidated 
        ? '✅ Your email is verified! You have full access to the portal.' 
        : '⚠️ Please verify your email to access all features. Check your inbox for the verification email.',
      needsVerification: !user.emailValidated
    },
    timestamp: new Date().toISOString(),
    welcomeMessage: `Welcome back, ${user.email}!`
  };

  console.log('Dashboard accessed by user:', user.email, 'Email validated:', user.emailValidated);
  
  res.json(dashboardData);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Session server running on port ${PORT}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`Using simple memory store for sessions`);
});

module.exports = app;

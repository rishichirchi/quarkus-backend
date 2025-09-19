# Frontend Authentication Portal

This is the frontend application for the authentication system, built with React and Express.js for session management.

## Architecture

- **React App** (Port 3000) - User interface
- **Express Session Server** (Port 3001) - Session management and API proxy
- **Quarkus Backend** (Port 8080) - Authentication logic
- **Email Service** (Port 8000) - Email sending functionality

## Features

- 🔐 **Secure Authentication** - Login/Signup with session management
- 📧 **Email Verification** - Email verification with clickable links
- 🎨 **Modern UI** - Responsive design with React and CSS
- 🧪 **Testing** - Unit tests for components and API endpoints
- 🔄 **Session Management** - Express.js session handling
- 📱 **Responsive Design** - Mobile-friendly interface
- 🚀 **Production Ready** - Optimized build and deployment configs

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Backend services running (Quarkus auth-service and email-service)

### Installation

1. **Install Session Server Dependencies**
```bash
cd frontend/session-server
npm install
```

2. **Install React App Dependencies**
```bash
cd ../react-app
npm install
```

### Development Setup

1. **Start the Session Server**
```bash
cd frontend/session-server
npm run dev
```

2. **Start the React App**
```bash
cd frontend/react-app
npm start
```

3. **Access the Application**
- Frontend: http://localhost:3000
- Session API: http://localhost:3001

## Environment Configuration

### Session Server (.env)
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
SESSION_SECRET=your-super-secret-session-key
```

## Project Structure

```
frontend/
├── session-server/           # Express.js session management
│   ├── server.js            # Main server file
│   ├── tests/               # API tests
│   └── package.json
│
└── react-app/               # React frontend application
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── pages/          # Page components
    │   ├── context/        # React context (AuthContext)
    │   ├── hooks/          # Custom React hooks
    │   ├── services/       # API service layer
    │   └── tests/          # Component tests
    └── package.json
```

## API Endpoints (Session Server)

### Authentication
- `POST /api/signup` - Register new user
- `POST /api/login` - Authenticate user
- `POST /api/logout` - Logout user
- `GET /api/session` - Get current session

### Email Verification
- `GET /api/verify-email?token={token}` - Verify email
- `POST /api/resend-verification` - Resend verification email

### Protected Routes
- `GET /api/dashboard` - Get dashboard data (requires auth)

## Pages & Features

### 🔑 Login Page (`/login`)
- Email/password authentication
- Form validation
- Password visibility toggle
- Redirect to dashboard on success

### 📝 Signup Page (`/signup`)
- User registration
- Strong password validation
- Password confirmation
- Email verification trigger

### 🏠 Dashboard (`/dashboard`)
- Protected route (requires login)
- Email verification status
- Account information
- Resend verification option
- Logout functionality

### ✅ Email Verification (`/verify-email`)
- Token-based email verification
- Success/error handling
- Auto-redirect to dashboard

## Testing

### Run Frontend Tests
```bash
cd frontend/react-app
npm test
```

### Run Backend Tests  
```bash
cd frontend/session-server
npm test
```

### Test Coverage
- Component rendering tests
- Form validation tests
- API endpoint tests
- Session management tests
- Authentication flow tests

## Security Features

- **Session Management** - HTTP-only cookies
- **CORS Protection** - Configured for specific origins
- **Rate Limiting** - API request rate limiting
- **Helmet Security** - Security headers
- **Input Validation** - Server-side validation
- **Password Requirements** - Strong password enforcement

## User Experience

### Email Validation States
- **Unverified**: "You need to validate your email to access the portal"
- **Verified**: "Your email is validated. You can access the portal"

### Form Validation
- Real-time validation feedback
- Clear error messages
- Loading states during submission

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Optimized for all screen sizes

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
SESSION_SECRET=long-random-production-secret
BACKEND_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

### Build Commands
```bash
# Build React app
cd frontend/react-app
npm run build

# Start session server
cd frontend/session-server
npm start
```

### Deployment Options
- **AWS EC2** - Direct deployment with PM2
- **Docker** - Containerized deployment
- **Heroku** - Platform-as-a-Service
- **Vercel/Netlify** - Static hosting (React app only)

## Performance Optimizations

- **React Query** - Efficient data fetching and caching
- **Code Splitting** - Lazy loading of routes
- **Bundle Optimization** - Minimized production builds
- **Session Caching** - Efficient session storage

## Error Handling

- **Global Error Boundaries** - React error boundaries
- **API Error Handling** - Standardized error responses
- **User Notifications** - Toast notifications for feedback
- **Fallback UI** - Loading and error states

## Accessibility

- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Support** - ARIA labels and roles
- **Color Contrast** - WCAG compliant colors
- **Focus Management** - Proper focus handling

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check FRONTEND_URL in session server
   - Verify withCredentials is set

2. **Session Not Persisting**
   - Check cookie settings
   - Verify SESSION_SECRET is set

3. **API Connection Issues**
   - Check BACKEND_URL configuration
   - Verify backend services are running

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development`

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

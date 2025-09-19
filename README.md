# 🔐 Authentication Portal - Quarkus Backend

A complete user authentication system with email verification, built with modern technologies and deployed on AWS. This project implements secure user signup, login, email validation, and session management with a microservices architecture.

![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen?style=for-the-badge&logo=aws)
![Build Status](https://img.shields.io/badge/Build-Passing-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## 🌐 Live Demo

**Portal URL**: [http://13.235.32.214](http://13.235.32.214)

## 📋 Features

✅ **User Registration** - Secure signup with email and password  
✅ **Password Encryption** - BCrypt salted password hashing  
✅ **Email Verification** - Automated email verification with unique tokens  
✅ **User Authentication** - Session-based login/logout system  
✅ **Dashboard Access Control** - Different views based on email verification status  
✅ **Modern UI/UX** - Clean, responsive React interface  
✅ **Microservices Architecture** - Scalable containerized services  
✅ **AWS Deployment** - Production-ready cloud hosting  

## 🏗️ Architecture Overview

```mermaid
graph TB
    User[👤 User Browser] --> Nginx[🌐 Nginx Proxy]
    
    Nginx --> Frontend[⚛️ React Frontend]
    Nginx --> SessionAPI[📡 /api/* → Session Server]
    
    Frontend --> SessionServer[🖥️ Session Server<br/>Node.js + Express]
    SessionServer --> AuthService[🔐 Auth Service<br/>Quarkus + Java]
    SessionServer --> EmailService[📧 Email Service<br/>Python + FastAPI]
    
    AuthService --> PostgreSQL[(🗄️ PostgreSQL<br/>Database)]
    SessionServer --> Redis[(🔴 Redis<br/>Session Store)]
    
    EmailService --> Brevo[📮 Brevo API<br/>Email Delivery]
    
    subgraph "🐳 Docker Containers"
        Frontend
        SessionServer  
        AuthService
        EmailService
        PostgreSQL
        Redis
        Nginx
    end
    
    subgraph "☁️ AWS EC2"
        direction TB
        Docker[Docker Compose]
    end
    
    style User fill:#e1f5fe
    style Nginx fill:#f3e5f5
    style Frontend fill:#e8f5e8
    style SessionServer fill:#fff3e0
    style AuthService fill:#ffebee
    style EmailService fill:#f1f8e9
    style PostgreSQL fill:#e3f2fd
    style Redis fill:#ffebee
    style Brevo fill:#e8eaf6
```

## 🛠️ Tech Stack

### **Backend Services**
- **🔥 Quarkus** - High-performance Java framework
- **🐍 Python FastAPI** - Email service microservice
- **🟢 Node.js + Express** - Session management middleware
- **☕ Java 21** - Latest LTS version
- **🔧 Maven** - Build automation and dependency management

### **Frontend**
- **⚛️ React 18** - Modern UI library
- **🎨 CSS3** - Custom styling with glass morphism design
- **📱 Responsive Design** - Mobile-first approach
- **🎭 Lucide React** - Beautiful icon library

### **Database & Storage**
- **🐘 PostgreSQL 16** - Primary relational database
- **🔴 Redis 7** - Session storage and caching
- **💾 Docker Volumes** - Persistent data storage

### **Third-Party Services**
- **📮 Brevo (SendinBlue)** - Transactional email delivery
- **☁️ AWS EC2** - Cloud hosting platform
- **🐳 Docker Hub** - Container registry

### **DevOps & Deployment**
- **🐳 Docker + Docker Compose** - Containerization
- **🌐 Nginx** - Reverse proxy and load balancer
- **🔒 SSL Ready** - HTTPS configuration prepared
- **📊 Health Checks** - Service monitoring
- **📝 Centralized Logging** - JSON log format

## 📊 Service Architecture

| Service | Technology | Port | Purpose |
|---------|------------|------|---------|
| **Frontend** | React | - | User interface |
| **Session Server** | Node.js | 3001 | Session management & API gateway |
| **Auth Service** | Quarkus | 8080 | User authentication & business logic |
| **Email Service** | Python | 8000 | Email verification system |
| **Database** | PostgreSQL | 5432 | Data persistence |
| **Cache** | Redis | 6379 | Session storage |
| **Proxy** | Nginx | 80/443 | Load balancing & SSL termination |

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- AWS Account (for deployment)
- Brevo API Key (for emails)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/rishichirchi/quarkus-backend.git
cd quarkus-backend
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start services**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost
- API: http://localhost/api/session

### AWS Deployment

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t2.micro (free tier)
   - Security Groups: HTTP (80), HTTPS (443), SSH (22)

2. **Setup on EC2**
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Run setup script
curl -fsSL https://raw.githubusercontent.com/rishichirchi/quarkus-backend/main/deployment/scripts/setup-ec2.sh | bash

# Clone and deploy
git clone https://github.com/rishichirchi/quarkus-backend.git
cd quarkus-backend
cp .env.example .env.prod
# Configure .env.prod with production values
./deployment/scripts/deploy.sh
```

## 🔧 Configuration

### Environment Variables

```bash
# Database Configuration
POSTGRES_DB=authdb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# Email Service (Brevo)
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=YourAppName

# Application URLs
VERIFICATION_URL=https://yourdomain.com/verify-email
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=http://auth-service:8080

# Security
SESSION_SECRET=your-super-secure-session-secret
```

## 🔒 Security Features

- **Password Hashing**: BCrypt with salt
- **Session Security**: HTTP-only cookies with CSRF protection
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive data sanitization
- **CORS Configuration**: Secure cross-origin requests
- **Environment Isolation**: Separate dev/prod configurations

## 📚 API Documentation

### Authentication Endpoints

#### User Registration
```http
POST /api/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### User Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Email Verification
```http
GET /api/verify-email?token=verification-token
```

#### Session Check
```http
GET /api/session
```

#### Logout
```http
POST /api/logout
```

## 🧪 Testing

### Backend Tests
```bash
cd auth-service
./mvnw test
```

### Frontend Tests
```bash
cd frontend/react-app
npm test
```

### Integration Tests
```bash
# Test all services
curl http://localhost/api/session
curl http://localhost:8080/q/health
curl http://localhost:8000/health
```

## 📱 User Flow

1. **Registration** → User signs up with email/password
2. **Email Verification** → System sends verification email via Brevo
3. **Account Activation** → User clicks verification link
4. **Login** → User authenticates with credentials
5. **Dashboard Access** → Different views based on verification status
6. **Session Management** → Secure logout and session handling

## 🔍 Monitoring & Logging

- **Health Checks**: All services include health endpoints
- **Centralized Logs**: JSON format with log rotation
- **Service Discovery**: Docker internal networking
- **Graceful Shutdown**: Proper container lifecycle management

## 🚧 Future Enhancements

- [ ] OAuth2 Integration (Google, GitHub)
- [ ] Password Reset Functionality
- [ ] Two-Factor Authentication (2FA)
- [ ] User Profile Management
- [ ] Admin Dashboard
- [ ] API Rate Limiting Dashboard
- [ ] Advanced Analytics
- [ ] Mobile App Support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Rishi Chirchi**
- GitHub: [@rishichirchi](https://github.com/rishichirchi)
- Email: rishiraj.chirchi@gmail.com

## 🙏 Acknowledgments

- **Quarkus Team** for the amazing framework
- **Brevo** for reliable email delivery service
- **Docker** for containerization platform
- **AWS** for cloud infrastructure
- **React Community** for the frontend ecosystem

---

<div align="center">
  
**⭐ Star this repository if you found it helpful! ⭐**

Made with ❤️ and lots of ☕

</div>

#!/bin/bash

# Development Setup Script for Auth Portal Frontend
# This script sets up the development environment for both React app and session server

set -e

echo "🚀 Setting up Auth Portal Frontend Development Environment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 16+ and try again."
    exit 1
fi

print_status "Node.js version $NODE_VERSION detected ✓"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_status "npm $(npm --version) detected ✓"

# Setup Session Server
print_status "Setting up Session Server..."
cd session-server

if [ ! -f package.json ]; then
    print_error "package.json not found in session-server directory"
    exit 1
fi

print_status "Installing session server dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file for session server..."
    cp .env .env.example 2>/dev/null || echo "# Session Server Environment Variables

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Backend Service URL
BACKEND_URL=http://localhost:8080

# Session Configuration
SESSION_SECRET=dev-session-secret-change-in-production" > .env
    print_warning "Created .env file. Please update the SESSION_SECRET for production use."
fi

# Setup React App
print_status "Setting up React Application..."
cd ../react-app

if [ ! -f package.json ]; then
    print_error "package.json not found in react-app directory"
    exit 1
fi

print_status "Installing React app dependencies..."
npm install

# Run tests to verify setup
print_status "Running tests to verify setup..."

cd ../session-server
print_status "Testing session server..."
npm test -- --watchAll=false

cd ../react-app
print_status "Testing React app..."
npm test -- --watchAll=false

print_status "✅ Setup completed successfully!"
echo ""
echo "🎉 Your development environment is ready!"
echo ""
echo "To start development:"
echo "1. Start the backend services (Quarkus + Email service + PostgreSQL)"
echo "   cd ../../"
echo "   docker compose up postgres email-service auth-service"
echo ""
echo "2. Start the session server:"
echo "   cd frontend/session-server"
echo "   npm run dev"
echo ""
echo "3. Start the React app (in another terminal):"
echo "   cd frontend/react-app"
echo "   npm start"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, see the README.md file"

#!/bin/bash
# Production Deployment Script
# Run this after setting up EC2 and configuring .env.prod

set -e

# Colors for output
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

# Check if .env.prod exists
if [ ! -f ".env.prod" ]; then
    print_error ".env.prod file not found!"
    print_status "Please copy .env.example to .env.prod and configure it with your values."
    exit 1
fi

print_status "🚀 Starting production deployment..."

# Load environment variables
print_status "📋 Loading environment variables..."
export $(grep -v '^#' .env.prod | xargs)

# Validate required environment variables
print_status "✅ Validating environment variables..."
required_vars=("POSTGRES_PASSWORD" "BREVO_API_KEY" "DOMAIN_NAME" "SESSION_SECRET")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in .env.prod"
        exit 1
    fi
done

print_status "✅ Environment validation passed!"

# Pull latest code (if git repo)
if [ -d ".git" ]; then
    print_status "📦 Pulling latest code..."
    git pull origin main || git pull origin master
fi

# Stop existing containers
print_status "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true

# Remove old images to free space
print_status "🧹 Cleaning up old Docker images..."
docker system prune -f

# Build and start services
print_status "🏗️  Building and starting services..."
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
print_status "⏳ Waiting for services to be healthy..."
sleep 30

# Check service status
print_status "📊 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Test database connection
print_status "🔍 Testing database connection..."
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U ${POSTGRES_USER:-postgres} > /dev/null 2>&1; then
    print_status "✅ Database is ready"
else
    print_warning "⚠️  Database not ready yet, may need more time"
fi

# Test API endpoint
print_status "🔍 Testing API endpoint..."
sleep 10
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_status "✅ Session server is responding"
else
    print_warning "⚠️  Session server not responding yet"
fi

# Setup SSL certificate (if domain is configured and not localhost)
if [ "$DOMAIN_NAME" != "localhost" ] && [ "$DOMAIN_NAME" != "yourdomain.com" ]; then
    print_status "🔒 Setting up SSL certificate..."
    
    # Stop nginx container temporarily
    docker-compose -f docker-compose.prod.yml stop nginx
    
    # Get SSL certificate
    sudo certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --email ${SSL_EMAIL:-admin@$DOMAIN_NAME} \
        -d $DOMAIN_NAME \
        -d www.$DOMAIN_NAME || print_warning "SSL setup failed - you can set it up manually later"
    
    # Copy certificates to project directory
    sudo mkdir -p deployment/ssl
    sudo cp /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem deployment/ssl/ 2>/dev/null || true
    sudo cp /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem deployment/ssl/ 2>/dev/null || true
    sudo chown -R $USER:$USER deployment/ssl 2>/dev/null || true
    
    # Restart nginx container
    docker-compose -f docker-compose.prod.yml start nginx
else
    print_warning "⚠️  SSL setup skipped - configure DOMAIN_NAME in .env.prod for SSL"
fi

# Show deployment summary
print_status "📋 Deployment Summary:"
echo "----------------------------------------"
echo "🌐 Frontend: http://localhost (or https://$DOMAIN_NAME)"
echo "🔗 API: http://localhost/api"
echo "📊 Services Status:"
docker-compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

print_status "✅ Deployment complete!"
print_status "🎉 Your application should now be accessible!"

if [ "$DOMAIN_NAME" != "localhost" ] && [ "$DOMAIN_NAME" != "yourdomain.com" ]; then
    echo ""
    print_status "🌐 Your application is available at:"
    echo "   Primary: https://$DOMAIN_NAME"
    echo "   Alternative: https://www.$DOMAIN_NAME"
else
    echo ""
    print_status "🌐 Your application is available at:"
    echo "   Local: http://localhost"
    echo "   (Configure DOMAIN_NAME in .env.prod for production domain)"
fi

echo ""
print_status "📝 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Restart: docker-compose -f docker-compose.prod.yml restart"
echo "   Stop: docker-compose -f docker-compose.prod.yml down"
echo "   Update: ./deployment/scripts/deploy.sh"

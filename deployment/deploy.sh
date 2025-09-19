#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Load environment variables
if [ -f .env.prod ]; then
    source .env.prod
    echo "✅ Environment variables loaded"
else
    echo "❌ .env.prod file not found!"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images (optional - uncomment to free space)
# echo "🗑️ Cleaning up old images..."
# docker system prune -f

# Build and start services
echo "🏗️ Building and starting services..."
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 60

# Check service health
echo "🔍 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Test endpoints
echo "🧪 Testing endpoints..."
sleep 10

# Test frontend
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding"
fi

# Test API
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ API is responding"
else
    echo "❌ API is not responding"
fi

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Application available at: http://localhost"
echo "📊 View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🔧 Check status: docker-compose -f docker-compose.prod.yml ps"

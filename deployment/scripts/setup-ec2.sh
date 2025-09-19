#!/bin/bash
# EC2 Initial Setup Script
# Run this script on a fresh Ubuntu EC2 instance

set -e

echo "🚀 Setting up EC2 instance for Docker deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    htop \
    nano \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx (for SSL certificate management)
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL certificates
echo "🔒 Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

# Setup firewall
echo "🔥 Setting up firewall..."
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/app
sudo chown $USER:$USER /opt/app

# Setup log rotation for Docker
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/docker-logs > /dev/null <<EOF
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

# Setup Docker daemon configuration
echo "⚙️ Configuring Docker daemon..."
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    }
}
EOF

# Restart Docker
sudo systemctl restart docker

# Enable Docker to start on boot
sudo systemctl enable docker

echo "✅ EC2 setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Log out and log back in (or run 'newgrp docker')"
echo "2. Clone your repository: git clone <your-repo-url>"
echo "3. Navigate to your project directory"
echo "4. Copy .env.example to .env.prod and configure it"
echo "5. Run the deployment script: ./deployment/scripts/deploy.sh"
echo ""
echo "🔧 Useful commands:"
echo "  - Check Docker: docker --version"
echo "  - Check Docker Compose: docker-compose --version"
echo "  - View system resources: htop"
echo "  - Check firewall status: sudo ufw status"

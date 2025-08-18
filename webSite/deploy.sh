#!/bin/bash

# Complete Deployment Script
# This script handles the entire deployment process

echo "🚀 Starting deployment process..."

# Exit on any error
set -e

# Load environment variables from .env.production if it exists
if [ -f .env.production ]; then
    echo "📝 Loading production environment variables..."
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Set default port
export PORT=${PORT:-3001}

echo "🔧 Deployment Configuration:"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo "   API_URL: $NEXT_PUBLIC_API_URL"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build:prod

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    echo "🔄 Using PM2 for process management..."
    
    # Stop existing process if running
    pm2 stop website-frontend 2>/dev/null || echo "No existing process to stop"
    
    # Start with PM2
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    echo "✅ Application deployed successfully with PM2!"
    echo "📊 Check status with: pm2 status"
    echo "📝 View logs with: pm2 logs website-frontend"
else
    echo "⚠️  PM2 not found, starting with npm..."
    npm run start:prod
fi

echo "🎉 Deployment completed!"
echo "🌐 Application should be running on http://localhost:$PORT"

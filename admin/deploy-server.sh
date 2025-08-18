#!/bin/bash

echo "🚀 Deploying Matka Admin to Production..."

# Stop existing PM2 process
echo "🛑 Stopping existing PM2 process..."
pm2 stop matka-admin 2>/dev/null || echo "No existing process found"

# Build the application
echo "🏗️  Building application..."
chmod +x build-production.sh
./build-production.sh

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Deployment aborted."
    exit 1
fi

# Start with PM2
echo "🎯 Starting application with PM2..."
pm2 start ecosystem.config.js --env production --update-env

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed!"
echo "📊 Application status:"
pm2 status
echo ""
echo "🌐 Application should be running on:"
echo "   - Local: http://localhost:3012"
echo "   - Network: http://$(hostname -I | awk '{print $1}'):3012"
echo ""
echo "📋 Useful commands:"
echo "   pm2 logs matka-admin    # View logs"
echo "   pm2 monit              # Monitor processes"
echo "   pm2 restart matka-admin # Restart app"

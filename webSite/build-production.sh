#!/bin/bash

# Production Build Script for Next.js App
# This script builds the application for production deployment

echo "🚀 Starting production build process..."

# Set environment to production
export NODE_ENV=production

# Install dependencies (if needed)
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build:prod

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Production build completed successfully!"
    echo "📁 Build output is in the .next folder"
    echo "🎯 Ready to deploy with: npm run start:prod"
else
    echo "❌ Production build failed!"
    exit 1
fi

#!/bin/bash

# Production Start Script for Next.js App
# This script starts the application in production mode

echo "🚀 Starting Next.js application in production mode..."

# Set environment to production
export NODE_ENV=production

# Set default port if not specified
export PORT=${PORT:-3001}

echo "📡 Starting server on port $PORT..."

# Start the application
npm run start:prod

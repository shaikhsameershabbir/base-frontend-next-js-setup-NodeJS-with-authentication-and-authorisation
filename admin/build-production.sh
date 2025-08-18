#!/bin/bash

echo "🏗️  Building Matka Admin for Production..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Loaded environment variables from .env"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next

# Build with environment variables
echo "🚀 Building application with API URL: $NEXT_PUBLIC_API_URL"
NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📦 Ready for deployment on port $PORT"
else
    echo "❌ Build failed!"
    exit 1
fi

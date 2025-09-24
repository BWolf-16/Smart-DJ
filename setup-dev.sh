#!/bin/bash
# Smart DJ Development Setup Script

echo "🎵 Smart DJ Development Setup"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file from .env.example"
    echo "⚠️  Please update the .env file with your API keys!"
fi

# Create necessary directories
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p docker/mongodb/init
mkdir -p docker/nginx

echo "📁 Created necessary directories"

# Start development environment
echo "🚀 Starting development environment..."
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:3001"
echo ""
echo "To stop the development server, press Ctrl+C"
echo ""

npm run dev
#!/bin/bash

echo "Setting up Personal Dashboard development environment..."

# Check Node.js version
if ! node --version &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js 18+ first."
    echo "Current PATH: $PATH"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup databases (if Docker is available)
if command -v docker &> /dev/null; then
    echo "🐳 Setting up development databases..."
    docker-compose -f deployments/docker/docker-compose.dev.yml up -d
else
    echo "⚠️ Docker not found. Please install Neo4j and MongoDB manually."
    echo "   Neo4j: https://neo4j.com/download/"
    echo "   MongoDB: https://www.mongodb.com/try/download/community"
fi

# Copy environment template
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "📝 Created .env file. Please update with your database credentials."
fi

echo "🎉 Development environment setup complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "To run tests:"
echo "  npm test"

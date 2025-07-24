#!/bin/bash
set -e

echo "🔧 Building Stack project for local development"

# Step 1: Build Lambda services
echo "📦 Building Lambda services..."
cd services
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build

# Step 2: Start PostgreSQL database
echo "🗄️  Starting PostgreSQL database..."
cd ../docker
docker-compose -f docker-compose.dev.yml up postgres -d

# Wait for database to be ready
echo "⏳ Waiting for database to start..."
sleep 10

# Step 3: Initialize database
echo "🏗️  Initializing database..."
cd ../api
npm run db:init

# Step 4: Start API server
echo "🚀 Starting API server..."
npm run dev &
API_PID=$!

# Step 5: Start client (if available)
if [ -d "../client" ]; then
    echo "🌐 Starting client..."
    cd ../client
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run dev &
    CLIENT_PID=$!
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📋 Services Status:"
echo "- PostgreSQL: ✅ Running (localhost:5432)"
echo "- API Server: ✅ Running (localhost:3000)"
if [ ! -z "$CLIENT_PID" ]; then
    echo "- Client: ✅ Running (localhost:3000)"
fi
echo ""
echo "🌐 Access your application:"
echo "- API Health: http://localhost:3000/health"
echo "- API Docs: http://localhost:3000/api-docs"
echo "- API Endpoints: http://localhost:3000/api"
if [ ! -z "$CLIENT_PID" ]; then
    echo "- Client App: http://localhost:3000"
fi
echo ""
echo "💡 Tips:"
echo "- Use 'npm run db:reset' to reset the database"
echo "- Use 'npm run db:seed' to add sample data"
echo "- Check logs with 'docker-compose -f docker/docker-compose.dev.yml logs postgres'"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "🛑 Stopping services..."; kill $API_PID 2>/dev/null; if [ ! -z "$CLIENT_PID" ]; then kill $CLIENT_PID 2>/dev/null; fi; docker-compose -f docker/docker-compose.dev.yml down; exit 0' INT

wait

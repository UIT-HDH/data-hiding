#!/bin/bash

echo "🚀 Data Hiding Academic Project - Quick Start"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -d "api" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Kill existing processes
echo -e "${YELLOW}🔄 Stopping existing processes...${NC}"
pkill -f "start_simple.py" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "pnpm dev" 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 2

# Function to start backend
start_backend() {
    echo -e "${BLUE}🔧 Starting Backend...${NC}"
    
    cd api
    
    # Check if venv exists
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
        python3 -m venv venv
    fi
    
    # Activate venv and install dependencies
    source venv/bin/activate
    
    # Install requirements if needed
    if [ ! -f "venv/.installed" ]; then
        echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
        pip install -r requirements.txt
        touch venv/.installed
    fi
    
    # Start backend
    echo -e "${GREEN}✅ Starting academic backend server...${NC}"
    python start_simple.py &
    BACKEND_PID=$!
    
    cd ..
    
    # Wait for backend to start
    echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
    for i in {1..15}; do
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is running at http://localhost:8000${NC}"
            return 0
        fi
        echo -e "${YELLOW}⏳ Attempt $i/15...${NC}"
        sleep 2
    done
    
    echo -e "${RED}❌ Backend failed to start${NC}"
    return 1
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🔧 Starting Frontend...${NC}"
    
    cd frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        pnpm install
    fi
    
    # Start frontend
    echo -e "${GREEN}✅ Starting frontend server...${NC}"
    pnpm dev &
    FRONTEND_PID=$!
    
    cd ..
    
    # Wait for frontend to start
    echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
    for i in {1..15}; do
        if curl -s http://localhost:5173 >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend is running at http://localhost:5173${NC}"
            return 0
        fi
        echo -e "${YELLOW}⏳ Attempt $i/15...${NC}"
        sleep 2
    done
    
    echo -e "${RED}❌ Frontend failed to start${NC}"
    return 1
}

# Main execution
echo -e "${BLUE}📚 Đồ án môn học: Data Hiding với Adaptive LSB Steganography${NC}"
echo -e "${BLUE}🔬 Algorithm: Sobel Edge Detection + Adaptive LSB${NC}"
echo ""

# Start services
if start_backend && start_frontend; then
    echo ""
    echo -e "${GREEN}🎉 System startup complete!${NC}"
    echo ""
    echo -e "${BLUE}📚 Access URLs:${NC}"
    echo -e "   🌐 Frontend App: ${GREEN}http://localhost:5173${NC}"
    echo -e "   🔧 Backend API: ${GREEN}http://localhost:8000${NC}"
    echo -e "   📖 API Documentation: ${GREEN}http://localhost:8000/docs${NC}"
    echo -e "   ❤️  Health Check: ${GREEN}http://localhost:8000/health${NC}"
    echo ""
    echo -e "${BLUE}🎯 Demo URLs:${NC}"
    echo -e "   📊 Embed Page: ${GREEN}http://localhost:5173/embed${NC}"
    echo -e "   🔍 Extract Page: ${GREEN}http://localhost:5173/extract${NC}"
    echo ""
    echo -e "${YELLOW}💡 API Endpoints:${NC}"
    echo -e "   POST http://localhost:8000/api/v1/embed"
    echo -e "   POST http://localhost:8000/api/v1/extract"
    echo ""
    echo -e "${GREEN}🚀 Ready for academic demo!${NC}"
    echo -e "${BLUE}Press Ctrl+C to stop all services${NC}"
    echo ""
    
    # Keep script running and monitor
    trap 'echo -e "\n${YELLOW}🛑 Stopping services...${NC}"; pkill -f "start_simple.py"; pkill -f "pnpm dev"; exit 0' INT
    
    while true; do
        sleep 5
        # Check if services are still running
        if ! curl -s http://localhost:8000/health >/dev/null 2>&1; then
            echo -e "${RED}❌ Backend stopped unexpectedly${NC}"
            break
        fi
        if ! curl -s http://localhost:5173 >/dev/null 2>&1; then
            echo -e "${RED}❌ Frontend stopped unexpectedly${NC}"
            break
        fi
    done
else
    echo ""
    echo -e "${RED}❌ Failed to start services${NC}"
    echo -e "${YELLOW}💡 Try running:${NC}"
    echo -e "   cd api && source venv/bin/activate && python run_academic_backend.py"
    echo -e "   cd frontend && pnpm dev"
    exit 1
fi

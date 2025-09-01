#!/bin/bash

echo "🚀 Data Hiding System - Quick Start"
echo "==================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

# Function to kill existing processes
kill_existing() {
    echo -e "${YELLOW}🔄 Killing existing processes...${NC}"
    pkill -f "python.*run_academic_backend.py" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    sleep 2
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}🔧 Starting Backend...${NC}"
    
    cd api
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Check port 8000
    if ! check_port 8000; then
        lsof -ti:8000 | xargs kill -9
        sleep 2
    fi
    
    # Start backend
    echo -e "${GREEN}✅ Starting backend server...${NC}"
    nohup python3 run_academic_backend.py > backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
    
    cd ..
    
    # Wait for backend to start
    echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
    for i in {1..10}; do
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is running at http://localhost:8000${NC}"
            return 0
        fi
        echo -e "${YELLOW}⏳ Attempt $i/10...${NC}"
        sleep 2
    done
    
    echo -e "${RED}❌ Backend failed to start${NC}"
    return 1
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🔧 Starting Frontend...${NC}"
    
    cd frontend
    
    # Check port 5173
    if ! check_port 5173; then
        PORT=3000
        echo -e "${YELLOW}⚠️  Using port 3000 instead${NC}"
    else
        PORT=5173
    fi
    
    # Start frontend
    echo -e "${GREEN}✅ Starting frontend server...${NC}"
    nohup pnpm dev --port $PORT > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    
    cd ..
    
    # Wait for frontend to start
    echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
    for i in {1..10}; do
        if curl -s http://localhost:$PORT >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend is running at http://localhost:$PORT${NC}"
            return 0
        fi
        echo -e "${YELLOW}⏳ Attempt $i/10...${NC}"
        sleep 2
    done
    
    echo -e "${RED}❌ Frontend failed to start${NC}"
    return 1
}

# Function to show status
show_status() {
    echo -e "\n${BLUE}📊 System Status:${NC}"
    echo "=================="
    
    # Check backend
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend: RUNNING${NC}"
    else
        echo -e "${RED}❌ Backend: STOPPED${NC}"
    fi
    
    # Check frontend
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend: RUNNING (Port 5173)${NC}"
    elif curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend: RUNNING (Port 3000)${NC}"
    else
        echo -e "${RED}❌ Frontend: STOPPED${NC}"
    fi
}

# Function to stop all services
stop_services() {
    echo -e "\n${YELLOW}🛑 Stopping all services...${NC}"
    
    # Stop backend
    if [ -f "api/backend.pid" ]; then
        BACKEND_PID=$(cat api/backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm -f api/backend.pid
        echo -e "${GREEN}✅ Backend stopped${NC}"
    fi
    
    # Stop frontend
    if [ -f "frontend/frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend/frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm -f frontend/frontend.pid
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    fi
    
    # Kill any remaining processes
    pkill -f "python.*run_academic_backend.py" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Main execution
main() {
    # Kill existing processes
    kill_existing
    
    # Start services
    if start_backend && start_frontend; then
        echo -e "\n${GREEN}🎉 System startup complete!${NC}"
        echo -e "\n${BLUE}📚 Access URLs:${NC}"
        echo -e "   Frontend: http://localhost:5173 (or http://localhost:3000)"
        echo -e "   Backend API: http://localhost:8000"
        echo -e "   API Docs: http://localhost:8000/docs"
        
        echo -e "\n${YELLOW}💡 Commands:${NC}"
        echo -e "   Show status: $0 status"
        echo -e "   Stop all: $0 stop"
        
        echo -e "\n${GREEN}🚀 Ready for demo!${NC}"
        echo -e "\n${BLUE}Press Ctrl+C to stop all services${NC}"
        
        # Keep script running
        while true; do
            sleep 10
            show_status
        done
    else
        echo -e "\n${RED}❌ Failed to start services${NC}"
        exit 1
    fi
}

# Handle command line arguments
case "${1:-start}" in
    "start")
        main
        ;;
    "status")
        show_status
        ;;
    "stop")
        stop_services
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo -e "${BLUE}Usage:${NC}"
        echo -e "   $0 start    - Start all services"
        echo -e "   $0 status   - Show service status"
        echo -e "   $0 stop     - Stop all services"
        exit 1
        ;;
esac

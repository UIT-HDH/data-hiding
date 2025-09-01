#!/bin/bash

echo "🚀 Starting Complete Backend System for Data Hiding Project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $port is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
        return 0
    fi
}

# Function to kill existing processes
kill_existing() {
    echo -e "${YELLOW}🔄 Killing existing backend processes...${NC}"
    pkill -f "python.*simple_backend.py" 2>/dev/null || true
    pkill -f "python.*cors_server.py" 2>/dev/null || true
    pkill -f "uvicorn.*app.main:app" 2>/dev/null || true
    sleep 2
}

# Function to start simple backend
start_simple_backend() {
    echo -e "${BLUE}📡 Starting Simple Backend (Port 8000)...${NC}"
    
    if check_port 8000; then
        nohup python3 simple_backend.py > simple_backend.log 2>&1 &
        SIMPLE_PID=$!
        echo -e "${GREEN}✅ Simple Backend started with PID: $SIMPLE_PID${NC}"
        return 0
    else
        return 1
    fi
}

# Function to start FastAPI backend
start_fastapi_backend() {
    echo -e "${BLUE}📡 Starting FastAPI Backend (Port 8001)...${NC}"
    
    if check_port 8001; then
        cd app
        nohup uvicorn main:app --host 0.0.0.0 --port 8001 --reload > fastapi_backend.log 2>&1 &
        FASTAPI_PID=$!
        cd ..
        echo -e "${GREEN}✅ FastAPI Backend started with PID: $FASTAPI_PID${NC}"
        return 0
    else
        return 1
    fi
}

# Function to start CORS server
start_cors_server() {
    echo -e "${BLUE}📡 Starting CORS Server (Port 8002)...${NC}"
    
    if check_port 8002; then
        nohup python3 cors_server.py > cors_server.log 2>&1 &
        CORS_PID=$!
        echo -e "${GREEN}✅ CORS Server started with PID: $CORS_PID${NC}"
        return 0
    else
        return 1
    fi
}

# Function to check service health
check_health() {
    local service_name=$1
    local port=$2
    local max_attempts=10
    local attempt=1
    
    echo -e "${YELLOW}🔍 Checking $service_name health on port $port...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port/health" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is healthy!${NC}"
            return 0
        else
            echo -e "${YELLOW}⏳ Attempt $attempt/$max_attempts - Waiting for $service_name...${NC}"
            sleep 2
            attempt=$((attempt + 1))
        fi
    done
    
    echo -e "${RED}❌ $service_name failed to start after $max_attempts attempts${NC}"
    return 1
}

# Function to show status
show_status() {
    echo -e "\n${BLUE}📊 Backend System Status:${NC}"
    echo "=================================="
    
    # Check Simple Backend
    if curl -s "http://localhost:8000/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Simple Backend (Port 8000): RUNNING${NC}"
    else
        echo -e "${RED}❌ Simple Backend (Port 8000): STOPPED${NC}"
    fi
    
    # Check FastAPI Backend
    if curl -s "http://localhost:8001/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ FastAPI Backend (Port 8001): RUNNING${NC}"
    else
        echo -e "${RED}❌ FastAPI Backend (Port 8001): STOPPED${NC}"
    fi
    
    # Check CORS Server
    if curl -s "http://localhost:8002/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ CORS Server (Port 8002): RUNNING${NC}"
    else
        echo -e "${RED}❌ CORS Server (Port 8002): STOPPED${NC}"
    fi
    
    echo "=================================="
}

# Function to show logs
show_logs() {
    echo -e "\n${BLUE}📋 Recent Logs:${NC}"
    echo "=================================="
    
    if [ -f "simple_backend.log" ]; then
        echo -e "${YELLOW}📄 Simple Backend Logs (last 5 lines):${NC}"
        tail -5 simple_backend.log
    fi
    
    if [ -f "fastapi_backend.log" ]; then
        echo -e "${YELLOW}📄 FastAPI Backend Logs (last 5 lines):${NC}"
        tail -5 fastapi_backend.log
    fi
    
    if [ -f "cors_server.log" ]; then
        echo -e "${YELLOW}📄 CORS Server Logs (last 5 lines):${NC}"
        tail -5 cors_server.log
    fi
    
    echo "=================================="
}

# Main execution
main() {
    echo -e "${BLUE}🎯 Data Hiding Backend System${NC}"
    echo "=================================="
    
    # Kill existing processes
    kill_existing
    
    # Start services
    echo -e "\n${BLUE}🚀 Starting Services...${NC}"
    
    start_simple_backend
    SIMPLE_SUCCESS=$?
    
    start_fastapi_backend
    FASTAPI_SUCCESS=$?
    
    start_cors_server
    CORS_SUCCESS=$?
    
    # Wait for services to start
    echo -e "\n${YELLOW}⏳ Waiting for services to start...${NC}"
    sleep 5
    
    # Check health
    echo -e "\n${BLUE}🔍 Health Checks...${NC}"
    
    if [ $SIMPLE_SUCCESS -eq 0 ]; then
        check_health "Simple Backend" 8000
    fi
    
    if [ $FASTAPI_SUCCESS -eq 0 ]; then
        check_health "FastAPI Backend" 8001
    fi
    
    if [ $CORS_SUCCESS -eq 0 ]; then
        check_health "CORS Server" 8002
    fi
    
    # Show final status
    show_status
    
    # Show logs
    show_logs
    
    echo -e "\n${GREEN}🎉 Backend System Startup Complete!${NC}"
    echo -e "${BLUE}📚 API Documentation:${NC}"
    echo -e "   Simple Backend: http://localhost:8000/"
    echo -e "   FastAPI Backend: http://localhost:8001/docs"
    echo -e "   CORS Server: http://localhost:8002/"
    
    echo -e "\n${YELLOW}💡 Commands:${NC}"
    echo -e "   Show status: ./start_backend.sh status"
    echo -e "   Show logs: ./start_backend.sh logs"
    echo -e "   Stop all: ./start_backend.sh stop"
}

# Handle command line arguments
case "${1:-start}" in
    "start")
        main
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        echo -e "${YELLOW}🛑 Stopping all backend services...${NC}"
        pkill -f "python.*simple_backend.py" 2>/dev/null || true
        pkill -f "python.*cors_server.py" 2>/dev/null || true
        pkill -f "uvicorn.*app.main:app" 2>/dev/null || true
        echo -e "${GREEN}✅ All services stopped${NC}"
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo -e "${BLUE}Usage:${NC}"
        echo -e "   ./start_backend.sh start   - Start all services"
        echo -e "   ./start_backend.sh status  - Show service status"
        echo -e "   ./start_backend.sh logs    - Show recent logs"
        echo -e "   ./start_backend.sh stop    - Stop all services"
        exit 1
        ;;
esac

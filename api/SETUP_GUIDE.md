# 🚀 Complete Setup Guide - FastAPI Steganography Backend

This comprehensive guide will walk you through every step to set up, configure, and deploy the FastAPI Steganography Backend from scratch.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start (5 minutes)](#quick-start-5-minutes)
- [Detailed Setup](#detailed-setup)
- [Configuration Guide](#configuration-guide)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Testing & Validation](#testing--validation)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS** | Windows 10, macOS 10.15, Ubuntu 18.04 | Latest stable versions |
| **RAM** | 4GB | 8GB+ |
| **Storage** | 2GB free space | 10GB+ |
| **CPU** | 2 cores | 4+ cores |

### Software Requirements

#### Option 1: Docker (Recommended)
```bash
# Install Docker Desktop
# Windows/Mac: Download from https://docker.com
# Ubuntu:
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify installation
docker --version
docker-compose --version
```

#### Option 2: Local Development
```bash
# Python 3.11+
python --version  # Should be 3.11 or higher

# Git
git --version

# Optional: Node.js (for testing tools)
node --version
```

---

## ⚡ Quick Start (5 minutes)

### 1. Clone Repository
```bash
git clone <your-repository-url>
cd data-hiding/api
```

### 2. Start with Docker
```bash
# Copy environment file
cp .env.example .env

# Start all services
docker-compose up --build

# Wait for startup (30-60 seconds)
# ✅ API: http://localhost:8000
# ✅ Docs: http://localhost:8000/docs
```

### 3. Test API
```bash
# Health check
curl http://localhost:8000/health

# Expected response:
{
  \"status\": \"healthy\",
  \"service\": \"Steganography API\",
  \"version\": \"1.0.0\"
}
```

**🎉 You're ready! Skip to [API Usage Examples](#api-usage-examples) for testing.**

---

## 📖 Detailed Setup

### Step 1: Environment Setup

#### Create Project Directory
```bash
mkdir steganography-api
cd steganography-api

# Clone or copy the project files
git clone <repository-url> .
```

#### Environment Configuration
```bash
# Copy template
cp .env.example .env

# Edit configuration
nano .env  # or your preferred editor
```

**Critical Settings:**
```bash
# Security (CHANGE THESE!)
SECRET_KEY=your-super-secret-256-bit-key-here
REDIS_PASSWORD=your-redis-password-here

# Application
ENVIRONMENT=development
DEBUG=true
APP_NAME=\"Your Steganography API\"

# Performance
MAX_FILE_SIZE=50
REQUEST_TIMEOUT=300
WORKERS=4

# Frontend Integration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Step 2: Docker Setup

#### Development Environment
```bash
# Start development stack
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f api
```

#### Production Environment
```bash
# Start with production profile
docker-compose --profile production up -d --build

# This includes:
# - API service
# - Redis cache
# - Nginx reverse proxy
# - SSL termination (configure certificates)
```

### Step 3: Local Development Setup (Alternative)

#### Python Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\\Scripts\\activate

# Upgrade pip
pip install --upgrade pip
```

#### Install Dependencies
```bash
# Install all requirements
pip install -r requirements.txt

# Development dependencies
pip install pytest black isort mypy flake8 bandit
```

#### Run Development Server
```bash
# Set environment variables
export ENVIRONMENT=development
export DEBUG=true
export LOG_LEVEL=debug

# Start server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## ⚙️ Configuration Guide

### Environment Variables Reference

#### Application Settings
```bash
# Basic Configuration
APP_NAME=\"Steganography API\"          # Application name
APP_VERSION=1.0.0                      # Version
ENVIRONMENT=development                 # development|staging|production
DEBUG=true                             # Enable debug mode
API_PREFIX=/api/v1                     # API URL prefix

# Server Settings
HOST=0.0.0.0                          # Server host
PORT=8000                             # Server port
WORKERS=4                             # Worker processes (production)
```

#### File Processing Settings
```bash
# File Upload Limits
MAX_FILE_SIZE=50                      # Maximum file size in MB
ALLOWED_EXTENSIONS=png,jpg,jpeg,bmp,tiff  # Supported formats
UPLOAD_DIR=uploads                    # Upload directory

# Request Configuration
REQUEST_TIMEOUT=300                   # Request timeout (seconds)
MAX_REQUEST_SIZE=52428800            # Maximum request size (bytes)
```

#### Security Configuration
```bash
# Authentication & Security
SECRET_KEY=your-256-bit-secret-key    # JWT secret key (REQUIRED)
ACCESS_TOKEN_EXPIRE_MINUTES=30       # Token expiration
ALGORITHM=HS256                      # JWT algorithm

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=*
```

#### Logging Configuration
```bash
# Logging Settings
LOG_LEVEL=info                       # debug|info|warning|error|critical
LOG_FORMAT=json                      # json|text
LOG_FILE=logs/app.log               # Log file path
```

#### External Services
```bash
# Redis (Optional)
REDIS_URL=redis://localhost:6379    # Redis connection
REDIS_PASSWORD=your-password         # Redis password
REDIS_DB=0                          # Database number

# Database (Optional)
DATABASE_URL=sqlite:///./app.db     # Database connection

# Monitoring
ENABLE_METRICS=true                 # Enable metrics collection
METRICS_PORT=9090                   # Metrics server port
```

### Docker Compose Configuration

#### Services Overview
```yaml
services:
  api:          # Main FastAPI application
    ports: [\"8000:8000\"]
    volumes: [\"./app:/app/app:ro\"]
    
  redis:        # Caching & sessions
    ports: [\"6379:6379\"]
    
  nginx:        # Reverse proxy (production)
    ports: [\"80:80\", \"443:443\"]
    profiles: [\"production\"]
```

#### Custom Configuration
```bash
# Create custom docker-compose override
cp docker-compose.yml docker-compose.override.yml

# Edit for your needs
nano docker-compose.override.yml
```

---

## 🔄 Development Workflow

### Daily Development

#### Start Development Environment
```bash
# Start services
docker-compose up -d

# Watch logs
docker-compose logs -f api

# API available at: http://localhost:8000/docs
```

#### Code Changes
```bash
# The API automatically reloads on code changes
# Edit files in app/ directory
nano app/main.py

# Check logs for reload confirmation
docker-compose logs -f api
```

#### Database Changes (if using)
```bash
# Run migrations
docker-compose exec api alembic upgrade head

# Create new migration
docker-compose exec api alembic revision --autogenerate -m \"description\"
```

### Testing Workflow

#### Unit Tests
```bash
# Run all tests
docker-compose exec api pytest -v

# Run specific test file
docker-compose exec api pytest tests/test_steganography.py -v

# Run with coverage
docker-compose exec api pytest --cov=app --cov-report=html
```

#### API Testing
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test with sample data
curl -X POST \"http://localhost:8000/api/v1/embed\" \\
  -H \"Content-Type: application/json\" \\
  -d @examples/embed_request.json
```

#### Load Testing
```bash
# Install artillery (if not using Docker)
npm install -g artillery

# Run load test
artillery run tests/load/api_load_test.yml

# Monitor performance
docker stats
```

### Code Quality

#### Format and Lint
```bash
# Format code
docker-compose exec api black app/
docker-compose exec api isort app/

# Type checking
docker-compose exec api mypy app/

# Linting
docker-compose exec api flake8 app/

# Security scan
docker-compose exec api bandit -r app/
```

#### Pre-commit Hooks (Optional)
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files
```

---

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] **Security**: Strong `SECRET_KEY`, proper CORS settings
- [ ] **Environment**: `ENVIRONMENT=production`, `DEBUG=false`
- [ ] **SSL**: Configure SSL certificates
- [ ] **Monitoring**: Set up logging and metrics collection
- [ ] **Backup**: Database backup strategy (if applicable)
- [ ] **Resources**: Adequate CPU/RAM allocation

### Option 1: Docker Compose Production

#### 1. Prepare Environment
```bash
# Create production directory
mkdir /opt/steganography-api
cd /opt/steganography-api

# Clone repository
git clone <repository-url> .

# Configure production environment
cp .env.example .env
nano .env
```

#### 2. Production Environment Variables
```bash
# Critical production settings
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-production-secret-key-256-bit

# Performance
WORKERS=4
MAX_FILE_SIZE=100
REQUEST_TIMEOUT=600

# Security
CORS_ORIGINS=https://your-frontend-domain.com
```

#### 3. SSL Configuration
```bash
# Create SSL directory
mkdir ssl

# Copy your SSL certificates
cp your-cert.crt ssl/
cp your-private-key.key ssl/

# Update nginx.conf with SSL settings
```

#### 4. Deploy
```bash
# Start production services
docker-compose --profile production up -d --build

# Verify deployment
curl -k https://localhost/health
```

### Option 2: Kubernetes Deployment

#### 1. Create Kubernetes Manifests
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: steganography-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: steganography-api
  template:
    metadata:
      labels:
        app: steganography-api
    spec:
      containers:
      - name: api
        image: steganography-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: ENVIRONMENT
          value: \"production\"
        resources:
          requests:
            memory: \"512Mi\"
            cpu: \"250m\"
          limits:
            memory: \"1Gi\"
            cpu: \"500m\"
```

#### 2. Deploy to Kubernetes
```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment
kubectl get pods -l app=steganography-api

# Check logs
kubectl logs -f deployment/steganography-api
```

### Option 3: Cloud Platform Deployment

#### AWS ECS
```bash
# Build and push to ECR
docker build -t steganography-api .
docker tag steganography-api:latest your-account.dkr.ecr.region.amazonaws.com/steganography-api:latest
docker push your-account.dkr.ecr.region.amazonaws.com/steganography-api:latest

# Deploy with ECS task definition
aws ecs update-service --cluster your-cluster --service steganography-api --force-new-deployment
```

#### Google Cloud Run
```bash
# Build and push to GCR
docker build -t gcr.io/your-project/steganography-api .
docker push gcr.io/your-project/steganography-api

# Deploy to Cloud Run
gcloud run deploy steganography-api \\
  --image gcr.io/your-project/steganography-api \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated
```

---

## ✅ Testing & Validation

### API Testing Examples

#### 1. Health Check
```bash
curl http://localhost:8000/health

# Expected Response:
{
  \"status\": \"healthy\",
  \"service\": \"Steganography API\",
  \"version\": \"1.0.0\",
  \"uptime\": 123.45
}
```

#### 2. Basic Embed Test
```bash
# Create test image (base64 encoded 1x1 PNG)
TEST_IMAGE=\"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==\"

curl -X POST \"http://localhost:8000/api/v1/embed\" \\
  -H \"Content-Type: application/json\" \\
  -d \"{
    \\\"cover_image\\\": {
      \\\"data\\\": \\\"$TEST_IMAGE\\\",
      \\\"filename\\\": \\\"test.png\\\"
    },
    \\\"secret_data\\\": {
      \\\"content\\\": \\\"Hello World!\\\",
      \\\"is_binary\\\": false
    },
    \\\"parameters\\\": {
      \\\"algorithm\\\": \\\"lsb\\\"
    }
  }\"
```

#### 3. Batch Processing Test
```bash
curl -X POST \"http://localhost:8000/api/v1/batch/embed\" \\
  -H \"Content-Type: application/json\" \\
  -d \"{
    \\\"items\\\": [
      {
        \\\"id\\\": \\\"test1\\\",
        \\\"cover_image\\\": {\\\"data\\\": \\\"$TEST_IMAGE\\\", \\\"filename\\\": \\\"test1.png\\\"},
        \\\"secret_data\\\": {\\\"content\\\": \\\"Secret 1\\\", \\\"is_binary\\\": false}
      },
      {
        \\\"id\\\": \\\"test2\\\",
        \\\"cover_image\\\": {\\\"data\\\": \\\"$TEST_IMAGE\\\", \\\"filename\\\": \\\"test2.png\\\"},
        \\\"secret_data\\\": {\\\"content\\\": \\\"Secret 2\\\", \\\"is_binary\\\": false}
      }
    ]
  }\"
```

### Performance Testing

#### Load Test Configuration
```yaml
# tests/load/api_load_test.yml
config:
  target: 'http://localhost:8000'
  phases:
    - duration: 60
      arrivalRate: 5
    - duration: 120
      arrivalRate: 10
    - duration: 60
      arrivalRate: 20

scenarios:
  - name: \"Health check\"
    weight: 50
    flow:
      - get:
          url: \"/health\"
  
  - name: \"Basic embed\"
    weight: 30
    flow:
      - post:
          url: \"/api/v1/embed\"
          json:
            cover_image:
              data: \"{{ test_image_base64 }}\"
            secret_data:
              content: \"Test message\"
              is_binary: false

  - name: \"Complexity analysis\"
    weight: 20
    flow:
      - post:
          url: \"/api/v1/analysis/complexity\"
          json:
            image:
              data: \"{{ test_image_base64 }}\"
```

#### Run Load Tests
```bash
# Install artillery
npm install -g artillery

# Run test
artillery run tests/load/api_load_test.yml

# Generate report
artillery run tests/load/api_load_test.yml --output report.json
artillery report report.json
```

### Integration Testing

#### Python Test Suite
```python
# tests/test_integration.py
import pytest
import requests
import base64
from PIL import Image
import io

@pytest.fixture
def api_client():
    return \"http://localhost:8000\"

@pytest.fixture
def test_image_base64():
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='white')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode()

def test_embed_extract_cycle(api_client, test_image_base64):
    # Test complete embed -> extract cycle
    
    # 1. Embed data
    embed_response = requests.post(f\"{api_client}/api/v1/embed\", json={
        \"cover_image\": {
            \"data\": test_image_base64,
            \"filename\": \"test.png\"
        },
        \"secret_data\": {
            \"content\": \"Integration test message\",
            \"is_binary\": False
        },
        \"parameters\": {
            \"algorithm\": \"lsb\"
        }
    })
    
    assert embed_response.status_code == 200
    embed_data = embed_response.json()
    assert embed_data[\"success\"] is True
    
    stego_image = embed_data[\"stego_image\"]
    
    # 2. Extract data
    extract_response = requests.post(f\"{api_client}/api/v1/extract\", json={
        \"stego_image\": {
            \"data\": stego_image,
            \"filename\": \"stego.png\"
        },
        \"parameters\": {
            \"algorithm\": \"lsb\"
        }
    })
    
    assert extract_response.status_code == 200
    extract_data = extract_response.json()
    assert extract_data[\"success\"] is True
    
    # 3. Verify extracted content
    extracted_content = extract_data[\"extracted_data\"][\"content\"]
    assert extracted_content == \"Integration test message\"

def test_batch_processing(api_client, test_image_base64):
    response = requests.post(f\"{api_client}/api/v1/batch/embed\", json={
        \"items\": [
            {
                \"id\": \"batch_test_1\",
                \"cover_image\": {\"data\": test_image_base64},
                \"secret_data\": {\"content\": \"Batch message 1\", \"is_binary\": False}
            },
            {
                \"id\": \"batch_test_2\",
                \"cover_image\": {\"data\": test_image_base64},
                \"secret_data\": {\"content\": \"Batch message 2\", \"is_binary\": False}
            }
        ]
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data[\"success\"] is True
    assert len(data[\"results\"]) == 2
    assert data[\"summary\"][\"successful_items\"] == 2
```

#### Run Integration Tests
```bash
# Install test dependencies
pip install pytest requests pillow

# Run tests
pytest tests/test_integration.py -v

# Run with coverage
pytest tests/test_integration.py --cov=app --cov-report=html
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Container Won't Start

**Issue**: `docker-compose up` fails or containers crash

**Diagnosis**:
```bash
# Check container logs
docker-compose logs api

# Check container status
docker-compose ps

# Check system resources
docker stats
```

**Solutions**:
```bash
# Clean Docker cache
docker system prune -f

# Rebuild containers
docker-compose down
docker-compose up --build --force-recreate

# Check disk space
df -h

# Check memory usage
free -h
```

#### 2. API Returns 500 Errors

**Issue**: Internal server errors in API responses

**Diagnosis**:
```bash
# Check API logs
docker-compose logs -f api

# Check error patterns
docker-compose logs api | grep \"ERROR\"

# Test with curl
curl -v http://localhost:8000/health
```

**Solutions**:
```bash
# Restart API service
docker-compose restart api

# Check environment variables
docker-compose exec api env | grep -E \"(SECRET_KEY|DEBUG|ENVIRONMENT)\"

# Validate configuration
docker-compose exec api python -c \"from app.config.settings import settings; print(settings.dict())\"
```

#### 3. High Memory Usage

**Issue**: Containers consuming too much memory

**Diagnosis**:
```bash
# Monitor resource usage
docker stats

# Check memory limits
docker-compose exec api cat /sys/fs/cgroup/memory/memory.limit_in_bytes

# Profile memory usage
docker-compose exec api python -c \"
import psutil
print(f'Memory: {psutil.virtual_memory().percent}%')
print(f'CPU: {psutil.cpu_percent()}%')
\"
```

**Solutions**:
```bash
# Add memory limits to docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

# Reduce file size limits in .env
MAX_FILE_SIZE=25
REQUEST_TIMEOUT=180

# Scale down workers
WORKERS=2
```

#### 4. Request Timeouts

**Issue**: API requests timing out

**Diagnosis**:
```bash
# Check processing times in logs
docker-compose logs api | grep \"duration\"

# Test with different request sizes
curl -X POST \"http://localhost:8000/api/v1/embed\" \\
  -H \"Content-Type: application/json\" \\
  -d '{\"small_request\": true}' \\
  --max-time 30
```

**Solutions**:
```bash
# Increase timeout settings
REQUEST_TIMEOUT=600
MAX_REQUEST_SIZE=104857600  # 100MB

# Optimize algorithms
{\"parameters\": {\"algorithm\": \"lsb\", \"quality\": 80}}

# Use batch processing for multiple images
POST /api/v1/batch/embed
```

#### 5. SSL/HTTPS Issues

**Issue**: SSL certificate or HTTPS problems

**Diagnosis**:
```bash
# Test SSL connection
openssl s_client -connect localhost:443

# Check certificate validity
openssl x509 -in ssl/cert.crt -text -noout

# Check Nginx configuration
docker-compose exec nginx nginx -t
```

**Solutions**:
```bash
# Generate self-signed certificate (development)
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes

# Update Nginx configuration
# Edit nginx.conf with proper SSL settings

# Restart Nginx
docker-compose restart nginx
```

#### 6. Database Connection Issues

**Issue**: Database connectivity problems

**Diagnosis**:
```bash
# Check database connection
docker-compose exec api python -c \"
from app.config.settings import settings
print(f'Database URL: {settings.database_url}')
\"

# Test database connectivity
docker-compose exec api python -c \"
import sqlite3
conn = sqlite3.connect('steganography.db')
print('Database connected successfully')
conn.close()
\"
```

**Solutions**:
```bash
# Reset database
docker-compose exec api rm -f steganography.db

# Run migrations
docker-compose exec api alembic upgrade head

# Check database permissions
docker-compose exec api ls -la steganography.db
```

### Debug Mode

#### Enable Comprehensive Debugging
```bash
# Set debug environment variables
export DEBUG=true
export LOG_LEVEL=debug
export ENVIRONMENT=development

# Restart services
docker-compose restart api

# Monitor debug logs
docker-compose logs -f api | grep DEBUG
```

#### Debug Configuration
```python
# In .env file
DEBUG=true
LOG_LEVEL=debug
LOG_FORMAT=text  # More readable for debugging

# In docker-compose.yml
services:
  api:
    environment:
      - DEBUG=true
      - LOG_LEVEL=debug
    volumes:
      - ./app:/app/app  # Enable hot reloading
```

### Performance Monitoring

#### System Monitoring
```bash
# Real-time resource monitoring
watch docker stats

# Detailed container inspection
docker-compose exec api top
docker-compose exec api iostat -x 1

# Network monitoring
docker-compose exec api netstat -tulnp
```

#### Application Monitoring
```bash
# API performance metrics
curl http://localhost:8000/metrics

# Request tracing
docker-compose logs api | grep \"request_id\" | tail -20

# Error rate monitoring
docker-compose logs api | grep \"ERROR\" | wc -l
```

---

## 📞 Support & Resources

### Getting Help

1. **Check Logs**: Always start with `docker-compose logs -f api`
2. **Health Check**: Verify with `curl http://localhost:8000/health`
3. **Documentation**: Visit `http://localhost:8000/docs`
4. **GitHub Issues**: Report bugs or request features
5. **Community**: Join our Discord/Slack for real-time help

### Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Docker Documentation**: https://docs.docker.com/
- **Steganography Theory**: Academic papers and tutorials
- **Security Best Practices**: OWASP guidelines

---

**🎉 Congratulations! You now have a complete steganography API running in production.**

Remember to:
- ✅ Keep your `SECRET_KEY` secure
- ✅ Regularly update dependencies
- ✅ Monitor system resources
- ✅ Backup important data
- ✅ Review security logs

Happy coding! 🚀
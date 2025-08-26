# 🔐 FastAPI Steganography Backend

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg?style=flat&logo=FastAPI)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab.svg?style=flat&logo=python)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg?style=flat&logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **Comprehensive FastAPI backend for advanced steganography operations with security, performance monitoring, and production-ready deployment.**

## 🚀 **Overview**

A robust, scalable REST API service for steganography operations built with FastAPI. Features multiple algorithms, security layers, batch processing, complexity analysis, and comprehensive monitoring.

### ✨ **Key Features**

- 🎯 **Multiple Algorithms**: LSB, Enhanced LSB, DCT, DWT, PVD, Edge-Adaptive
- 🔐 **Security**: AES/Fernet encryption, data compression, integrity verification
- 📊 **Analytics**: PSNR, SSIM, complexity maps, quality metrics
- 🚀 **Performance**: Async processing, batch operations, caching
- 🛡️ **Production Ready**: Docker, monitoring, rate limiting, security headers
- 📝 **Documentation**: OpenAPI/Swagger, comprehensive logging

---

## 📋 **Table of Contents**

- [Quick Start](#-quick-start)
- [API Endpoints](#-api-endpoints)
- [Algorithm Overview](#-algorithm-overview)
- [Configuration](#-configuration)
- [Development Setup](#-development-setup)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Monitoring](#-monitoring)
- [Security](#-security)
- [Contributing](#-contributing)

---

## 🏃‍♂️ **Quick Start**

### Prerequisites

- **Docker & Docker Compose** (Recommended)
- **Python 3.11+** (For local development)

### 1. Clone & Setup

```bash
git clone <repository-url>
cd data-hiding/api
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration (optional for development)
nano .env
```

### 3. Start with Docker (Recommended)

```bash
# Development mode
docker-compose up --build

# Production mode with Nginx
docker-compose --profile production up -d
```

### 4. Access the API

- **API Base URL**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## 🎯 **API Endpoints**

### Core Operations

| Method | Endpoint | Description | Features |
|--------|----------|-------------|----------|
| `POST` | `/api/v1/embed` | Embed secret data into images | Encryption, compression, quality metrics |
| `POST` | `/api/v1/extract` | Extract hidden data from images | Integrity verification, auto-detection |
| `POST` | `/api/v1/batch/embed` | Batch embedding operations | Parallel processing, progress tracking |
| `POST` | `/api/v1/analysis/complexity` | Image complexity analysis | Complexity maps, algorithm recommendations |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health check |
| `GET` | `/` | API information and links |

---

## 🔬 **Algorithm Overview**

### Supported Algorithms

| Algorithm | Description | Use Case | Quality | Security |
|-----------|-------------|----------|---------|----------|
| **LSB** | Least Significant Bit | General purpose, fast | High | Medium |
| **LSB Enhanced** | LSB with error correction | Critical data, reliability | High | High |
| **DCT** | Discrete Cosine Transform | JPEG images, robustness | Medium | High |
| **DWT** | Discrete Wavelet Transform | Complex images, scalability | High | High |
| **PVD** | Pixel Value Differencing | Natural images, adaptive | Medium | High |
| **Edge Adaptive** | Edge-based embedding | Textured images, security | High | Very High |

### Algorithm Selection Guide

```python
# Simple text data
{\"algorithm\": \"lsb\", \"quality\": 90}

# Critical binary files
{\"algorithm\": \"lsb_enhanced\", \"quality\": 95}

# JPEG images
{\"algorithm\": \"dct\", \"dct_quality\": 85}

# Complex natural images
{\"algorithm\": \"edge_adaptive\", \"edge_threshold\": 0.1}
```

---

## ⚙️ **Configuration**

### Environment Variables

```bash
# Application Settings
APP_NAME=\"Steganography API\"
ENVIRONMENT=development
DEBUG=true
API_PREFIX=/api/v1

# Server Configuration
HOST=0.0.0.0
PORT=8000
WORKERS=4

# File Processing
MAX_FILE_SIZE=50          # MB
REQUEST_TIMEOUT=300       # seconds
ALLOWED_EXTENSIONS=png,jpg,jpeg,bmp,tiff

# Security
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE=logs/app.log

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Optional: Database
DATABASE_URL=sqlite:///./steganography.db
```

### Docker Compose Services

```yaml
services:
  api:          # Main FastAPI application
  redis:        # Caching and session storage
  nginx:        # Reverse proxy (production profile)
```

---

## 🛠️ **Development Setup**

### Local Development (Without Docker)

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\\Scripts\\activate    # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set environment variables
export ENVIRONMENT=development
export DEBUG=true

# 4. Run development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Development with Docker

```bash
# Start development environment
docker-compose up --build

# View logs
docker-compose logs -f api

# Shell into container
docker-compose exec api bash

# Run tests
docker-compose exec api pytest
```

### Code Structure

```
api/
├── app/
│   ├── main.py                    # FastAPI application
│   ├── config/
│   │   └── settings.py           # Configuration management
│   ├── core/
│   │   ├── exceptions.py         # Custom exceptions
│   │   ├── logging.py            # Logging configuration
│   │   └── middleware.py         # Custom middleware
│   ├── models/
│   │   ├── requests.py           # Pydantic request models
│   │   └── responses.py          # Pydantic response models
│   ├── services/
│   │   ├── steganography.py      # Core steganography service
│   │   ├── image_processing.py   # Image processing utilities
│   │   └── analysis.py           # Complexity analysis
│   ├── api/
│   │   └── v1/
│   │       ├── router.py         # API router
│   │       └── endpoints/        # Endpoint implementations
│   └── utils/
│       ├── validation.py         # Input validation utilities
│       └── helpers.py            # Helper functions
├── logs/                          # Application logs
├── uploads/                       # File uploads (development)
├── Dockerfile                     # Production container
├── docker-compose.yml            # Development environment
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

---

## 🚢 **Deployment**

### Production Docker Deployment

```bash
# 1. Clone repository
git clone <repository-url>
cd data-hiding/api

# 2. Configure production environment
cp .env.example .env
nano .env  # Set production values

# 3. Build and start production services
docker-compose --profile production up -d --build

# 4. Verify deployment
curl http://localhost/health
```

### Production Checklist

- [ ] Set strong `SECRET_KEY`
- [ ] Configure `CORS_ORIGINS` for your frontend
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure SSL certificates for Nginx
- [ ] Set up monitoring and log aggregation
- [ ] Configure backup strategies
- [ ] Set resource limits in docker-compose

### Scaling

```bash
# Scale API workers
docker-compose up --scale api=3

# Monitor resources
docker stats

# Update configuration
docker-compose exec api kill -HUP 1
```

---

## 📚 **API Documentation**

### Example Requests

#### 1. Embed Secret Data

```bash
curl -X POST \"http://localhost:8000/api/v1/embed\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"cover_image\": {
      \"data\": \"<base64-encoded-image>\",
      \"filename\": \"cover.png\"
    },
    \"secret_data\": {
      \"content\": \"Hello, World!\",
      \"is_binary\": false,
      \"compression\": \"gzip\",
      \"encryption\": \"fernet\",
      \"password\": \"secretpassword\"
    },
    \"parameters\": {
      \"algorithm\": \"lsb\",
      \"quality\": 95,
      \"randomize\": true
    },
    \"include_metrics\": true,
    \"include_maps\": false
  }'
```

#### 2. Extract Hidden Data

```bash
curl -X POST \"http://localhost:8000/api/v1/extract\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"stego_image\": {
      \"data\": \"<base64-encoded-stego-image>\",
      \"filename\": \"stego.png\"
    },
    \"parameters\": {
      \"algorithm\": \"lsb\",
      \"password\": \"secretpassword\",
      \"verify_integrity\": true
    }
  }'
```

#### 3. Batch Processing

```bash
curl -X POST \"http://localhost:8000/api/v1/batch/embed\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"items\": [
      {
        \"id\": \"item1\",
        \"cover_image\": {\"data\": \"<base64>\", \"filename\": \"img1.png\"},
        \"secret_data\": {\"content\": \"Data 1\", \"is_binary\": false}
      },
      {
        \"id\": \"item2\",
        \"cover_image\": {\"data\": \"<base64>\", \"filename\": \"img2.png\"},
        \"secret_data\": {\"content\": \"Data 2\", \"is_binary\": false}
      }
    ],
    \"config\": {
      \"parallel_processing\": true,
      \"max_workers\": 4,
      \"fail_fast\": false
    }
  }'
```

#### 4. Complexity Analysis

```bash
curl -X POST \"http://localhost:8000/api/v1/analysis/complexity\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"image\": {
      \"data\": \"<base64-encoded-image>\",
      \"filename\": \"analysis.png\"
    },
    \"analysis_types\": [\"entropy\", \"gradient\", \"texture\", \"edges\"],
    \"generate_maps\": true,
    \"include_statistics\": true
  }'
```

### Response Formats

#### Success Response Example

```json
{
  \"success\": true,
  \"message\": \"Embedding completed successfully\",
  \"request_id\": \"req_123456789\",
  \"timestamp\": \"2024-01-01T12:00:00Z\",
  \"processing_time\": 2.45,
  \"stego_image\": \"<base64-encoded-result>\",
  \"metrics\": {
    \"original_size\": 1048576,
    \"stego_size\": 1048580,
    \"payload_size\": 1024,
    \"capacity_used\": 12.5,
    \"quality_score\": 98.2,
    \"psnr\": 52.3,
    \"ssim\": 0.998
  },
  \"algorithm_used\": \"lsb\",
  \"parameters_used\": {
    \"algorithm\": \"lsb\",
    \"quality\": 95,
    \"lsb_bits\": 1
  }
}
```

#### Error Response Example

```json
{
  \"error\": true,
  \"error_code\": \"PAYLOAD_TOO_LARGE\",
  \"error_type\": \"PayloadTooLargeError\",
  \"message\": \"Payload size (2048 bytes) exceeds image capacity (1024 bytes)\",
  \"request_id\": \"req_123456789\",
  \"timestamp\": \"2024-01-01T12:00:00Z\",
  \"details\": {
    \"payload_size\": 2048,
    \"capacity\": 1024,
    \"algorithm\": \"lsb\"
  },
  \"suggestions\": [
    \"Use a larger cover image\",
    \"Enable compression to reduce payload size\",
    \"Try a different algorithm with higher capacity\"
  ]
}
```

---

## 🧪 **Testing**

### Running Tests

```bash
# With Docker
docker-compose exec api pytest -v

# Local development
pytest -v

# With coverage
pytest --cov=app --cov-report=html

# Specific test categories
pytest -m \"unit\"      # Unit tests
pytest -m \"integration\" # Integration tests
pytest -m \"e2e\"        # End-to-end tests
```

### Test Categories

```python
# Unit tests - Fast, isolated
def test_lsb_algorithm():
    service = SteganographyService()
    result = service._lsb_embed(image, data, params)
    assert result is not None

# Integration tests - Service interactions
def test_embed_extract_cycle():
    # Test complete embed -> extract cycle
    pass

# End-to-end tests - Full API tests
def test_embed_endpoint():
    response = client.post(\"/api/v1/embed\", json=request_data)
    assert response.status_code == 200
```

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run loadtest.yml

# Monitor performance
docker stats
```

---

## 📊 **Monitoring**

### Health Checks

```bash
# Basic health check
curl http://localhost:8000/health

# Detailed system info
curl http://localhost:8000/ | jq
```

### Metrics Collection

```python
# Application metrics (built-in)
GET /metrics  # Prometheus format

# Custom metrics in logs
{
  \"timestamp\": \"2024-01-01T12:00:00Z\",
  \"level\": \"INFO\",
  \"request_id\": \"req_123\",
  \"duration\": 2.45,
  \"algorithm\": \"lsb\",
  \"payload_size\": 1024,
  \"quality_score\": 98.2
}
```

### Log Analysis

```bash
# View real-time logs
docker-compose logs -f api

# Filter by request ID
docker-compose logs api | grep \"req_123456789\"

# Error logs only
docker-compose logs api | grep \"ERROR\"

# Performance logs
docker-compose logs api | grep \"slow_request\"
```

### Monitoring Stack (Optional)

```yaml
# Add to docker-compose.yml
services:
  prometheus:     # Metrics collection
  grafana:        # Visualization
  elasticsearch:  # Log aggregation
  kibana:         # Log visualization
```

---

## 🛡️ **Security**

### Security Features

- **Input Validation**: Pydantic models with strict validation
- **Rate Limiting**: Per-IP request throttling
- **Security Headers**: CORS, XSS protection, content type validation
- **File Safety**: Extension whitelist, size limits, malware scanning
- **Encryption**: AES/Fernet encryption for sensitive data
- **Logging**: Security events and suspicious activity tracking

### Security Best Practices

```python
# Strong passwords
SECRET_KEY = \"your-256-bit-secret-key\"

# CORS configuration
CORS_ORIGINS = [\"https://your-frontend-domain.com\"]

# File upload limits
MAX_FILE_SIZE = 50  # MB
ALLOWED_EXTENSIONS = [\"png\", \"jpg\", \"jpeg\"]

# Rate limiting
MAX_REQUESTS_PER_MINUTE = 60
MAX_REQUESTS_PER_HOUR = 1000
```

### Security Checklist

- [ ] Change default `SECRET_KEY`
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS with SSL certificates
- [ ] Enable security headers
- [ ] Configure rate limiting
- [ ] Set file upload restrictions
- [ ] Monitor security logs
- [ ] Regular dependency updates

---

## 🔧 **Troubleshooting**

### Common Issues

#### 1. Container Won't Start

```bash
# Check logs
docker-compose logs api

# Common fixes
docker-compose down
docker system prune -f
docker-compose up --build
```

#### 2. High Memory Usage

```bash
# Monitor resources
docker stats

# Adjust settings in .env
MAX_FILE_SIZE=25
WORKERS=2
```

#### 3. Request Timeout

```bash
# Increase timeout in .env
REQUEST_TIMEOUT=600

# Check processing logs
docker-compose logs api | grep \"duration\"
```

#### 4. Quality Issues

```python
# Adjust algorithm parameters
{
    \"algorithm\": \"lsb_enhanced\",  # Better quality
    \"quality\": 98,                 # Higher quality
    \"lsb_bits\": 1                 # Fewer bits = better quality
}
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true
export LOG_LEVEL=debug

# Restart service
docker-compose restart api
```

---

## 🤝 **Contributing**

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes and test**: `pytest -v`
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open Pull Request**

### Code Standards

```bash
# Format code
black app/
isort app/

# Type checking
mypy app/

# Linting
flake8 app/

# Security scan
bandit -r app/
```

### Adding New Algorithms

```python
# 1. Add algorithm enum
class AlgorithmType(str, Enum):
    NEW_ALGORITHM = \"new_algorithm\"

# 2. Implement methods
def _new_algorithm_embed(self, image, data, params):
    # Implementation here
    pass

def _new_algorithm_extract(self, image, params):
    # Implementation here
    pass

# 3. Register in service
self.algorithms[AlgorithmType.NEW_ALGORITHM] = self._new_algorithm_embed
```

---
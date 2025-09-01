#!/usr/bin/env python3
"""
Simple start script for academic backend without environment conflicts.
"""

import os
import sys
import uvicorn

# Clear problematic environment variables
env_vars_to_clear = [
    'environment', 'host', 'port', 'workers', 'log_level', 'log_format', 'log_file',
    'max_file_size', 'allowed_extensions', 'upload_dir', 'request_timeout', 'max_request_size',
    'cors_methods', 'cors_headers', 'secret_key', 'access_token_expire_minutes', 'algorithm',
    'redis_url', 'redis_password', 'redis_db', 'database_url', 'external_api_key', 
    'external_api_url', 'enable_metrics', 'metrics_port'
]

for var in env_vars_to_clear:
    if var in os.environ:
        del os.environ[var]

# Add current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

if __name__ == "__main__":
    print("🚀 Starting Academic Steganography Backend...")
    print("📚 Đồ án môn học: Data Hiding với Adaptive LSB Steganography")
    print("🔬 Algorithm: Sobel Edge Detection + Adaptive LSB")
    print("🌐 Server: http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs")
    print("❤️  Health Check: http://localhost:8000/health")
    print("-" * 60)
    
    try:
        # Import and run
        from app.main_simple import app
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            reload=False,  # Disable reload to avoid environment issues
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Backend stopped by user")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        print("\n💡 Debug info:")
        print(f"   Python path: {sys.path[0]}")
        print(f"   Working directory: {os.getcwd()}")
        print(f"   Script location: {current_dir}")
        sys.exit(1)

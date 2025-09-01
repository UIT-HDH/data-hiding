#!/usr/bin/env python3
"""
Run script for Academic Steganography Backend

Đồ án môn học: Data Hiding với Adaptive LSB Steganography
"""

import uvicorn
import sys
import os

# Add app directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starting Academic Steganography Backend...")
    print("📚 Đồ án môn học: Data Hiding với Adaptive LSB Steganography")
    print("🔬 Algorithm: Sobel Edge Detection + Adaptive LSB")
    print("🌐 Server: http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs")
    print("❤️  Health Check: http://localhost:8000/health")
    print("-" * 60)
    
    try:
        uvicorn.run(
            "app.main_simple:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Backend stopped by user")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        sys.exit(1)

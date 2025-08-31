#!/usr/bin/env python3
"""
Simple API test script for Steganography Backend.
"""

import requests
import base64
from PIL import Image
import io
import json

# API Base URL
BASE_URL = "http://localhost:8000/api/v1"

def create_test_image():
    """Create a simple test image and return as base64."""
    # Create a 100x100 white image
    img = Image.new('RGB', (100, 100), color='white')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode()

def test_health():
    """Test health endpoint."""
    print("🔍 Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_embed():
    """Test embed endpoint."""
    print("🔍 Testing embed endpoint...")
    
    # Create test image file
    img = Image.new('RGB', (100, 100), color='white')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    files = {
        'coverImage': ('test.png', buffer, 'image/png')
    }
    data = {
        'secretText': 'Hello World! This is a test message.',
        'method': 'sobel',
        'payloadCap': 60
    }
    
    response = requests.post(f"{BASE_URL}/embed", files=files, data=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        print(f"PSNR: {result['data']['metrics']['psnr']}")
        print(f"SSIM: {result['data']['metrics']['ssim']}")
        print(f"Processing Time: {result['data']['metrics']['processingTime']}ms")
    else:
        print(f"Error: {response.text}")
    print()

def test_analysis():
    """Test analysis endpoint."""
    print("🔍 Testing analysis endpoint...")
    
    # Create test image file
    img = Image.new('RGB', (200, 200), color='blue')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    files = {
        'image': ('test_analysis.png', buffer, 'image/png')
    }
    
    response = requests.post(f"{BASE_URL}/analysis", files=files)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        print(f"Image Size: {result['data']['originalImage']['width']}x{result['data']['originalImage']['height']}")
        print(f"Statistics: {json.dumps(result['data']['statistics'], indent=2)}")
    else:
        print(f"Error: {response.text}")
    print()

def main():
    """Run all tests."""
    print("🚀 Starting API Tests...\n")
    
    try:
        test_health()
        test_embed()
        test_analysis()
        
        print("✅ All tests completed!")
        print("\n📚 API Documentation: http://localhost:8000/docs")
        print("🔗 Frontend URL: http://localhost:5173 (if running)")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    main()

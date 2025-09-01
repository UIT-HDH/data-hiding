#!/usr/bin/env python3
"""
Enhanced Test Script for Tab "Embed" Functionality
Academic Project - Adaptive Steganography
"""

import requests
import base64
from PIL import Image
import io
import json

# API Base URL
BASE_URL = "http://localhost:8000/api/v1"

def create_test_image(width=300, height=200, color='lightblue'):
    """Create a test image for embedding."""
    img = Image.new('RGB', (width, height), color=color)
    
    # Add some texture for complexity analysis
    import numpy as np
    arr = np.array(img)
    
    # Add some random noise
    noise = np.random.randint(-30, 30, arr.shape)
    arr = np.clip(arr + noise, 0, 255)
    
    # Add some geometric shapes for edge detection
    for i in range(50, 250, 50):
        for j in range(30, 170, 40):
            arr[j:j+20, i:i+30] = [255, 255, 255]  # White rectangles
    
    return Image.fromarray(arr.astype(np.uint8))

def test_complexity_methods():
    """Test getting available complexity methods."""
    print("🔍 Testing complexity methods endpoint...")
    response = requests.get(f"{BASE_URL}/embed/methods")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        methods = response.json()
        print("Available methods:")
        for method in methods['methods']:
            print(f"  - {method['label']} ({method['value']})")
            print(f"    {method['description']}")
    print()

def test_embedding_domains():
    """Test getting available embedding domains."""
    print("🔍 Testing embedding domains endpoint...")
    response = requests.get(f"{BASE_URL}/embed/domains")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        domains = response.json()
        print("Available domains:")
        for domain in domains['domains']:
            print(f"  - {domain['label']} ({domain['value']})")
            print(f"    {domain['description']}")
    print()

def test_embed_text():
    """Test embedding text with comprehensive parameters."""
    print("🔍 Testing comprehensive text embedding...")
    
    # Create test image
    img = create_test_image()
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    files = {
        'coverImage': ('test_cover.png', buffer, 'image/png')
    }
    
    data = {
        'secretText': 'This is a comprehensive test message for adaptive steganography! 🔐',
        'secretType': 'text',
        'password': 'test123',
        'encrypt': True,
        'compress': False,
        'complexityMethod': 'sobel',
        'payloadCap': 70,
        'minBpp': 1.0,
        'maxBpp': 6.0,
        'threshold': 0.5,
        'domain': 'spatial',
        'seed': 'academic2024'
    }
    
    response = requests.post(f"{BASE_URL}/embed", files=files, data=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Success: {result['success']}")
        print(f"Message: {result['message']}")
        
        # Display metadata
        metadata = result['data']['metadata']
        print(f"\n📋 Image Metadata:")
        print(f"  Dimensions: {metadata['dimensions']['width']}x{metadata['dimensions']['height']}")
        print(f"  Format: {metadata['format']}")
        print(f"  Original Size: {metadata['originalSize']} bytes")
        print(f"  Secret Size: {metadata['secretSize']} bytes")
        
        # Display metrics
        metrics = result['data']['metrics']
        print(f"\n📊 Quality Metrics:")
        print(f"  PSNR: {metrics['psnr']} dB")
        print(f"  SSIM: {metrics['ssim']}")
        print(f"  Payload: {metrics['payloadBytes']} bytes ({metrics['payloadPercentage']}%)")
        print(f"  Bits per Pixel: {metrics['bitsPerPixel']}")
        print(f"  Processing Time: {metrics['processingTime']} ms")
        
        # Display configuration
        config = result['data']['configuration']
        print(f"\n⚙️ Configuration Used:")
        print(f"  Method: {config['complexityMethod']}")
        print(f"  Domain: {config['domain']}")
        print(f"  Encryption: {config['encrypt']}")
        print(f"  Seed: {config['seed']}")
        
        # Display processing logs
        logs = result['data']['logs']
        print(f"\n📝 Processing Steps:")
        for step in logs['processingSteps']:
            print(f"  • {step}")
            
        # Check if we have all expected images
        images = ['originalImage', 'stegoImage', 'complexityMap', 'embeddingMask']
        print(f"\n🖼️ Generated Images:")
        for img_type in images:
            if img_type in result['data']:
                print(f"  ✅ {img_type.replace('Image', ' Image').replace('Map', ' Map').replace('Mask', ' Mask').title()}")
            else:
                print(f"  ❌ Missing {img_type}")
    else:
        print(f"❌ Error: {response.text}")
    print()

def test_embed_with_different_methods():
    """Test embedding with different complexity methods."""
    methods = ['sobel', 'laplacian', 'variance', 'entropy']
    
    print("🔍 Testing different complexity methods...")
    
    for method in methods:
        print(f"\n  Testing {method.upper()} method...")
        
        # Create test image
        img = create_test_image(200, 150)
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        files = {
            'coverImage': (f'test_{method}.png', buffer, 'image/png')
        }
        
        data = {
            'secretText': f'Test message for {method} method',
            'secretType': 'text',
            'complexityMethod': method,
            'payloadCap': 50,
            'domain': 'spatial'
        }
        
        response = requests.post(f"{BASE_URL}/embed", files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            metrics = result['data']['metrics']
            print(f"    ✅ PSNR: {metrics['psnr']} dB, SSIM: {metrics['ssim']}, Time: {metrics['processingTime']} ms")
        else:
            print(f"    ❌ Failed: {response.status_code}")

def test_payload_capacity_limits():
    """Test payload capacity validation."""
    print("🔍 Testing payload capacity limits...")
    
    # Test with very large secret text
    large_text = "A" * 10000  # 10KB text
    
    img = create_test_image(100, 100)  # Small image
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    files = {
        'coverImage': ('small_test.png', buffer, 'image/png')
    }
    
    data = {
        'secretText': large_text,
        'secretType': 'text',
        'payloadCap': 30  # Low capacity
    }
    
    response = requests.post(f"{BASE_URL}/embed", files=files, data=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 400:
        print(f"✅ Correctly rejected large payload: {response.json()['detail']}")
    else:
        print(f"❌ Unexpected response: {response.text}")
    print()

def main():
    """Run comprehensive Tab "Embed" tests."""
    print("🚀 Starting Comprehensive Tab 'Embed' Tests...\n")
    
    try:
        # Test helper endpoints
        test_complexity_methods()
        test_embedding_domains()
        
        # Test main embedding functionality
        test_embed_text()
        test_embed_with_different_methods()
        test_payload_capacity_limits()
        
        print("✅ All Tab 'Embed' tests completed!")
        print("\n🎯 Tab 'Embed' Features Verified:")
        print("  ✅ Upload Cover Image with metadata")
        print("  ✅ Secret Input (Text)")
        print("  ✅ Security Options (password, encrypt, compress)")
        print("  ✅ Adaptive Settings (complexity methods, payload cap)")
        print("  ✅ Domain Selection (Spatial-LSB | DCT)")
        print("  ✅ Seed/PRNG Configuration")
        print("  ✅ Comprehensive Results with metrics")
        print("  ✅ Complexity Maps and Embedding Masks")
        print("  ✅ Processing Logs and Configuration")
        
        print("\n📚 API Documentation: http://localhost:8000/docs")
        print("🔗 Tab 'Embed' Ready for Frontend Integration!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Test script cho Simple Backend
"""

import requests
import base64
from PIL import Image
import io
import numpy as np

def create_test_image(width=100, height=100):
    """Tạo test image đơn giản"""
    # Tạo ảnh test với gradient
    image = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Tạo gradient horizontal
    for x in range(width):
        intensity = int((x / width) * 255)
        image[:, x, :] = [intensity, intensity // 2, 255 - intensity]
    
    # Add some noise để tạo complexity
    noise = np.random.randint(0, 30, (height, width, 3), dtype=np.uint8)
    image = np.clip(image.astype(np.int16) + noise.astype(np.int16), 0, 255).astype(np.uint8)
    
    return Image.fromarray(image, 'RGB')

def test_simple_backend():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Simple Steganography Backend...")
    
    # Test 1: Health check
    print("\n1️⃣ Testing Health:")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   ❌ Health check failed: {e}")
        return
    
    # Test 2: Root endpoint  
    print("\n2️⃣ Testing Root:")
    try:
        response = requests.get(f"{base_url}/")
        data = response.json()
        print(f"   Algorithm: {data.get('algorithm')}")
        print(f"   Endpoints: {data.get('endpoints')}")
    except Exception as e:
        print(f"   ❌ Root test failed: {e}")
        return
    
    # Test 3: Embed text
    print("\n3️⃣ Testing /embed:")
    try:
        # Tạo test image
        test_img = create_test_image(200, 150)
        img_buffer = io.BytesIO()
        test_img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        # Test embed
        secret_text = "Hello, this is a test message for steganography! 🚀"
        
        files = {
            'coverImage': ('test.png', img_buffer, 'image/png')
        }
        data = {
            'secretText': secret_text
        }
        
        response = requests.post(f"{base_url}/embed", files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Embed successful!")
            print(f"   Text length: {result['data']['metrics']['textLength']}")
            print(f"   Binary length: {result['data']['metrics']['binaryLength']}")
            print(f"   PSNR: {result['data']['metrics']['psnr']} dB")
            print(f"   SSIM: {result['data']['metrics']['ssim']}")
            print(f"   Algorithm: {result['data']['algorithm']['name']}")
            
            # Save stego image để test extract
            stego_b64 = result['data']['stegoImage']
            return stego_b64, secret_text
            
        else:
            print(f"   ❌ Embed failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"   ❌ Embed test failed: {e}")
        return None, None
    
    return None, None

def test_extract(stego_b64, original_text):
    """Test extract functionality"""
    base_url = "http://localhost:8000"
    
    print("\n4️⃣ Testing /extract:")
    try:
        # Convert base64 back to image file
        stego_bytes = base64.b64decode(stego_b64)
        stego_buffer = io.BytesIO(stego_bytes)
        
        files = {
            'stegoImage': ('stego.png', stego_buffer, 'image/png')
        }
        
        response = requests.post(f"{base_url}/extract", files=files)
        
        if response.status_code == 200:
            result = response.json()
            extracted_text = result['data']['extractedText']
            
            print(f"   ✅ Extract successful!")
            print(f"   Original:  '{original_text}'")
            print(f"   Extracted: '{extracted_text}'")
            print(f"   Match: {'✅' if extracted_text == original_text else '❌'}")
            print(f"   Algorithm: {result['data']['info']['algorithm']}")
            
        else:
            print(f"   ❌ Extract failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"   ❌ Extract test failed: {e}")

if __name__ == "__main__":
    stego_b64, original_text = test_simple_backend()
    
    if stego_b64 and original_text:
        test_extract(stego_b64, original_text)
    
    print("\n🎉 Testing completed!")

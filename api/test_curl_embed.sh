#!/bin/bash

# Test script for Tab "Embed" API with correct endpoint path

echo "🔍 Testing Embed API with curl..."

# Create a simple test image
echo "Creating test image..."
python3 -c "
from PIL import Image
import io
img = Image.new('RGB', (100, 100), color='red')
img.save('test_image.jpg', 'JPEG')
print('Test image created: test_image.jpg')
"

echo ""
echo "📡 Making API call to CORRECT endpoint..."

# Correct curl command with proper endpoint path
curl -X POST 'http://localhost:8000/api/v1/embed' \
  -H 'Accept: application/json' \
  -F 'coverImage=@test_image.jpg' \
  -F 'secretText=Hello World! This is a test message.' \
  -F 'secretType=text' \
  -F 'complexityMethod=sobel' \
  -F 'payloadCap=60' \
  -F 'domain=spatial' \
  -F 'encrypt=true' \
  -F 'seed=test123' \
  | python3 -m json.tool

echo ""
echo "✅ API call completed!"

# Cleanup
rm -f test_image.jpg
echo "🧹 Cleaned up test files"

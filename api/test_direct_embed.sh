#!/bin/bash

echo "🔍 Testing DIRECT /embed endpoint (your original URL)..."

# Create test image
python3 -c "
from PIL import Image
img = Image.new('RGB', (50, 50), color='blue')
img.save('test_direct.jpg', 'JPEG')
"

echo "📡 Testing your original curl command format..."

# Test your original URL format
curl -X POST 'http://localhost:8000/embed' \
  -H 'Accept: application/json' \
  -F 'coverImage=@test_direct.jpg' \
  -F 'secretText=Testing direct route!' \
  -F 'secretType=text' \
  | python3 -m json.tool

echo ""
echo "✅ Direct route test completed!"

# Cleanup
rm -f test_direct.jpg

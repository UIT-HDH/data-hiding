#!/bin/bash

echo "🧪 Testing CORS and Embed functionality..."

# Test health
echo -e "\n1️⃣ Testing Health endpoint:"
curl 'http://localhost:8000/health' -s | jq '.'

# Test methods
echo -e "\n2️⃣ Testing Methods endpoint:"
curl 'http://localhost:8000/embed/methods' -s | jq '.data[0]'

# Test domains  
echo -e "\n3️⃣ Testing Domains endpoint:"
curl 'http://localhost:8000/embed/domains' -s | jq '.data[0]'

# Create test image
echo -e "\n4️⃣ Creating test image..."
python3 -c "
from PIL import Image
import io

# Create 100x100 blue test image
img = Image.new('RGB', (100, 100), color='blue')
img.save('test_image.png')
print('✅ Test image created: test_image.png')
"

# Test embed with CORS headers
echo -e "\n5️⃣ Testing Embed endpoint with CORS:"
curl -X POST 'http://localhost:8000/embed' \
  -H 'Origin: http://localhost:5173' \
  -H 'Content-Type: multipart/form-data' \
  -F 'coverImage=@test_image.png' \
  -F 'secretText=Hello CORS World!' \
  -F 'secretType=text' \
  -F 'complexityMethod=sobel' \
  -F 'payloadCap=60' \
  -v \
  -s | jq '.message, .data.metrics'

echo -e "\n✅ CORS Test completed!"

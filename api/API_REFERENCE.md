# 📚 API Reference - FastAPI Steganography Backend

Complete technical reference for all API endpoints, request/response schemas, and integration examples.

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Base URL & Versioning](#base-url--versioning)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Core Endpoints](#core-endpoints)
- [Request/Response Schemas](#requestresponse-schemas)
- [Code Examples](#code-examples)
- [SDKs & Libraries](#sdks--libraries)

---

## 🔐 Authentication

Currently, the API operates without authentication for development purposes. In production, implement:

```bash
# Future authentication headers
Authorization: Bearer <jwt-token>
X-API-Key: <your-api-key>
```

---

## 🌐 Base URL & Versioning

```
Base URL: http://localhost:8000
API Version: v1
Full API URL: http://localhost:8000/api/v1
```

### Version Information
```bash
GET /
# Returns API version and available endpoints
```

---

## ⚠️ Error Handling

### Standard Error Response

```json
{
  \"error\": true,
  \"error_code\": \"ERROR_TYPE\",
  \"error_type\": \"ExceptionClassName\",
  \"message\": \"Human-readable error message\",
  \"request_id\": \"req_123456789\",
  \"timestamp\": \"2024-01-01T12:00:00Z\",
  \"details\": {
    \"parameter\": \"value\",
    \"additional_info\": \"context\"
  },
  \"suggestions\": [
    \"Try using a smaller image\",
    \"Check your algorithm parameters\"
  ]
}
```

### Error Codes Reference

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `FILE_VALIDATION_ERROR` | 400 | Invalid file format/size | Check file format and size limits |
| `PAYLOAD_TOO_LARGE` | 400 | Data too large for image | Use larger image or compress data |
| `PROCESSING_ERROR` | 500 | Algorithm processing failed | Try different algorithm or parameters |
| `PARAMETER_ERROR` | 400 | Invalid parameters | Check parameter values and ranges |
| `RATE_LIMIT_ERROR` | 429 | Too many requests | Wait and retry after specified time |
| `AUTHENTICATION_ERROR` | 401 | Invalid credentials | Check authentication token |
| `AUTHORIZATION_ERROR` | 403 | Access denied | Check permissions |

---

## 🚦 Rate Limiting

### Limits
- **Per IP**: 60 requests/minute, 1000 requests/hour
- **File Size**: 50MB per request (configurable)
- **Batch Size**: 100 items per batch request

### Headers
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704067200
```

---

## 🎯 Core Endpoints

### 1. Embed Secret Data

**Endpoint**: `POST /api/v1/embed`

**Description**: Embed secret data into a cover image using steganography algorithms.

#### Request Body
```json
{
  \"cover_image\": {
    \"data\": \"<base64-encoded-image>\",
    \"filename\": \"cover.png\",
    \"format\": \"png\"
  },
  \"secret_data\": {
    \"content\": \"Secret message or base64 data\",
    \"is_binary\": false,
    \"filename\": \"secret.txt\",
    \"compression\": \"gzip\",
    \"encryption\": \"fernet\",
    \"password\": \"encryption-password\"
  },
  \"parameters\": {
    \"algorithm\": \"lsb\",
    \"color_channel\": \"auto\",
    \"quality\": 95,
    \"randomize\": true,
    \"seed\": 12345,
    \"capacity_check\": true,
    \"preserve_metadata\": false,
    \"lsb_bits\": 1,
    \"dct_quality\": 90,
    \"wavelet_type\": \"haar\",
    \"edge_threshold\": 0.1
  },
  \"output_format\": \"base64\",
  \"include_metrics\": true,
  \"include_maps\": false,
  \"request_id\": \"optional-request-id\"
}
```

#### Response
```json
{
  \"success\": true,
  \"message\": \"Embedding completed successfully\",
  \"request_id\": \"req_123456789\",
  \"timestamp\": \"2024-01-01T12:00:00Z\",
  \"processing_time\": 2.45,
  \"stego_image\": \"<base64-encoded-stego-image>\",
  \"metrics\": {
    \"original_size\": 1048576,
    \"stego_size\": 1048580,
    \"payload_size\": 1024,
    \"capacity_used\": 12.5,
    \"total_capacity\": 8192,
    \"compression_ratio\": 2.1,
    \"quality_score\": 98.2,
    \"psnr\": 52.3,
    \"mse\": 0.23,
    \"ssim\": 0.998,
    \"histogram_similarity\": 0.95
  },
  \"complexity_maps\": [
    {
      \"type\": \"entropy\",
      \"data\": \"<base64-encoded-map>\",
      \"width\": 256,
      \"height\": 256,
      \"min_value\": 0.0,
      \"max_value\": 1.0,
      \"mean_value\": 0.45,
      \"std_value\": 0.23,
      \"normalized\": true
    }
  ],
  \"algorithm_used\": \"lsb\",
  \"parameters_used\": {
    \"algorithm\": \"lsb\",
    \"quality\": 95,
    \"lsb_bits\": 1,
    \"randomize\": true
  },
  \"log_entries\": [
    \"Decoding cover image\",
    \"Cover image format: PNG, Size: (1024, 768)\",
    \"Preparing secret data for embedding\",
    \"Applied gzip compression: 1024 → 512 bytes\",
    \"Applied Fernet encryption\",
    \"Checking embedding capacity\",
    \"Capacity: 8192 bytes, Payload: 512 bytes\",
    \"Starting lsb embedding\",
    \"Embedding completed successfully\",
    \"Calculating embedding metrics\",
    \"Stego image encoded successfully\"
  ],
  \"warnings\": [
    \"High capacity usage may affect image quality\"
  ]
}
```

### 2. Extract Hidden Data

**Endpoint**: `POST /api/v1/extract`

**Description**: Extract hidden data from a steganography image.

#### Request Body
```json
{
  \"stego_image\": {
    \"data\": \"<base64-encoded-stego-image>\",
    \"filename\": \"stego.png\",
    \"format\": \"png\"
  },
  \"parameters\": {
    \"algorithm\": \"lsb\",
    \"color_channel\": \"auto\",
    \"seed\": 12345,
    \"password\": \"decryption-password\",
    \"verify_integrity\": true,
    \"lsb_bits\": 1,
    \"wavelet_type\": \"haar\",
    \"edge_threshold\": 0.1
  },
  \"output_format\": \"json\",
  \"include_integrity\": true,
  \"request_id\": \"optional-request-id\"
}
```

#### Response
```json
{
  \"success\": true,
  \"message\": \"Extraction completed successfully\",
  \"request_id\": \"req_987654321\",
  \"timestamp\": \"2024-01-01T12:05:00Z\",
  \"processing_time\": 1.23,
  \"extracted_data\": {
    \"content\": \"Secret message or base64 data\",
    \"data_type\": \"text\",
    \"is_binary\": false,
    \"filename\": \"secret.txt\",
    \"size\": 1024,
    \"checksum\": \"abc123def456\",
    \"compression_used\": \"gzip\",
    \"encryption_used\": \"fernet\"
  },
  \"integrity\": {
    \"extracted_size\": 512,
    \"confidence_score\": 0.98,
    \"integrity_verified\": true,
    \"checksum_valid\": true,
    \"data_type\": \"text\",
    \"compression_detected\": \"gzip\",
    \"encryption_detected\": \"fernet\",
    \"error_correction_used\": false,
    \"bit_error_rate\": 0.001
  },
  \"algorithm_used\": \"lsb\",
  \"parameters_used\": {
    \"algorithm\": \"lsb\",
    \"lsb_bits\": 1,
    \"verify_integrity\": true
  },
  \"log_entries\": [
    \"Decoding steganography image\",
    \"Starting lsb extraction\",
    \"Extracted 512 bytes of raw data\",
    \"Processing extracted data\",
    \"Extracted metadata header\",
    \"Checksum validation: passed\",
    \"Successfully decrypted data\",
    \"Successfully decompressed data using gzip\",
    \"Processed data: type=text, size=1024 bytes\"
  ],
  \"warnings\": []
}
```

### 3. Batch Embedding

**Endpoint**: `POST /api/v1/batch/embed`

**Description**: Process multiple images in batch for embedding operations.

#### Request Body
```json
{
  \"items\": [
    {
      \"id\": \"batch_item_1\",
      \"cover_image\": {
        \"data\": \"<base64-encoded-image-1>\",
        \"filename\": \"image1.png\"
      },
      \"secret_data\": {
        \"content\": \"Secret data for image 1\",
        \"is_binary\": false
      },
      \"parameters\": {
        \"algorithm\": \"lsb\",
        \"quality\": 95
      }
    },
    {
      \"id\": \"batch_item_2\",
      \"cover_image\": {
        \"data\": \"<base64-encoded-image-2>\",
        \"filename\": \"image2.png\"
      },
      \"secret_data\": {
        \"content\": \"Secret data for image 2\",
        \"is_binary\": false
      }
    }
  ],
  \"config\": {
    \"parameters\": {
      \"algorithm\": \"lsb\",
      \"quality\": 90
    },
    \"output_format\": \"json\",
    \"fail_fast\": false,
    \"include_metrics\": true,
    \"parallel_processing\": true,
    \"max_workers\": 4
  },
  \"request_id\": \"batch_req_123\"
}
```

#### Response
```json
{
  \"success\": true,
  \"message\": \"Batch processing completed\",
  \"request_id\": \"batch_req_123\",
  \"timestamp\": \"2024-01-01T12:10:00Z\",
  \"processing_time\": 5.67,
  \"results\": [
    {
      \"id\": \"batch_item_1\",
      \"status\": \"success\",
      \"stego_image\": \"<base64-encoded-result-1>\",
      \"metrics\": {
        \"original_size\": 1048576,
        \"stego_size\": 1048580,
        \"payload_size\": 256,
        \"capacity_used\": 3.1,
        \"quality_score\": 98.5
      },
      \"processing_time\": 2.1,
      \"warnings\": []
    },
    {
      \"id\": \"batch_item_2\",
      \"status\": \"failed\",
      \"stego_image\": null,
      \"metrics\": null,
      \"error\": \"Payload too large for image capacity\",
      \"error_code\": \"PAYLOAD_TOO_LARGE\",
      \"processing_time\": 0.5,
      \"warnings\": [\"Consider using compression\"]
    }
  ],
  \"summary\": {
    \"total_items\": 2,
    \"successful_items\": 1,
    \"failed_items\": 1,
    \"success_rate\": 50.0,
    \"total_processing_time\": 5.67,
    \"average_processing_time\": 2.835,
    \"total_payload_size\": 512,
    \"total_output_size\": 1048580
  },
  \"config_used\": {
    \"parallel_processing\": true,
    \"max_workers\": 4,
    \"fail_fast\": false
  },
  \"log_entries\": [
    \"Starting batch processing of 2 items\",
    \"Processing items in parallel with 4 workers\",
    \"Item batch_item_1: completed successfully\",
    \"Item batch_item_2: failed with error\",
    \"Batch processing completed: 1/2 successful\"
  ],
  \"warnings\": [
    \"Some items failed processing - check individual results\"
  ]
}
```

### 4. Complexity Analysis

**Endpoint**: `POST /api/v1/analysis/complexity`

**Description**: Analyze image complexity and generate complexity maps for optimal steganography.

#### Request Body
```json
{
  \"image\": {
    \"data\": \"<base64-encoded-image>\",
    \"filename\": \"analysis.png\",
    \"format\": \"png\"
  },
  \"analysis_types\": [\"entropy\", \"gradient\", \"texture\", \"edges\", \"frequency\"],
  \"generate_maps\": true,
  \"map_resolution\": 256,
  \"include_statistics\": true,
  \"normalize_maps\": true,
  \"request_id\": \"analysis_req_456\"
}
```

#### Response
```json
{
  \"success\": true,
  \"message\": \"Complexity analysis completed\",
  \"request_id\": \"analysis_req_456\",
  \"timestamp\": \"2024-01-01T12:15:00Z\",
  \"processing_time\": 3.21,
  \"complexity_maps\": [
    {
      \"type\": \"entropy\",
      \"data\": \"<base64-encoded-entropy-map>\",
      \"width\": 256,
      \"height\": 256,
      \"min_value\": 0.0,
      \"max_value\": 1.0,
      \"mean_value\": 0.67,
      \"std_value\": 0.23,
      \"normalized\": true
    },
    {
      \"type\": \"gradient\",
      \"data\": \"<base64-encoded-gradient-map>\",
      \"width\": 256,
      \"height\": 256,
      \"min_value\": 0.0,
      \"max_value\": 1.0,
      \"mean_value\": 0.34,
      \"std_value\": 0.18,
      \"normalized\": true
    }
  ],
  \"normalized_maps\": [
    {
      \"type\": \"entropy_normalized\",
      \"data\": \"<base64-encoded-normalized-entropy>\",
      \"width\": 256,
      \"height\": 256,
      \"min_value\": 0.0,
      \"max_value\": 1.0,
      \"mean_value\": 0.5,
      \"std_value\": 0.2,
      \"normalized\": true
    }
  ],
  \"statistics\": {
    \"entropy\": 7.23,
    \"gradient_magnitude\": 45.6,
    \"texture_energy\": 0.78,
    \"edge_density\": 0.34,
    \"spatial_frequency\": 12.5,
    \"color_diversity\": 0.89,
    \"homogeneity\": 0.45,
    \"contrast\": 78.9,
    \"correlation\": 0.67,
    \"embedding_capacity\": 8192,
    \"recommended_algorithm\": \"edge_adaptive\"
  },
  \"analysis_types\": [\"entropy\", \"gradient\", \"texture\", \"edges\"],
  \"image_properties\": {
    \"width\": 1024,
    \"height\": 768,
    \"channels\": 3,
    \"format\": \"PNG\",
    \"mode\": \"RGB\",
    \"size_bytes\": 1048576,
    \"has_alpha\": false,
    \"color_depth\": 8
  },
  \"recommendations\": [
    \"Use edge_adaptive algorithm for best security\",
    \"High entropy regions suitable for LSB embedding\",
    \"Consider DCT for JPEG compression robustness\",
    \"Avoid smooth areas for critical data\"
  ],
  \"log_entries\": [
    \"Decoding analysis image\",
    \"Image properties: 1024x768, RGB, PNG\",
    \"Calculating entropy map\",
    \"Calculating gradient map\",
    \"Calculating texture features\",
    \"Detecting edges\",
    \"Computing statistical measures\",
    \"Generating recommendations\",
    \"Analysis completed successfully\"
  ],
  \"warnings\": []
}
```

### 5. Health Check

**Endpoint**: `GET /health`

**Description**: Check API service health and status.

#### Response
```json
{
  \"status\": \"healthy\",
  \"service\": \"Steganography API\",
  \"version\": \"1.0.0\",
  \"environment\": \"development\",
  \"timestamp\": 1704067200.123,
  \"uptime\": 3600.5
}
```

---

## 📋 Request/Response Schemas

### Common Types

#### Algorithm Types
```json
\"algorithm\": \"lsb\" | \"lsb_enhanced\" | \"dct\" | \"dwt\" | \"pvd\" | \"edge_adaptive\"
```

#### Color Channels
```json
\"color_channel\": \"red\" | \"green\" | \"blue\" | \"all\" | \"auto\"
```

#### Compression Types
```json
\"compression\": \"none\" | \"gzip\" | \"lzma\" | \"bzip2\"
```

#### Encryption Types
```json
\"encryption\": \"none\" | \"aes\" | \"chacha20\" | \"fernet\"
```

#### Data Types
```json
\"data_type\": \"text\" | \"binary\" | \"image\" | \"document\" | \"unknown\"
```

#### Processing Status
```json
\"status\": \"success\" | \"failed\" | \"partial\" | \"cancelled\"
```

### Validation Rules

#### Image Data
```json
{
  \"data\": \"string (base64, required, min_length=1)\",
  \"filename\": \"string (optional, max_length=255)\",
  \"format\": \"string (optional, regex='^(png|jpg|jpeg|bmp|tiff|gif|webp)$')\"
}
```

#### Secret Data
```json
{
  \"content\": \"string (required, min_length=1, max_length=10MB)\",
  \"is_binary\": \"boolean (default=false)\",
  \"filename\": \"string (optional, max_length=255)\",
  \"compression\": \"CompressionType (default='none')\",
  \"encryption\": \"EncryptionType (default='none')\",
  \"password\": \"string (optional, min_length=8, max_length=256)\"
}
```

#### Embedding Parameters
```json
{
  \"algorithm\": \"AlgorithmType (default='lsb')\",
  \"color_channel\": \"ColorChannel (default='auto')\",
  \"quality\": \"integer (default=80, range=1-100)\",
  \"randomize\": \"boolean (default=true)\",
  \"seed\": \"integer (optional, min=0)\",
  \"capacity_check\": \"boolean (default=true)\",
  \"preserve_metadata\": \"boolean (default=false)\",
  \"lsb_bits\": \"integer (default=1, range=1-8)\",
  \"dct_quality\": \"integer (default=90, range=1-100)\",
  \"wavelet_type\": \"string (default='haar')\",
  \"edge_threshold\": \"float (default=0.1, range=0.0-1.0)\"
}
```

---

## 💻 Code Examples

### Python Examples

#### Basic Embedding
```python
import requests
import base64
from PIL import Image
import io

def embed_data(image_path, secret_message, algorithm=\"lsb\"):
    # Load and encode image
    with open(image_path, \"rb\") as img_file:
        image_data = base64.b64encode(img_file.read()).decode()
    
    # Prepare request
    request_data = {
        \"cover_image\": {
            \"data\": image_data,
            \"filename\": \"cover.png\"
        },
        \"secret_data\": {
            \"content\": secret_message,
            \"is_binary\": False,
            \"compression\": \"gzip\",
            \"encryption\": \"fernet\",
            \"password\": \"mysecretpassword\"
        },
        \"parameters\": {
            \"algorithm\": algorithm,
            \"quality\": 95,
            \"randomize\": True
        },
        \"include_metrics\": True
    }
    
    # Make API request
    response = requests.post(
        \"http://localhost:8000/api/v1/embed\",
        json=request_data,
        headers={\"Content-Type\": \"application/json\"}
    )
    
    if response.status_code == 200:
        result = response.json()
        if result[\"success\"]:
            # Save stego image
            stego_data = base64.b64decode(result[\"stego_image\"])
            with open(\"stego_image.png\", \"wb\") as stego_file:
                stego_file.write(stego_data)
            
            print(f\"Embedding successful!\")
            print(f\"Quality Score: {result['metrics']['quality_score']:.2f}\")
            print(f\"Capacity Used: {result['metrics']['capacity_used']:.1f}%\")
            
            return result
        else:
            print(f\"Embedding failed: {result['message']}\")
    else:
        print(f\"API Error: {response.status_code} - {response.text}\")
    
    return None

# Usage
result = embed_data(\"cover_image.png\", \"This is my secret message!\")
```

#### Extraction
```python
def extract_data(stego_image_path, algorithm=\"lsb\", password=None):
    # Load stego image
    with open(stego_image_path, \"rb\") as img_file:
        stego_data = base64.b64encode(img_file.read()).decode()
    
    # Prepare request
    request_data = {
        \"stego_image\": {
            \"data\": stego_data,
            \"filename\": \"stego.png\"
        },
        \"parameters\": {
            \"algorithm\": algorithm,
            \"password\": password,
            \"verify_integrity\": True
        },
        \"include_integrity\": True
    }
    
    # Make API request
    response = requests.post(
        \"http://localhost:8000/api/v1/extract\",
        json=request_data
    )
    
    if response.status_code == 200:
        result = response.json()
        if result[\"success\"] and result[\"extracted_data\"]:
            extracted = result[\"extracted_data\"]
            integrity = result[\"integrity\"]
            
            print(f\"Extraction successful!\")
            print(f\"Message: {extracted['content']}\")
            print(f\"Data Type: {extracted['data_type']}\")
            print(f\"Integrity Verified: {integrity['integrity_verified']}\")
            print(f\"Confidence Score: {integrity['confidence_score']:.2f}\")
            
            return extracted[\"content\"]
        else:
            print(\"No hidden data found or extraction failed\")
    else:
        print(f\"API Error: {response.status_code} - {response.text}\")
    
    return None

# Usage
extracted_message = extract_data(\"stego_image.png\", \"lsb\", \"mysecretpassword\")
```

#### Batch Processing
```python
def batch_embed(image_files, messages, algorithm=\"lsb\"):
    items = []
    
    for i, (image_file, message) in enumerate(zip(image_files, messages)):
        with open(image_file, \"rb\") as img_file:
            image_data = base64.b64encode(img_file.read()).decode()
        
        items.append({
            \"id\": f\"item_{i+1}\",
            \"cover_image\": {
                \"data\": image_data,
                \"filename\": f\"image_{i+1}.png\"
            },
            \"secret_data\": {
                \"content\": message,
                \"is_binary\": False
            }
        })
    
    request_data = {
        \"items\": items,
        \"config\": {
            \"parameters\": {
                \"algorithm\": algorithm,
                \"quality\": 90
            },
            \"parallel_processing\": True,
            \"max_workers\": 4,
            \"fail_fast\": False,
            \"include_metrics\": True
        }
    }
    
    response = requests.post(
        \"http://localhost:8000/api/v1/batch/embed\",
        json=request_data
    )
    
    if response.status_code == 200:
        result = response.json()
        summary = result[\"summary\"]
        
        print(f\"Batch processing completed!\")
        print(f\"Success Rate: {summary['success_rate']:.1f}%\")
        print(f\"Processing Time: {summary['total_processing_time']:.2f}s\")
        
        # Save successful results
        for i, item_result in enumerate(result[\"results\"]):
            if item_result[\"status\"] == \"success\":
                stego_data = base64.b64decode(item_result[\"stego_image\"])
                with open(f\"batch_stego_{i+1}.png\", \"wb\") as f:
                    f.write(stego_data)
        
        return result
    else:
        print(f\"Batch processing failed: {response.status_code}\")
    
    return None

# Usage
images = [\"image1.png\", \"image2.png\", \"image3.png\"]
messages = [\"Secret 1\", \"Secret 2\", \"Secret 3\"]
batch_result = batch_embed(images, messages)
```

#### Complexity Analysis
```python
def analyze_image_complexity(image_path):
    with open(image_path, \"rb\") as img_file:
        image_data = base64.b64encode(img_file.read()).decode()
    
    request_data = {
        \"image\": {
            \"data\": image_data,
            \"filename\": \"analysis.png\"
        },
        \"analysis_types\": [\"entropy\", \"gradient\", \"texture\", \"edges\"],
        \"generate_maps\": True,
        \"include_statistics\": True,
        \"normalize_maps\": True
    }
    
    response = requests.post(
        \"http://localhost:8000/api/v1/analysis/complexity\",
        json=request_data
    )
    
    if response.status_code == 200:
        result = response.json()
        stats = result[\"statistics\"]
        
        print(f\"Image Complexity Analysis:\")
        print(f\"Entropy: {stats['entropy']:.2f}\")
        print(f\"Edge Density: {stats['edge_density']:.2f}\")
        print(f\"Embedding Capacity: {stats['embedding_capacity']} bytes\")
        print(f\"Recommended Algorithm: {stats['recommended_algorithm']}\")
        
        # Save complexity maps
        for i, cmap in enumerate(result[\"complexity_maps\"]):
            map_data = base64.b64decode(cmap[\"data\"])
            with open(f\"complexity_map_{cmap['type']}.png\", \"wb\") as f:
                f.write(map_data)
        
        return result
    else:
        print(f\"Analysis failed: {response.status_code}\")
    
    return None

# Usage
analysis = analyze_image_complexity(\"test_image.png\")
```

### JavaScript/Node.js Examples

#### Basic Embedding (Node.js)
```javascript
const axios = require('axios');
const fs = require('fs').promises;

async function embedData(imagePath, secretMessage, algorithm = 'lsb') {
    try {
        // Read and encode image
        const imageBuffer = await fs.readFile(imagePath);
        const imageData = imageBuffer.toString('base64');
        
        const requestData = {
            cover_image: {
                data: imageData,
                filename: 'cover.png'
            },
            secret_data: {
                content: secretMessage,
                is_binary: false,
                compression: 'gzip',
                encryption: 'fernet',
                password: 'mysecretpassword'
            },
            parameters: {
                algorithm: algorithm,
                quality: 95,
                randomize: true
            },
            include_metrics: true
        };
        
        const response = await axios.post(
            'http://localhost:8000/api/v1/embed',
            requestData,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );
        
        if (response.data.success) {
            // Save stego image
            const stegoBuffer = Buffer.from(response.data.stego_image, 'base64');
            await fs.writeFile('stego_image.png', stegoBuffer);
            
            console.log('Embedding successful!');
            console.log(`Quality Score: ${response.data.metrics.quality_score.toFixed(2)}`);
            console.log(`Capacity Used: ${response.data.metrics.capacity_used.toFixed(1)}%`);
            
            return response.data;
        } else {
            console.error('Embedding failed:', response.data.message);
        }
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
    }
    
    return null;
}

// Usage
embedData('cover_image.png', 'This is my secret message!').then(result => {
    if (result) {
        console.log('Embedding completed successfully');
    }
});
```

#### Frontend JavaScript (Browser)
```javascript
class SteganographyAPI {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
    }
    
    async embedData(imageFile, secretMessage, options = {}) {
        try {
            // Convert image file to base64
            const imageData = await this.fileToBase64(imageFile);
            
            const requestData = {
                cover_image: {
                    data: imageData,
                    filename: imageFile.name
                },
                secret_data: {
                    content: secretMessage,
                    is_binary: false,
                    compression: options.compression || 'gzip',
                    encryption: options.encryption || 'none',
                    password: options.password
                },
                parameters: {
                    algorithm: options.algorithm || 'lsb',
                    quality: options.quality || 90,
                    randomize: true
                },
                include_metrics: true
            };
            
            const response = await fetch(`${this.baseUrl}/api/v1/embed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(`API Error: ${result.message || response.statusText}`);
            }
            
            return result;
        } catch (error) {
            console.error('Embedding failed:', error);
            throw error;
        }
    }
    
    async extractData(stegoImageFile, options = {}) {
        try {
            const imageData = await this.fileToBase64(stegoImageFile);
            
            const requestData = {
                stego_image: {
                    data: imageData,
                    filename: stegoImageFile.name
                },
                parameters: {
                    algorithm: options.algorithm || 'lsb',
                    password: options.password,
                    verify_integrity: true
                },
                include_integrity: true
            };
            
            const response = await fetch(`${this.baseUrl}/api/v1/extract`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(`API Error: ${result.message || response.statusText}`);
            }
            
            return result;
        } catch (error) {
            console.error('Extraction failed:', error);
            throw error;
        }
    }
    
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data:image/png;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    base64ToBlob(base64Data, contentType = 'image/png') {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: contentType });
    }
}

// Usage in HTML
const api = new SteganographyAPI();

document.getElementById('embedButton').addEventListener('click', async () => {
    const imageFile = document.getElementById('imageInput').files[0];
    const secretMessage = document.getElementById('messageInput').value;
    
    if (imageFile && secretMessage) {
        try {
            const result = await api.embedData(imageFile, secretMessage, {
                algorithm: 'lsb',
                quality: 95,
                encryption: 'fernet',
                password: 'mypassword'
            });
            
            // Create download link for stego image
            const stegoBlob = api.base64ToBlob(result.stego_image);
            const downloadUrl = URL.createObjectURL(stegoBlob);
            
            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = downloadUrl;
            downloadLink.download = 'stego_image.png';
            downloadLink.style.display = 'block';
            downloadLink.textContent = 'Download Stego Image';
            
            // Display metrics
            const metrics = result.metrics;
            document.getElementById('metrics').innerHTML = `
                <h3>Embedding Metrics:</h3>
                <p>Quality Score: ${metrics.quality_score.toFixed(2)}</p>
                <p>Capacity Used: ${metrics.capacity_used.toFixed(1)}%</p>
                <p>PSNR: ${metrics.psnr.toFixed(2)} dB</p>
                <p>SSIM: ${metrics.ssim.toFixed(3)}</p>
            `;
            
        } catch (error) {
            alert(`Embedding failed: ${error.message}`);
        }
    }
});
```

### cURL Examples

#### Basic Embed
```bash
#!/bin/bash

# Convert image to base64
IMAGE_BASE64=$(base64 -w 0 cover_image.png)

# Make embed request
curl -X POST \"http://localhost:8000/api/v1/embed\" \\
  -H \"Content-Type: application/json\" \\
  -d \"{
    \\\"cover_image\\\": {
      \\\"data\\\": \\\"$IMAGE_BASE64\\\",
      \\\"filename\\\": \\\"cover.png\\\"
    },
    \\\"secret_data\\\": {
      \\\"content\\\": \\\"This is a secret message!\\\",
      \\\"is_binary\\\": false,
      \\\"compression\\\": \\\"gzip\\\",
      \\\"encryption\\\": \\\"fernet\\\",
      \\\"password\\\": \\\"mysecretpassword\\\"
    },
    \\\"parameters\\\": {
      \\\"algorithm\\\": \\\"lsb\\\",
      \\\"quality\\\": 95
    },
    \\\"include_metrics\\\": true
  }\" \\
  | jq '.'
```

#### Extract with Error Handling
```bash
#!/bin/bash

STEGO_BASE64=$(base64 -w 0 stego_image.png)

RESPONSE=$(curl -s -X POST \"http://localhost:8000/api/v1/extract\" \\
  -H \"Content-Type: application/json\" \\
  -w \"HTTPSTATUS:%{http_code}\" \\
  -d \"{
    \\\"stego_image\\\": {
      \\\"data\\\": \\\"$STEGO_BASE64\\\",
      \\\"filename\\\": \\\"stego.png\\\"
    },
    \\\"parameters\\\": {
      \\\"algorithm\\\": \\\"lsb\\\",
      \\\"password\\\": \\\"mysecretpassword\\\"
    }
  }\")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\\n' | sed -e 's/.*HTTPSTATUS://')
BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//')

if [ $HTTP_STATUS -eq 200 ]; then
    echo \"Extraction successful:\"
    echo $BODY | jq '.extracted_data.content'
else
    echo \"Extraction failed with status $HTTP_STATUS:\"
    echo $BODY | jq '.message'
fi
```

---

## 🔗 SDKs & Libraries

### Python SDK (Conceptual)

```python
# steganography_client.py
import requests
import base64
from typing import Optional, Dict, Any, List
from pathlib import Path

class SteganographyClient:
    def __init__(self, base_url: str = \"http://localhost:8000\", api_key: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({\"X-API-Key\": api_key})
    
    def embed(
        self,
        cover_image: str | Path,
        secret_data: str,
        algorithm: str = \"lsb\",
        **options
    ) -> Dict[str, Any]:
        \"\"\"Embed secret data into cover image.\"\"\"
        
        image_data = self._load_image(cover_image)
        
        request_data = {
            \"cover_image\": {
                \"data\": image_data,
                \"filename\": Path(cover_image).name
            },
            \"secret_data\": {
                \"content\": secret_data,
                \"is_binary\": False,
                **options
            },
            \"parameters\": {
                \"algorithm\": algorithm,
                **{k: v for k, v in options.items() if k in [\"quality\", \"randomize\", \"seed\"]}
            },
            \"include_metrics\": True
        }
        
        response = self.session.post(f\"{self.base_url}/api/v1/embed\", json=request_data)
        response.raise_for_status()
        
        return response.json()
    
    def extract(
        self,
        stego_image: str | Path,
        algorithm: str = \"lsb\",
        **options
    ) -> Dict[str, Any]:
        \"\"\"Extract hidden data from stego image.\"\"\"
        
        image_data = self._load_image(stego_image)
        
        request_data = {
            \"stego_image\": {
                \"data\": image_data,
                \"filename\": Path(stego_image).name
            },
            \"parameters\": {
                \"algorithm\": algorithm,
                **options
            },
            \"include_integrity\": True
        }
        
        response = self.session.post(f\"{self.base_url}/api/v1/extract\", json=request_data)
        response.raise_for_status()
        
        return response.json()
    
    def batch_embed(
        self,
        items: List[Dict[str, Any]],
        **config_options
    ) -> Dict[str, Any]:
        \"\"\"Process multiple embed operations in batch.\"\"\"
        
        processed_items = []
        for item in items:
            processed_item = {
                \"id\": item[\"id\"],
                \"cover_image\": {
                    \"data\": self._load_image(item[\"cover_image\"]),
                    \"filename\": Path(item[\"cover_image\"]).name
                },
                \"secret_data\": item[\"secret_data\"]
            }
            if \"parameters\" in item:
                processed_item[\"parameters\"] = item[\"parameters\"]
            processed_items.append(processed_item)
        
        request_data = {
            \"items\": processed_items,
            \"config\": config_options
        }
        
        response = self.session.post(f\"{self.base_url}/api/v1/batch/embed\", json=request_data)
        response.raise_for_status()
        
        return response.json()
    
    def analyze_complexity(
        self,
        image: str | Path,
        analysis_types: Optional[List[str]] = None,
        **options
    ) -> Dict[str, Any]:
        \"\"\"Analyze image complexity.\"\"\"
        
        image_data = self._load_image(image)
        
        request_data = {
            \"image\": {
                \"data\": image_data,
                \"filename\": Path(image).name
            },
            \"analysis_types\": analysis_types or [\"entropy\", \"gradient\", \"texture\", \"edges\"],
            **options
        }
        
        response = self.session.post(f\"{self.base_url}/api/v1/analysis/complexity\", json=request_data)
        response.raise_for_status()
        
        return response.json()
    
    def health_check(self) -> Dict[str, Any]:
        \"\"\"Check API health status.\"\"\"
        response = self.session.get(f\"{self.base_url}/health\")
        response.raise_for_status()
        return response.json()
    
    def _load_image(self, image_path: str | Path) -> str:
        \"\"\"Load image file and convert to base64.\"\"\"
        with open(image_path, \"rb\") as f:
            return base64.b64encode(f.read()).decode()
    
    def save_image(self, base64_data: str, output_path: str | Path) -> None:
        \"\"\"Save base64 image data to file.\"\"\"
        with open(output_path, \"wb\") as f:
            f.write(base64.b64decode(base64_data))

# Usage example
client = SteganographyClient(\"http://localhost:8000\")

# Embed data
result = client.embed(
    cover_image=\"cover.png\",
    secret_data=\"Secret message\",
    algorithm=\"lsb\",
    quality=95,
    encryption=\"fernet\",
    password=\"mypassword\"
)

# Save stego image
client.save_image(result[\"stego_image\"], \"stego_output.png\")

# Extract data
extracted = client.extract(
    stego_image=\"stego_output.png\",
    algorithm=\"lsb\",
    password=\"mypassword\"
)

print(f\"Extracted message: {extracted['extracted_data']['content']}\")
```

---

## 📞 Support

For additional help with the API:

- **Interactive Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **GitHub Issues**: Report bugs or request features
- **Email Support**: api-support@your-domain.com

---

**Happy coding with steganography! 🔐✨**
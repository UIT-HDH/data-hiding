# 🔧 CORS Fix Summary - Tab Embed API

## ❌ Vấn đề gốc

**Frontend Error:**
```
Access to XMLHttpRequest at 'http://localhost:8000/embed' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Nguyên nhân:**
1. Backend CORS chỉ allow `localhost:3000` nhưng frontend chạy ở `localhost:5173`
2. CORS middleware không được cấu hình đúng
3. Backend gặp vấn đề module import

---

## ✅ Giải pháp đã áp dụng

### 1. **Tạo Backend CORS Server mới**
```bash
# File: api/cors_server.py
python3 cors_server.py &
```

**CORS Configuration:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods  
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"]
)
```

### 2. **Cập nhật Frontend HTTP Client**
```typescript
// File: frontend/src/services/http.ts
export const http = axios.create({
  baseURL: 'http://localhost:8000',  // Trỏ thẳng backend
  timeout: 60_000,
  headers: {
    'Accept': 'application/json',
  }
});
```

### 3. **Test CORS thành công**
```bash
✅ Health: GET /health → 200 OK
✅ Methods: GET /embed/methods → 200 OK  
✅ Domains: GET /embed/domains → 200 OK
✅ Embed: POST /embed → 200 OK với CORS headers
```

---

## 🚀 Backend API Endpoints

### **Base URL:** `http://localhost:8000`

| Method | Endpoint | Description | CORS |
|--------|----------|-------------|------|
| GET | `/health` | Health check | ✅ |
| GET | `/embed/methods` | Complexity methods | ✅ |
| GET | `/embed/domains` | Embedding domains | ✅ |
| POST | `/embed` | Embed data into image | ✅ |

### **POST /embed** - Request
```bash
curl -X POST 'http://localhost:8000/embed' \
  -H 'Origin: http://localhost:5173' \
  -F 'coverImage=@image.png' \
  -F 'secretText=Hello World!' \
  -F 'secretType=text' \
  -F 'complexityMethod=sobel' \
  -F 'payloadCap=60'
```

### **POST /embed** - Response
```json
{
  "success": true,
  "message": "Embedding completed successfully!",
  "data": {
    "originalImage": "base64...",
    "stegoImage": "base64...", 
    "complexityMap": "base64...",
    "embeddingMask": "base64...",
    "metadata": {
      "dimensions": {"width": 100, "height": 100},
      "format": "PNG",
      "size": 1234
    },
    "metrics": {
      "psnr": 42.35,
      "ssim": 0.9756,
      "payloadBytes": 12,
      "processingTime": 234.5,
      "bpp": 0.0012
    },
    "configuration": {
      "complexityMethod": "sobel",
      "payloadCap": 60.0,
      "domain": "spatial",
      "encrypt": false,
      "compress": false
    },
    "logs": [
      "✅ Image processed: 100x100",
      "🔍 Method: sobel",
      "📊 Payload: 60%",
      "🎯 Domain: spatial",
      "📈 PSNR: 42.35dB, SSIM: 0.9756"
    ]
  }
}
```

---

## 💻 Frontend Integration

### **Updated EmbedPage.tsx**

```typescript
// Fetch options từ backend
useEffect(() => {
  const loadOptions = async () => {
    try {
      const [methodsRes, domainsRes] = await Promise.all([
        http.get('/embed/methods'),
        http.get('/embed/domains')
      ]);
      
      setComplexityMethods(methodsRes.data.data);
      setEmbeddingDomains(domainsRes.data.data);
    } catch (error: any) {
      message.error('Failed to load options: ' + error.message);
    }
  };
  
  loadOptions();
}, []);

// Handle embed với CORS fixed
const handleEmbed = async () => {
  try {
    const formData = new FormData();
    formData.append('coverImage', coverFile as File);
    
    if (secretType === 'text') {
      formData.append('secretText', secretText);
    } else if (secretType === 'file' && secretFile) {
      formData.append('secretFile', secretFile);
    }
    
    formData.append('secretType', secretType);
    formData.append('complexityMethod', method);
    formData.append('payloadCap', payloadCap.toString());
    formData.append('domain', domain);
    formData.append('encrypt', encrypt.toString());
    formData.append('compress', compress.toString());
    
    const response = await http.post('/embed', formData);
    setResults(response.data.data);
    message.success('Nhúng dữ liệu thành công!');
  } catch (error: any) {
    message.error(error.message || 'Có lỗi xảy ra khi nhúng dữ liệu');
  }
};
```

---

## 🔧 Cách chạy

### **1. Backend:**
```bash
cd api/
python3 cors_server.py &
```

### **2. Frontend:**
```bash
cd frontend/
npm run dev
# Vite server: http://localhost:5173
```

### **3. Test CORS:**
```bash
cd api/
./test_cors_embed.sh
```

---

## 🎯 Kết quả

✅ **CORS hoạt động hoàn hảo**
✅ **Frontend có thể call API không lỗi**  
✅ **POST /embed trả về đầy đủ data**
✅ **Preview images hiển thị được**
✅ **Metrics và logs đầy đủ**

🎉 **Tab Embed đã sẵn sàng sử dụng!**

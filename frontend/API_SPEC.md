# API Specification - Simplified Version (Đồ án môn học)

## Base Configuration
```
Base URL: /api/v1
Content-Type: multipart/form-data (cho file uploads)
Timeout: 60 seconds
```

## 🎯 **Core APIs - 4 chức năng chính**

## 🔐 1. POST `/embed` - Nhúng dữ liệu
**Mục đích**: Nhúng secret data vào cover image với adaptive complexity

**Request Body (multipart/form-data)**:
```typescript
{
  coverImage: File,              // Cover image file (PNG/JPG)
  secretText: string,            // Text content to hide (chỉ support text cho đơn giản)
  method: 'sobel' | 'laplacian' | 'variance' | 'entropy',  // Complexity method
  payloadCap?: number,           // Payload capacity % (default: 60)
  password?: string              // Optional encryption password
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    stegoImage: string,          // Base64 encoded stego image
    metrics: {
      psnr: number,              // PSNR (dB)
      ssim: number,              // SSIM
      payload: number,           // Payload size (bytes)
      processingTime: number     // Processing time (ms)
    }
  },
  message: string
}
```

## 🔓 2. POST `/extract` - Giải dữ liệu
**Mục đích**: Giải secret data từ stego image

**Request Body (multipart/form-data)**:
```typescript
{
  stegoImage: File,              // Stego image file
  password?: string              // Decryption password (nếu có)
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    secretText: string,          // Extracted secret text
    processingTime: number       // Processing time (ms)
  },
  message: string,
  error?: {
    code: string,                // 'INVALID_STEGO', 'WRONG_PASSWORD', 'NO_DATA_FOUND'
    message: string
  }
}
```

## 📊 3. POST `/analysis` - Phân tích độ phức tạp
**Mục đích**: Phân tích và tạo complexity maps của ảnh

**Request Body (multipart/form-data)**:
```typescript
{
  image: File                    // Image file to analyze
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    originalImage: {
      width: number,
      height: number,
      size: number               // File size (bytes)
    },
    complexityMaps: {
      sobel: string,             // Base64 encoded Sobel complexity map
      laplacian: string,         // Base64 encoded Laplacian map
      variance: string,          // Base64 encoded Variance map
      entropy: string            // Base64 encoded Entropy map
    },
    statistics: {
      sobel: { mean: number, std: number },
      laplacian: { mean: number, std: number },
      variance: { mean: number, std: number },
      entropy: { mean: number, std: number }
    }
  }
}
```

## 📦 4. POST `/batch` - Xử lý lô đơn giản
**Mục đích**: Xử lý nhiều ảnh cover với cùng secret text

**Request Body (multipart/form-data)**:
```typescript
{
  coverImages: File[],           // Array of cover images (max 10 files)
  secretText: string,            // Same secret text for all
  method: 'sobel' | 'laplacian' | 'variance' | 'entropy',
  password?: string              // Optional password
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    results: Array<{
      filename: string,
      success: boolean,
      stegoImage?: string,       // Base64 if success
      metrics?: {
        psnr: number,
        ssim: number,
        payload: number,
        processingTime: number
      },
      error?: string             // Error message if failed
    }>
  }
}
```

## ⚠️ Error Response Format

```typescript
{
  success: false,
  error: {
    code: string,                // 'VALIDATION_ERROR', 'PROCESSING_ERROR', etc.
    message: string,             // Human readable message
    timestamp: string            // ISO timestamp
  }
}
```

## 🔒 Simplified Constraints

1. **File Limits**:
   - Image files: Max 10MB
   - Secret text: Max 10KB
   - Batch: Max 10 images per request

2. **Supported Formats**:
   - Images: PNG, JPG/JPEG only
   - Secret: Text only (no files)

3. **Processing**:
   - Synchronous processing (no job queues)
   - 30-second timeout per request
   - Simple error messages

## 📝 Implementation Priority

**Implement theo thứ tự**:
1. `POST /embed` - Core embedding functionality
2. `POST /extract` - Core extraction functionality  
3. `POST /analysis` - Complexity analysis demo
4. `POST /batch` - Batch processing demo

## 🎯 Demo Scenarios

**Scenario 1 - Basic Demo**:
1. Upload cover image → `/analysis` → Show 4 complexity maps
2. Input secret text → `/embed` với method 'sobel' → Get stego + metrics
3. Upload stego → `/extract` → Get original text back

**Scenario 2 - Method Comparison**:
1. Same cover + secret → `/embed` với 4 methods khác nhau
2. Compare PSNR/SSIM metrics
3. Visual comparison của stego images

**Scenario 3 - Batch Demo**:
1. Upload 5-10 cover images → `/batch` với same secret
2. Show results table với metrics comparison
3. Demonstrate scalability

---

*Simplified API cho đồ án môn học - focus vào core steganography concepts với adaptive complexity methods.*

---

*Specification này cover tất cả các tính năng hiện tại trong Frontend và có thể mở rộng cho các features tương lai.*

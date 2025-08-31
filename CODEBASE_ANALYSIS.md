# 📊 Codebase Analysis - Hiện tại

## 🏗️ **Cấu trúc tổng quan**

```
data-hiding/
├── api/                    # Backend (FastAPI)
├── frontend/              # Frontend (React + TypeScript + Vite)
├── *.md                   # Documentation files
```

---

## 🔧 **Backend (API) - Cấu trúc hiện tại**

### **Thư mục chính:**
```
api/
├── app/
│   ├── main.py           # FastAPI app + middleware + exceptions
│   ├── api/v1/
│   │   ├── router.py     # API router
│   │   └── endpoints/
│   │       └── embed.py  # Embed endpoint (phức tạp)
│   ├── services/
│   │   └── steganography.py  # Service class lớn (696 lines)
│   ├── models/           # Pydantic models
│   ├── config/           # Settings, environment
│   ├── core/             # Middleware, logging, exceptions
│   └── utils/
├── cors_server.py        # Server đơn giản (đang chạy)
├── requirements.txt      # Dependencies
└── test_*.py            # Test files
```

### **Features phức tạp hiện tại:**
- ✅ **Complexity Methods:** Sobel, Laplacian, Variance, Entropy
- ✅ **Domains:** Spatial-LSB, DCT  
- ✅ **Security:** Encryption, Compression, Password
- ✅ **Advanced Settings:** Payload capacity, min/max BPP, threshold, seed
- ✅ **Additional:** Batch processing, Analysis, Rate curves

### **Dependencies:**
```
fastapi, uvicorn, pydantic, python-multipart
Pillow, numpy, python-jose, passlib
aiofiles, loguru, python-dotenv
```

---

## 🎨 **Frontend - Cấu trúc hiện tại**

### **Thư mục chính:**
```
frontend/
├── src/
│   ├── App.tsx           # Router setup (4 routes)
│   ├── layout/
│   │   └── LayoutShell.tsx  # Navigation + keyboard shortcuts
│   ├── routes/
│   │   ├── EmbedPage.tsx    # Tab Embed (682 lines, phức tạp)
│   │   ├── ExtractPage.tsx  # Tab Extract (284 lines)
│   │   ├── BatchPage.tsx    # Tab Batch
│   │   └── AnalysisPage.tsx # Tab Analysis
│   ├── services/
│   │   └── http.ts       # Axios HTTP client
│   ├── components/       # Shared components
│   └── utils/
├── package.json          # Dependencies
└── vite.config.ts        # Vite config
```

### **Tech Stack:**
- ✅ **React 19** + TypeScript
- ✅ **Ant Design 5** (UI components)
- ✅ **TanStack Router** (routing)
- ✅ **Vite** (build tool)
- ✅ **Axios** (HTTP client)
- ✅ **Recoil** (state management)

### **UI Features hiện tại:**
- ✅ **4 Tabs:** Embed, Extract, Batch, Analysis
- ✅ **EmbedPage:** Upload, secret input, security options, adaptive settings, domain selection, PRNG, results with metrics
- ✅ **ExtractPage:** Upload stego, mock extraction logic
- ✅ **LayoutShell:** Navigation, theme, keyboard shortcuts

---

## 🎯 **Mục tiêu Refactor**

### **Backend - Đơn giản hóa:**
❌ **Loại bỏ:**
- Entropy, Laplacian, Variance methods
- DCT domain 
- Batch processing, Analysis endpoints
- Compression, Encryption
- Advanced settings (payload %, seed, rate curves)

✅ **Giữ lại:**
- **Sobel filter** cho phân tích độ phức tạp
- **Adaptive LSB:** Low complexity → 1 bit, High → 2 bit
- **Text embedding/extraction** đơn giản
- **PSNR, SSIM** metrics cơ bản

✅ **Kết quả:** 2 API endpoints:
- `POST /embed` - Input: image + text → Output: stego image
- `POST /extract` - Input: stego image → Output: text

### **Frontend - Đơn giản hóa:**
❌ **Loại bỏ:**
- Batch, Analysis tabs
- Advanced settings UI
- Complex preview modes
- Rate curve editor

✅ **Giữ lại:**
- **2 tabs:** Embed, Extract
- **Basic UI:** Upload, text input, results display
- **Simple workflow:** Upload → Input → Process → Result

---

## 📋 **Kế hoạch thực hiện**

### **Phase 1: Backend Refactor**
1. Tạo `simple_backend.py` mới với:
   - Sobel edge detection function
   - Adaptive LSB embedding (1-2 bit)
   - Text extraction logic
   - PSNR/SSIM calculation
   - 2 FastAPI endpoints only

### **Phase 2: Frontend Refactor**  
1. Sửa `App.tsx` - remove Batch, Analysis routes
2. Đơn giản hóa `EmbedPage.tsx` - chỉ giữ upload + text input
3. Đơn giản hóa `ExtractPage.tsx` - chỉ upload + text output
4. Cập nhật `LayoutShell.tsx` - chỉ 2 menu items

### **Phase 3: Cleanup**
1. Xóa unused files, dependencies
2. Thêm comments rõ ràng cho Sobel + Adaptive LSB
3. Update documentation

---

## ⚡ **Kết quả mong đợi**

**Backend:** Từ ~1000 lines → ~200-300 lines code gọn
**Frontend:** Từ 4 tabs phức tạp → 2 tabs đơn giản
**Dependencies:** Giảm thiểu chỉ giữ essential packages
**Functionality:** Core steganography demo đơn giản, dễ hiểu

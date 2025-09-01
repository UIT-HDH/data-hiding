# 🚀 HƯỚNG DẪN CHẠY CODEBASE - Data Hiding Project

## 📋 Tổng quan

Dự án Data Hiding với Adaptive LSB Steganography bao gồm:
- **Backend**: Python FastAPI với thuật toán Sobel Edge Detection + Adaptive LSB
- **Frontend**: React TypeScript với Ant Design UI
- **Tính năng chính**: Embed/Extract text vào/từ ảnh

---

## ⚡ Cách chạy nhanh nhất

### Option 1: Script tự động (Khuyến nghị)
```bash
# Chạy script tự động setup và start
./setup_and_run.sh

# Các lệnh khác:
./setup_and_run.sh status  # Kiểm tra trạng thái
./setup_and_run.sh logs    # Xem logs
./setup_and_run.sh stop    # Dừng tất cả
./setup_and_run.sh restart # Restart
```

### Option 2: Chạy thủ công

#### Bước 1: Setup Backend
```bash
cd api

# Tạo virtual environment
python3 -m venv venv

# Kích hoạt virtual environment
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy backend
python3 simple_backend.py
```

#### Bước 2: Setup Frontend (Terminal mới)
```bash
cd frontend

# Cài đặt dependencies
pnpm install

# Chạy frontend
pnpm dev
```

#### Bước 3: Truy cập ứng dụng
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🔧 Prerequisites

### Backend Requirements
- **Python 3.9+** (khuyến nghị Python 3.11)
- **pip** để quản lý packages
- **Virtual environment** (khuyến nghị)

### Frontend Requirements
- **Node.js 18+** (khuyến nghị Node.js 20)
- **pnpm** (khuyến nghị) hoặc **npm**
- **Git** để clone repository

### Kiểm tra prerequisites
```bash
# Kiểm tra Python
python3 --version  # Cần 3.9+

# Kiểm tra Node.js
node --version     # Cần 18+

# Kiểm tra pnpm
pnpm --version     # Nếu chưa có: npm install -g pnpm
```

---

## 📁 Cấu trúc dự án

```
data-hiding/
├── api/                          # Backend
│   ├── simple_backend.py         # Main backend server
│   ├── requirements.txt          # Python dependencies
│   ├── start_backend.sh          # Backend startup script
│   ├── test_simple_backend.py    # Backend tests
│   └── venv/                     # Virtual environment
├── frontend/                     # Frontend
│   ├── src/
│   │   ├── routes/
│   │   │   └── EmbedPage.tsx     # Main embed page
│   │   └── services/
│   │       └── http.ts           # HTTP client
│   ├── package.json              # Node dependencies
│   └── dist/                     # Build output
├── setup_and_run.sh              # Auto setup script
├── QUICK_START.md                # Hướng dẫn nhanh
└── README.md                     # Documentation đầy đủ
```

---

## 🎯 Demo Workflow

### 1. Upload ảnh cover
- Chọn ảnh PNG/JPG từ máy tính
- Kéo thả hoặc click để upload
- Xem preview ảnh

### 2. Nhập text cần giấu
- Nhập text vào textarea
- Giới hạn 1000 ký tự
- Xem character counter

### 3. Embed dữ liệu
- Click nút "Embed Text vào Image"
- Chờ xử lý (1-3 giây)
- Xem kết quả với metrics

### 4. Download và test
- Download ảnh stego
- Upload ảnh stego vào tab Extract
- Kiểm tra text được extract

---

## 🔍 Troubleshooting

### Backend Issues

**Lỗi: `ModuleNotFoundError: No module named 'fastapi'`**
```bash
cd api
source venv/bin/activate
pip install -r requirements.txt
```

**Lỗi: `Port 8000 is already in use`**
```bash
# Tìm và kill process
lsof -ti:8000 | xargs kill -9

# Hoặc dùng script
./setup_and_run.sh stop
```

**Lỗi: `Permission denied`**
```bash
chmod +x setup_and_run.sh
chmod +x api/start_backend.sh
```

### Frontend Issues

**Lỗi: `npm error Cannot read properties of null`**
```bash
cd frontend
rm -rf node_modules package-lock.json
pnpm install
```

**Lỗi: `UNMET DEPENDENCY recoil`**
```bash
cd frontend
pnpm add recoil
```

**Lỗi: `Port 5173 is already in use`**
```bash
# Kill process hoặc dùng port khác
lsof -ti:5173 | xargs kill -9
# Hoặc
pnpm dev --port 3000
```

### CORS Issues

**Lỗi: `Access to XMLHttpRequest blocked by CORS policy`**
```bash
# Kiểm tra CORS configuration trong backend
# Đảm bảo frontend URL được thêm vào cors_origins
```

---

## 🧪 Testing

### Test Backend
```bash
cd api
python3 test_simple_backend.py
```

### Test Frontend
```bash
cd frontend
pnpm run lint
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Test embed
curl -X POST http://localhost:8000/embed \
  -F "coverImage=@test_image.jpg" \
  -F "secretText=Hello World"
```

---

## 📊 Monitoring

### Kiểm tra trạng thái
```bash
# Kiểm tra services
./setup_and_run.sh status

# Xem logs
./setup_and_run.sh logs

# Kiểm tra ports
lsof -i :8000  # Backend
lsof -i :5173  # Frontend
```

### Logs locations
- **Backend logs**: `api/simple_backend.log`
- **Frontend logs**: `frontend/frontend.log`
- **System logs**: `api/backend.pid`, `frontend/frontend.pid`

---

## 🚀 Production Deployment

### Backend Production
```bash
cd api
source venv/bin/activate

# Build và chạy production server
uvicorn simple_backend:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Production
```bash
cd frontend

# Build production bundle
pnpm build

# Serve static files
pnpm preview
# Hoặc dùng nginx/apache để serve dist/ folder
```

---

## 🔧 Environment Configuration

### Backend Environment (.env trong api/)
```bash
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true
LOG_LEVEL=INFO
```

### Frontend Environment (.env trong frontend/)
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_MAX_FILE_SIZE=10485760
VITE_MAX_BATCH_FILES=10
VITE_UPLOAD_TIMEOUT=30000
```

---

## 📞 Hỗ trợ

### Kiểm tra nhanh
1. **Python version**: `python3 --version` (cần 3.9+)
2. **Node version**: `node --version` (cần 18+)
3. **Backend logs**: `tail -f api/simple_backend.log`
4. **Frontend console**: F12 trong browser

### Common Commands
```bash
# Setup toàn bộ
./setup_and_run.sh

# Kiểm tra status
./setup_and_run.sh status

# Restart services
./setup_and_run.sh restart

# Stop tất cả
./setup_and_run.sh stop
```

---

## 🎉 Kết luận

Với hướng dẫn này, bạn có thể:
1. **Setup nhanh** với script tự động
2. **Chạy development** với hot reload
3. **Debug issues** với troubleshooting guide
4. **Deploy production** với hướng dẫn chi tiết

**Happy Coding! 🚀**

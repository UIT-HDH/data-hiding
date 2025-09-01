# 🚀 HƯỚNG DẪN CHẠY NHANH - Data Hiding System

## ✅ Vấn đề đã được giải quyết

- ✅ **Backend**: Đã setup virtual environment và cài đặt dependencies
- ✅ **Frontend**: Đã cài đặt dependencies với pnpm
- ✅ **CORS**: Đã cấu hình cho phép cross-origin requests
- ✅ **API**: Đã test thành công với curl

## 🚀 Cách chạy hệ thống

### Option 1: Script tự động (Khuyến nghị)
```bash
# Chạy toàn bộ hệ thống
./run_system.sh

# Các lệnh khác:
./run_system.sh status  # Kiểm tra trạng thái
./run_system.sh stop    # Dừng tất cả
```

### Option 2: Chạy thủ công

#### Terminal 1: Backend
```bash
cd api
source venv/bin/activate
python3 simple_backend.py
```

#### Terminal 2: Frontend
```bash
cd frontend
pnpm dev
```

## 🌐 Truy cập ứng dụng

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🧪 Test hệ thống

### Test Backend
```bash
# Health check
curl http://localhost:8000/health

# Test embed API
curl -X POST http://localhost:8000/embed \
  -F "coverImage=@api/test_image.png" \
  -F "secretText=Hello World"
```

### Test Frontend
1. Mở browser: http://localhost:5173
2. Upload ảnh test
3. Nhập text
4. Click "Embed"
5. Download stego image

## 🔧 Troubleshooting

### Nếu Backend không chạy
```bash
cd api
source venv/bin/activate
pip install -r requirements.txt
python3 simple_backend.py
```

### Nếu Frontend không chạy
```bash
cd frontend
pnpm install
pnpm dev
```

### Nếu port bị chiếm
```bash
# Kill process trên port 8000
lsof -ti:8000 | xargs kill -9

# Kill process trên port 5173
lsof -ti:5173 | xargs kill -9
```

## 📊 Kiểm tra trạng thái

```bash
# Kiểm tra backend
curl http://localhost:8000/health

# Kiểm tra frontend
curl http://localhost:5173

# Kiểm tra processes
ps aux | grep simple_backend
ps aux | grep vite
```

## 🎯 Demo Workflow

1. **Upload ảnh cover** (PNG/JPG)
2. **Nhập text** cần giấu
3. **Click "Embed"** → Xem processing
4. **Download stego image**
5. **Upload stego image** vào tab Extract
6. **Verify extracted text**

## 🎉 Kết quả mong đợi

- ✅ **PSNR**: >40 dB (chất lượng tốt)
- ✅ **SSIM**: >0.9 (độ tương đồng cao)
- ✅ **Processing time**: 1-3 giây
- ✅ **Extraction accuracy**: 100%

---

**Hệ thống đã sẵn sàng cho demo! 🚀**

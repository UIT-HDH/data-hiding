# 🚀 QUICK START GUIDE - Data Hiding Project

## ⚡ Chạy nhanh trong 5 phút

### 1. Setup Backend
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

### 2. Setup Frontend (Terminal mới)
```bash
cd frontend

# Cài đặt dependencies
pnpm install

# Chạy frontend
pnpm dev
```

### 3. Truy cập ứng dụng
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🔧 Troubleshooting Nhanh

### Backend Issues
```bash
# Lỗi: ModuleNotFoundError
pip install -r requirements.txt

# Lỗi: Port đã sử dụng
lsof -ti:8000 | xargs kill -9

# Lỗi: Permission denied
chmod +x start_backend.sh
```

### Frontend Issues
```bash
# Lỗi: npm error
rm -rf node_modules package-lock.json
pnpm install

# Lỗi: Port đã sử dụng
pnpm dev --port 3000
```

---

## 📋 Checklist Kiểm tra

- [ ] Backend chạy tại http://localhost:8000
- [ ] Frontend chạy tại http://localhost:5173
- [ ] API health check: `curl http://localhost:8000/health`
- [ ] Upload ảnh cover thành công
- [ ] Nhúng text thành công
- [ ] Download stego image thành công

---

## 🎯 Demo Workflow

1. **Upload ảnh cover** (PNG/JPG)
2. **Nhập text** cần giấu
3. **Click "Embed"** để nhúng dữ liệu
4. **Xem kết quả** với metrics PSNR/SSIM
5. **Download** ảnh stego
6. **Test extract** với ảnh stego vừa tạo

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Python version: `python3 --version` (cần 3.9+)
2. Node version: `node --version` (cần 18+)
3. Backend logs: `tail -f api/simple_backend.log`
4. Frontend console: F12 trong browser

---

**Happy Coding! 🎉**

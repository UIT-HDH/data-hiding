# 🚀 Frontend - Hệ Thống Xử Lý Giấu Tin

## 📋 Tổng Quan

Frontend của hệ thống xử lý giấu tin được xây dựng bằng React + TypeScript + Ant Design, cung cấp giao diện người dùng hoàn toàn bằng tiếng Việt cho các chức năng steganography.

## 🌟 Tính Năng Chính

### 1. 🔒 **Trang Nhúng Dữ Liệu (EmbedPage)**
- **Tải lên ảnh cover**: Hỗ trợ PNG, JPG, JPEG
- **Nhập tin nhắn bí mật**: Text area với giới hạn 1000 ký tự
- **Thuật toán**: Sobel Edge Detection + Adaptive LSB (1-2 bit)
- **Kết quả**: Ảnh stego + chỉ số chất lượng + download
- **Chỉ số**: PSNR, SSIM, độ dài text, kích thước ảnh

### 2. 🔓 **Trang Giải Mã (ExtractPage)**
- **Tải lên ảnh stego**: Ảnh đã được nhúng dữ liệu
- **Tùy chọn bảo mật**: Mật khẩu, hạt giống PRNG
- **Miền xử lý**: Miền không gian hoặc miền DCT
- **Kết quả**: Text/file được giải mã + copy/download

### 3. 📦 **Trang Xử Lý Hàng Loạt (BatchPage)**
- **Upload nhiều ảnh**: Xử lý đồng thời nhiều file
- **Cấu hình**: Phương pháp phức tạp, dung lượng tối đa
- **Theo dõi tiến độ**: Progress bar và bảng kết quả
- **Xuất kết quả**: Export CSV với đầy đủ metrics

### 4. 🔍 **Trang Phân Tích (AnalysisPage)**
- **Phân tích độ phức tạp**: Sobel, Laplacian, Variance, Entropy
- **Bản đồ độ phức tạp**: Visualization các phương pháp
- **Trình chỉnh sửa đường cong**: Tinh chỉnh ngưỡng BPP
- **Xem trước BPP**: Bits Per Pixel map

## 🎨 Giao Diện Người Dùng

### **Thiết Kế Responsive**
- Layout 2 cột trên desktop, 1 cột trên mobile
- Sidebar có thể thu gọn (Ctrl+B)
- Theme màu xanh dương chuyên nghiệp

### **Phím Tắt**
- `Ctrl + E`: Kích hoạt nhúng dữ liệu
- `Ctrl + X`: Kích hoạt giải mã
- `Ctrl + S`: Lưu ảnh stego
- `Ctrl + P`: Xem trước overlay

### **Ngôn Ngữ**
- **100% tiếng Việt**: Tất cả label, title, placeholder
- **Thuật ngữ kỹ thuật**: Được dịch sang tiếng Việt dễ hiểu
- **Thông báo**: Success/error messages bằng tiếng Việt

## 🛠️ Công Nghệ Sử Dụng

### **Frontend Framework**
- **React 18**: Hooks, functional components
- **TypeScript**: Type safety, interfaces
- **Ant Design**: UI components, icons, layout

### **Routing & State**
- **TanStack Router**: Modern routing solution
- **React Context**: Theme management
- **Local Storage**: User preferences

### **Build Tools**
- **Vite**: Fast build tool
- **ESLint**: Code quality
- **PNPM**: Package manager

## 📁 Cấu Trúc Thư Mục

```
frontend/src/
├── components/          # Components tái sử dụng
├── contexts/           # React contexts
├── layout/             # Layout components
├── routes/             # Page components
│   ├── EmbedPage.tsx   # Trang nhúng dữ liệu
│   ├── ExtractPage.tsx # Trang giải mã
│   ├── BatchPage.tsx   # Trang xử lý hàng loạt
│   └── AnalysisPage.tsx# Trang phân tích
├── services/           # API services
├── store/              # State management
├── utils/              # Utility functions
└── assets/             # Static assets
```

## 🚀 Khởi Chạy

### **Cài đặt dependencies**
```bash
cd frontend
pnpm install
```

### **Chạy development server**
```bash
pnpm dev
```

### **Build production**
```bash
pnpm build
```

### **Preview production build**
```bash
pnpm preview
```

## 🔧 Cấu Hình

### **Environment Variables**
- `VITE_API_BASE_URL`: URL của backend API
- `VITE_APP_TITLE`: Tiêu đề ứng dụng

### **Theme Customization**
- Màu chủ đạo: `#1d2769` (xanh dương đậm)
- Border radius: `6px` (bo góc vừa phải)
- Font family: System default

## 📱 Responsive Design

### **Breakpoints**
- **xs**: < 576px (Mobile)
- **sm**: ≥ 576px (Tablet)
- **md**: ≥ 768px (Desktop nhỏ)
- **lg**: ≥ 992px (Desktop)
- **xl**: ≥ 1200px (Desktop lớn)

### **Layout Adaptation**
- Sidebar tự động thu gọn trên mobile
- Menu items hiển thị tooltip khi thu gọn
- Content area responsive với padding phù hợp

## 🌐 Internationalization

### **Tiếng Việt (100%)**
- ✅ Tất cả labels và titles
- ✅ Placeholder text
- ✅ Button text
- ✅ Error messages
- ✅ Success notifications
- ✅ Table headers
- ✅ Form labels

### **Thuật Ngữ Kỹ Thuật**
- **Steganography** → Giấu tin
- **Embed** → Nhúng
- **Extract** → Giải mã
- **Cover Image** → Ảnh gốc
- **Stego Image** → Ảnh stego
- **Complexity Analysis** → Phân tích độ phức tạp

## 🔒 Bảo Mật

### **Input Validation**
- File type validation (chỉ PNG/JPG)
- File size limits
- Text length validation
- Secure file handling

### **API Security**
- HTTPS requests
- CORS handling
- Error message sanitization

## 📊 Performance

### **Optimization**
- Lazy loading components
- Image optimization
- Bundle splitting
- Tree shaking

### **Monitoring**
- Console logging cho debugging
- Error boundary handling
- Performance metrics

## 🧪 Testing

### **Test Files**
- `test_frontend_connection.js`: Test kết nối API
- `test_embed_tab.py`: Test chức năng nhúng
- `test_cors_embed.sh`: Test CORS

### **Manual Testing**
- Upload/download files
- Form validation
- Error handling
- Responsive design

## 🚧 Roadmap

### **Phase 1: Core Features** ✅
- [x] Việt hóa toàn bộ UI
- [x] Responsive design
- [x] Basic CRUD operations
- [x] File upload/download

### **Phase 2: Advanced Features** 🔄
- [ ] Real-time progress tracking
- [ ] Advanced error handling
- [ ] User preferences
- [ ] Export/import settings

### **Phase 3: Optimization** 📋
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] PWA support
- [ ] Offline capabilities

## 🤝 Đóng Góp

### **Coding Standards**
- TypeScript strict mode
- ESLint rules
- Prettier formatting
- Conventional commits

### **Development Workflow**
1. Fork repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit pull request

## 📄 License

Dự án học tập - Không sử dụng cho mục đích thương mại.

## 👥 Tác Giả

**Sinh viên**: Đào Nguyễn  
**Môn học**: Data Hiding  
**Trường**: Đại học Công nghệ Thông tin  
**Năm**: 2024

---

*Hệ thống xử lý giấu tin với giao diện tiếng Việt hoàn chỉnh* 🇻🇳

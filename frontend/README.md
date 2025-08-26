# Hệ thống xử lý giấu tin — Adaptive Image Complexity

## Tổng quan

Đây là giao diện web cho hệ thống xử lý giấu tin thích ứng theo độ phức tạp ảnh (Adaptive Image Steganography). Hệ thống cho phép nhúng và giải thông tin bí mật vào/từ ảnh cover bằng các phương pháp phân tích độ phức tạp khác nhau.

## Công nghệ sử dụng

### Frontend Stack
- **React 19** - Thư viện UI chính
- **TypeScript** - Ngôn ngữ lập trình với type safety
- **Ant Design 5** - Thư viện UI components
- **TanStack Router** - Router hiện đại cho React
- **Recoil** - State management (dự phòng)
- **Vite** - Build tool và dev server
- **Axios** - HTTP client

### Styling & Theme
- **Ant Design ConfigProvider** - Cấu hình theme tùy chỉnh
- **CSS-in-JS** - Inline styles với Ant Design tokens

## Tính năng chính

### 🔐 1. Nhúng dữ liệu (Embed)
- **Upload ảnh cover**: Hỗ trợ PNG, JPG
- **Secret input**: Text hoặc file
- **Phương pháp phức tạp**:
  - Sobel Edge Detection
  - Laplacian Filter  
  - Variance Analysis
  - Entropy Calculation
- **Cấu hình**:
  - Payload capacity (10-90%)
  - Seed/PRNG cho randomization
  - Mã hóa (mặc định: ON)
  - Nén dữ liệu (mặc định: OFF)
  - Domain: Spatial/DCT
- **Preview modes**: Stego, Complexity, BPP, Mask
- **Metrics**: PSNR, SSIM, Payload size, Processing time

### 🔓 2. Giải dữ liệu (Extract)
- **Upload ảnh stego**: PNG, JPG
- **Cấu hình giải mã**: Password, Seed, Domain
- **Kết quả**: Text (với copy) hoặc File (với download)
- **Error handling**: Thông báo lỗi khi không giải được

### 📦 3. Xử lý lô (Batch Processing)
- **Multiple file upload**: Chọn nhiều ảnh cover cùng lúc
- **Cấu hình chung**: Method, payload cap, seed, encrypt/compress
- **Progress tracking**: Theo dõi tiến độ xử lý
- **Results table**: Filename, payload, PSNR, SSIM, time, status
- **Export CSV**: Xuất kết quả ra file CSV

### 📊 4. Phân tích ảnh (Analysis)
- **Complexity maps**: 4 phương pháp phân tích độ phức tạp
- **BPP threshold**: Điều chỉnh ngưỡng bits per pixel (1-8)
- **Curve Editor**: Placeholder cho fine-tuning
- **Interactive preview**: Xem trước các map complexity

## Giao diện người dùng

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│                    Header                           │
│  [Menu Toggle] Hệ thống xử lý giấu tin...  [User]  │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  Sidebar │              Content Area                │
│          │                                          │
│  - Nhúng │         (Dynamic page content)           │
│  - Giải  │                                          │
│  - Chạy lô│                                         │
│  - Phân tích│                                       │
│          │                                          │
│ [Phím tắt]│                                        │
└──────────┴──────────────────────────────────────────┘
```

### Theme Configuration
```typescript
{
  token: {
    colorPrimary: '#1d2769',
    colorSuccess: '#52c41a', 
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 6,
  },
  components: {
    Layout: { headerBg: '#ffffff', siderBg: '#ffffff', bodyBg: '#f5f5f5' },
    Menu: { itemSelectedBg: '#e6f7ff', itemSelectedColor: '#1d2769' },
    Card: { borderRadius: 8 },
  }
}
```

### Keyboard Shortcuts
- `Ctrl+B`: Toggle sidebar
- `Ctrl+E`: Execute embed (trên trang Nhúng)
- `Ctrl+X`: Execute extract (trên trang Giải) 
- `Ctrl+S`: Save/Download stego
- `Ctrl+P`: Preview overlay toggle

## Environment Configuration

Create `.env` file in project root:
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Development Settings  
VITE_MAX_FILE_SIZE=10485760  # 10MB in bytes
VITE_MAX_BATCH_FILES=10
VITE_UPLOAD_TIMEOUT=30000    # 30 seconds
```

Update `src/services/http.ts` for production:
```typescript
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: parseInt(import.meta.env.VITE_UPLOAD_TIMEOUT) || 60000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

## Cài đặt và chạy

### Prerequisites
- Node.js 18+ 
- pnpm (khuyến nghị) hoặc npm

### Installation
```bash
# Clone repository
git clone <repository-url>
cd adaptive-stego-frontend

# Install dependencies  
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Development Server
```bash
pnpm dev
```
Ứng dụng sẽ chạy tại `http://localhost:5173` (hoặc port khác nếu 5173 đã sử dụng)

## Cấu trúc dự án

```
src/
├── components/          # Shared components
├── contexts/           # React contexts
├── layout/            
│   └── LayoutShell.tsx # Main layout với sidebar, header
├── routes/            # Page components
│   ├── EmbedPage.tsx   # Trang nhúng dữ liệu  
│   ├── ExtractPage.tsx # Trang giải dữ liệu
│   ├── BatchPage.tsx   # Trang xử lý lô
│   └── AnalysisPage.tsx# Trang phân tích ảnh
├── services/          
│   └── http.ts        # Axios HTTP client
├── store/             # State management
├── utils/             # Utility functions  
├── App.tsx            # App root với routing
└── main.tsx           # Entry point
```

## API Integration

### Mock Implementation
Hiện tại các trang sử dụng mock data và mock processing:
- `mockEmbed()`: Giả lập quá trình nhúng dữ liệu
- `mockExtract()`: Giả lập quá trình giải dữ liệu  
- `mockBatchProcess()`: Giả lập xử lý lô
- `mockAnalyze()`: Giả lập phân tích độ phức tạp

### Backend API Specification
Backend cần implement 4 API endpoints chính để thay thế mock functions:

#### 🔐 1. `POST /api/v1/embed` - Nhúng dữ liệu
**Màn hình sử dụng**: `EmbedPage.tsx` - Trang "Nhúng"

**UI Components kết nối**:
- Cover image upload (Dragger component)
- Secret text input (TextArea)  
- Method selection (Select: Sobel/Laplacian/Variance/Entropy)
- Payload capacity slider (10-90%)
- Password input (optional)
- "Nhúng" button → gọi API này

**Request**:
```typescript
{
  coverImage: File,              // Từ upload component
  secretText: string,            // Từ TextArea
  method: 'sobel' | 'laplacian' | 'variance' | 'entropy',
  payloadCap?: number,           // Từ slider (default: 60)
  password?: string              // Từ password input
}
```

**Response được hiển thị**:
- `stegoImage` → Preview trong Image component bên trái
- `metrics.psnr` → "PSNR: 45.2 dB" trong Results section
- `metrics.ssim` → "SSIM: 0.987" trong Results section  
- `metrics.payload` → "Payload: 5.2 KB" trong Results section
- `metrics.processingTime` → "Time: 1.2s" trong Results section

#### 🔓 2. `POST /api/v1/extract` - Giải dữ liệu
**Màn hình sử dụng**: `ExtractPage.tsx` - Trang "Giải"

**UI Components kết nối**:
- Stego image upload (Dragger component)
- Password input (Form.Item với Input.Password)
- "Giải" button → gọi API này

**Request**:
```typescript
{
  stegoImage: File,              // Từ upload component
  password?: string              // Từ form field
}
```

**Response được hiển thị**:
- `secretText` → TextArea read-only với nút Copy
- `processingTime` → "Thời gian xử lý: 0.8s"
- Nếu error → Hiển thị error message trong error state

#### 📊 3. `POST /api/v1/analysis` - Phân tích độ phức tạp
**Màn hình sử dụng**: `AnalysisPage.tsx` - Trang "Phân tích"

**UI Components kết nối**:
- Image upload (Dragger component)
- "Phân tích" button → gọi API này
- Tabs component hiển thị 4 complexity maps

**Request**:
```typescript
{
  image: File                    // Từ upload component
}
```

**Response được hiển thị**:
- `complexityMaps.sobel` → Tab "Sobel Edge" với Image component
- `complexityMaps.laplacian` → Tab "Laplacian" với Image component
- `complexityMaps.variance` → Tab "Variance" với Image component  
- `complexityMaps.entropy` → Tab "Entropy" với Image component
- `originalImage.width/height/size` → Metadata hiển thị

#### 📦 4. `POST /api/v1/batch` - Xử lý lô
**Màn hình sử dụng**: `BatchPage.tsx` - Trang "Chạy lô"

**UI Components kết nối**:
- Multiple files upload (Dragger với `multiple=true`)
- Method selection (Select component)
- Payload cap slider
- "Chạy lô" button → gọi API này
- Results table (Table component)

**Request**:
```typescript
{
  coverImages: File[],           // Từ multiple upload
  secretText: string,            // Fixed text for all images
  method: 'sobel' | 'laplacian' | 'variance' | 'entropy',
  password?: string
}
```

**Response được hiển thị**:
- `results[]` → Map vào Table rows:
  - `filename` → Column "Filename"
  - `metrics.payload` → Column "Payload" 
  - `metrics.psnr` → Column "PSNR"
  - `metrics.ssim` → Column "SSIM"
  - `metrics.processingTime` → Column "Time"
  - `success/error` → Column "Status" với color coding

### UI-API Mapping Details

**EmbedPage State → API Call**:
```typescript
const handleEmbed = async () => {
  const formData = new FormData()
  formData.append('coverImage', coverFile)
  formData.append('secretText', secretText)
  formData.append('method', method)
  formData.append('payloadCap', payloadCap.toString())
  if (password) formData.append('password', password)
  
  const response = await http.post('/embed', formData)
  setResults(response.data) // Update UI metrics
}
```

**ExtractPage State → API Call**:
```typescript
const handleExtract = async () => {
  const formData = new FormData()
  formData.append('stegoImage', stegoFile)
  if (password) formData.append('password', password)
  
  const response = await http.post('/extract', formData)
  setResults(response.data) // Show extracted text
}
```

**AnalysisPage State → API Call**:
```typescript
const handleAnalysis = async () => {
  const formData = new FormData()
  formData.append('image', uploadedFile)
  
  const response = await http.post('/analysis', formData)
  setComplexityMaps(response.data.complexityMaps) // Update tabs
}
```

**BatchPage State → API Call**:
```typescript
const handleBatchProcess = async () => {
  const formData = new FormData()
  coverFiles.forEach(file => formData.append('coverImages', file))
  formData.append('secretText', 'Demo secret text')
  formData.append('method', method)
  
  const response = await http.post('/batch', formData)
  setResults(response.data.results) // Update table
}
```

## Features Detail

### Responsive Design
- **Desktop**: Sidebar 250px, 2-column layout (10/14 grid)
- **Mobile**: Collapsible sidebar, stacked layout (24/24 grid)
- **Adaptive**: Sidebar tự động thu gọn, lưu state vào localStorage

### State Management
- **Local State**: React useState cho component state
- **Persistent State**: localStorage cho sidebar collapse
- **Form State**: Ant Design Form cho form validation
- **Ready for Global State**: Recoil đã setup sẵn

### Error Handling
- **Upload validation**: File type, size checking
- **Form validation**: Required fields, format validation
- **API errors**: Toast notifications với Ant Design message
- **Processing errors**: Graceful error states với retry options

## Development Guidelines

### Code Style
- **TypeScript strict mode**: Đầy đủ type definitions
- **Component pattern**: Functional components với hooks
- **Naming convention**: camelCase, PascalCase cho components
- **File organization**: Feature-based folder structure

### Performance Optimizations
- **React.Suspense**: Lazy loading cho routes
- **Image optimization**: Base64 preview, size limits
- **Ant Design tree-shaking**: Import specific components
- **Vite optimizations**: Fast HMR, efficient bundling

### Backend Implementation Guide

**Technology Stack Recommendations**:
- **Framework**: FastAPI (Python) hoặc Express.js (Node.js)
- **Image Processing**: OpenCV (Python) hoặc Sharp (Node.js)
- **File Storage**: Local filesystem với cleanup job
- **Request Validation**: Pydantic (Python) hoặc Joi (Node.js)

**Key Implementation Points**:

1. **File Upload Handling**:
```python
# FastAPI example
@app.post("/api/v1/embed")
async def embed_data(
    coverImage: UploadFile = File(...),
    secretText: str = Form(...),
    method: str = Form(...),
    payloadCap: Optional[int] = Form(60),
    password: Optional[str] = Form(None)
):
    # Validate image format
    # Process steganography embedding
    # Return base64 stego image + metrics
```

2. **Error Handling**:
```python
# Consistent error response format
{
  "success": false,
  "error": {
    "code": "INVALID_IMAGE_FORMAT",
    "message": "Only PNG and JPEG formats are supported",
    "timestamp": "2025-08-26T10:30:00Z"
  }
}
```

3. **Steganography Processing**:
- Implement 4 complexity analysis methods
- Calculate PSNR/SSIM metrics
- Handle password encryption/decryption
- Support adaptive embedding based on complexity maps

4. **File Management**:
```python
# Auto cleanup temporary files
import os, time
def cleanup_old_files(directory: str, max_age_minutes: int = 60):
    current_time = time.time()
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if current_time - os.path.getctime(filepath) > max_age_minutes * 60:
            os.remove(filepath)
```

## Roadmap

### Phase 1 - Core Functions ✅
- [x] Layout structure với sidebar navigation
- [x] Embed page với upload và preview
- [x] Extract page với result display  
- [x] Batch processing với progress tracking
- [x] Analysis page với complexity maps

### Phase 2 - API Integration 🚧
- [ ] Implement `/api/v1/embed` endpoint
- [ ] Implement `/api/v1/extract` endpoint  
- [ ] Implement `/api/v1/analysis` endpoint
- [ ] Implement `/api/v1/batch` endpoint
- [ ] Replace mock functions với real API calls
- [ ] Add proper error handling và loading states
- [ ] File upload progress indicators

### Phase 3 - Advanced Features 🔮
- [ ] Curve editor implementation
- [ ] Real-time preview updates
- [ ] Batch result comparison
- [ ] Export/import configurations
- [ ] User authentication
- [ ] Multi-language support

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`  
5. Create Pull Request

## License

[MIT License](LICENSE) - Xem file LICENSE để biết thêm chi tiết.

## Contact

- **Author**: [Tên tác giả]
- **Email**: [Email liên hệ]  
- **Project**: IE406 - Data Hiding Course
- **Institution**: [Tên trường/khoa]

---

*Dự án được phát triển trong khuôn khổ môn học IE406 - Data Hiding, ứng dụng các phương pháp steganography hiện đại với giao diện web thân thiện.*

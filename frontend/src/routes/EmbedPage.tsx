import React from 'react'
import {
  Row,
  Col,
  Card,
  Upload,
  Button,
  Input,
  message,
  Typography,
  Image,
  Space,
  Alert,
  Divider
} from 'antd'
import {
  InboxOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { http } from '../services/http'

const { Dragger } = Upload
const { TextArea } = Input
const { Text, Title } = Typography

/**
 * Interface cho kết quả từ Simple Backend API
 */
interface SimpleEmbedResult {
  stegoImage: string // Base64 encoded PNG
  complexityMap: string // Base64 encoded complexity map
  embeddingMask: string // Base64 encoded embedding mask
  metrics: {
    psnr: number
    ssim: number
    textLength: number
    binaryLength: number
    imageSize: string
    capacityInfo: {
      total_bytes: number
      bits_per_pixel: number
      low_complexity_percentage: number
      high_complexity_percentage: number
      threshold: number
    }
  }
  algorithm: {
    name: string
    complexity_method: string
    embedding_strategy: string
    channel: string
    data_processing: string
  }
}

/**
 * EmbedPage - Phiên bản đơn giản
 * 
 * Chức năng:
 * 1. Upload ảnh cover (PNG/JPG)
 * 2. Nhập text cần giấu
 * 3. Gọi API /embed từ simple_backend.py
 * 4. Hiển thị ảnh stego + metrics + download
 * 
 * Thuật toán: Sobel Edge Detection + Adaptive LSB (1-2 bit)
 */
export default function EmbedPage() {
  // =============================================================================
  // State Management
  // =============================================================================
  const [coverFile, setCoverFile] = React.useState<File | null>(null)
  const [coverPreview, setCoverPreview] = React.useState<string>('')
  const [secretText, setSecretText] = React.useState<string>('')
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false)
  const [results, setResults] = React.useState<SimpleEmbedResult | null>(null)

  // =============================================================================
  // Helper Functions
  // =============================================================================

  /**
   * Xử lý upload ảnh cover
   */
  const handleCoverUpload = (info: any) => {
    const { file } = info
    if (file.status !== 'uploading') {
      const uploadedFile = file.originFileObj || file
      setCoverFile(uploadedFile)
      
      // Tạo preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(uploadedFile)
    }
  }

  /**
   * Download ảnh stego từ base64
   */
  const downloadStegoImage = () => {
    if (!results?.stegoImage) return
    
    try {
      // Convert base64 to blob
      const byteCharacters = atob(results.stegoImage)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })
      
      // Tạo download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `stego_image_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      message.success('Đã tải xuống ảnh stego!')
    } catch (error) {
      message.error('Lỗi khi tải xuống ảnh')
    }
  }

  /**
   * Kiểm tra có thể embed không
   */
  const canEmbed = coverFile && secretText.trim().length > 0 && !isProcessing

  // =============================================================================
  // Main Embed Function
  // =============================================================================

  /**
   * Gọi API embed từ simple_backend.py
   */
  const handleEmbed = async () => {
    if (!canEmbed) return
    
    setIsProcessing(true)
    setResults(null)

    try {
      // Tạo FormData cho multipart/form-data
      const formData = new FormData()
      formData.append('coverImage', coverFile!)
      formData.append('secretText', secretText)

      console.log('📤 Sending embed request...')
      console.log('Cover image:', coverFile!.name, coverFile!.size, 'bytes')
      console.log('Secret text length:', secretText.length, 'characters')

      // Gọi API simple_backend
      const response = await http.post('/embed', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setResults(response.data.data)
        message.success('✅ Nhúng dữ liệu thành công!')
        console.log('✅ Embed successful:', response.data.data)
      } else {
        throw new Error(response.data.message || 'Embed failed')
      }

    } catch (error: any) {
      console.error('❌ Embed error:', error)
      
      if (error.message) {
        message.error(`Lỗi: ${error.message}`)
      } else if (error.response?.data?.detail) {
        message.error(`Lỗi: ${error.response.data.detail}`)
      } else {
      message.error('Có lỗi xảy ra khi nhúng dữ liệu')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // =============================================================================
  // Render UI
  // =============================================================================

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={2}>
          🔒 Steganography - Nhúng Dữ Liệu
        </Title>
        <Text type="secondary">
          Giấu text vào ảnh bằng thuật toán <strong>Sobel Edge Detection + Adaptive LSB</strong>
        </Text>
        <br />
        <Text type="secondary">
          Vùng phẳng: 1-bit LSB | Vùng phức tạp: 2-bit LSB | Channel: Blue (ít nhạy cảm nhất)
        </Text>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Column: Input */}
        <Col xs={24} lg={12}>
          {/* Upload Cover Image */}
          <Card title="📁 Tải Lên Ảnh Cover" style={{ marginBottom: 24 }}>
              <Dragger
              name="coverImage"
              multiple={false}
              accept="image/*"
              beforeUpload={() => false} // Prevent auto upload
                onChange={handleCoverUpload}
              style={{ marginBottom: 16 }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                Kéo thả ảnh vào đây hoặc click để chọn
                </p>
                <p className="ant-upload-hint">
                Hỗ trợ: PNG, JPG, JPEG
                </p>
              </Dragger>
              
            {coverPreview && (
              <div style={{ textAlign: 'center' }}>
                <Image
                  src={coverPreview}
                  alt="Xem Trước Ảnh Cover"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    {coverFile?.name} ({Math.round((coverFile?.size || 0) / 1024)} KB)
                  </Text>
                </div>
              </div>
            )}
          </Card>

          {/* Secret Text Input */}
          <Card title="✏️ Nhập Secret Text">
            <TextArea
              placeholder="Nhập text cần giấu vào ảnh..."
              value={secretText}
              onChange={(e) => setSecretText(e.target.value)}
              rows={6}
              showCount
              maxLength={1000}
              style={{ marginBottom: 16 }}
            />
            
            <Alert
              message="Lưu Ý"
              description="Text sẽ được encode UTF-8 → binary → nhúng vào channel Blue của ảnh. Dung lượng text phụ thuộc vào kích thước ảnh cover."
              type="info"
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: 16 }}
            />

            {/* Embed Button */}
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={handleEmbed}
              disabled={!canEmbed}
              loading={isProcessing}
              block
            >
              {isProcessing ? 'Đang xử lý...' : 'Nhúng Text vào Ảnh'}
            </Button>
          </Card>
        </Col>

        {/* Right Column: Results */}
        <Col xs={24} lg={12}>
          {results ? (
            <>
              {/* Stego Image Result */}
              <Card 
                title="🖼️ Kết Quả Ảnh Stego" 
                style={{ marginBottom: 24 }}
                extra={
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={downloadStegoImage}
                  >
                    Tải Xuống
                  </Button>
                }
              >
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Image
                    src={`data:image/png;base64,${results.stegoImage}`}
                    alt="Ảnh Stego"
                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1xkE8Cb+"
                  />
                </div>
                <Text type="secondary">
                  Ảnh stego đã được tạo với text được nhúng bằng Adaptive LSB
                </Text>
              </Card>

              {/* Metrics */}
              <Card title="📊 Chỉ Số Chất Lượng">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>PSNR (Tỷ Lệ Tín Hiệu-Nhiễu Đỉnh): </Text>
                    <Text type="success">{results.metrics.psnr} dB</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Chất lượng ảnh (càng cao càng tốt, lớn hơn 40dB = tốt)
                    </Text>
                  </div>

                  <div>
                    <Text strong>SSIM (Độ Tương Đồng Cấu Trúc): </Text>
                    <Text type="success">{results.metrics.ssim}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Độ tương đồng cấu trúc (0-1, càng gần 1 càng tốt)
                    </Text>
                  </div>

                  <Divider />

                  <div>
                    <Text strong>Độ Dài Text: </Text>
                    <Text>{results.metrics.textLength} ký tự</Text>
                  </div>

                  <div>
                    <Text strong>Độ Dài Binary: </Text>
                    <Text>{results.metrics.binaryLength} bit</Text>
                  </div>

                  <div>
                    <Text strong>Kích Thước Ảnh: </Text>
                    <Text>{results.metrics.imageSize}</Text>
                  </div>
                </Space>
              </Card>

              {/* Algorithm Info */}
              <Card title="🔬 Chi Tiết Thuật Toán" style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Phương Pháp: </Text>
                    <Text>{results.algorithm.name}</Text>
                  </div>
                  
                  <div>
                    <Text strong>Phân Tích Độ Phức Tạp: </Text>
                    <Text>{results.algorithm.complexity_method}</Text>
                  </div>
                  
                  <div>
                    <Text strong>Chiến Lược Nhúng: </Text>
                    <Text>{results.algorithm.embedding_strategy}</Text>
                  </div>
                  
                  <div>
                    <Text strong>Kênh Màu: </Text>
                    <Text>{results.algorithm.channel}</Text>
                  </div>
                  
                  <div>
                    <Text strong>Xử Lý Dữ Liệu: </Text>
                    <Text>{results.algorithm.data_processing}</Text>
                  </div>
                </Space>
              </Card>

              {/* Capacity Analysis */}
              <Card title="📊 Phân Tích Dung Lượng" style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Dung Lượng Tối Đa: </Text>
                    <Text type="success">{results.metrics.capacityInfo.total_bytes} bytes</Text>
                  </div>
                  
                  <div>
                    <Text strong>Bits Per Pixel: </Text>
                    <Text type="secondary">{results.metrics.capacityInfo.bits_per_pixel}</Text>
                  </div>
                  
                  <div>
                    <Text strong>Vùng Đơn Giản (1-bit): </Text>
                    <Text>{results.metrics.capacityInfo.low_complexity_percentage.toFixed(1)}%</Text>
                  </div>
                  
                  <div>
                    <Text strong>Vùng Phức Tạp (2-bit): </Text>
                    <Text>{results.metrics.capacityInfo.high_complexity_percentage.toFixed(1)}%</Text>
                  </div>
                  
                  <div>
                    <Text strong>Ngưỡng Complexity: </Text>
                    <Text>{results.metrics.capacityInfo.threshold}</Text>
                  </div>
                </Space>
              </Card>

              {/* Visualizations */}
              <Card title="🖼️ Phân Tích Hình Ảnh" style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Complexity Map:</Text>
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                      <Image
                        src={`data:image/png;base64,${results.complexityMap}`}
                        alt="Complexity Map"
                        style={{ maxWidth: '100%', maxHeight: '150px' }}
                      />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Dark = đơn giản, Bright = phức tạp
                      </Text>
              </div>
            </div>

                  <Divider />
                  
                  <div>
                    <Text strong>Embedding Mask:</Text>
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                      <Image
                        src={`data:image/png;base64,${results.embeddingMask}`}
                        alt="Embedding Mask"
                        style={{ maxWidth: '100%', maxHeight: '150px' }}
                      />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        White = 2-bit LSB, Gray = 1-bit LSB
                      </Text>
                    </div>
                  </div>
                </Space>
              </Card>
            </>
          ) : (
            /* Placeholder when no results */
            <Card title="📊 Kết Quả" style={{ textAlign: 'center', minHeight: '400px' }}>
              <div style={{ padding: '60px 20px' }}>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Tải lên ảnh cover và nhập text để bắt đầu
                </Text>
                <br />
                <br />
                <Text type="secondary">
                  Kết quả nhúng sẽ hiển thị ở đây
                </Text>
              </div>
            </Card>
            )}
        </Col>
      </Row>
    </div>
  )
}
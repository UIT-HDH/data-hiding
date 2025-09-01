import React from 'react'
import {
  Card,
  Upload,
  Button,
  message,
  Typography,
  Row,
  Col,
  Image,
  Tabs,
  Slider,
} from 'antd'
import {
  InboxOutlined,
  EyeOutlined,
} from '@ant-design/icons'

const { Dragger } = Upload
const { Text } = Typography
const { TabPane } = Tabs

export default function AnalysisPage() {
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)
  const [uploadedPreview, setUploadedPreview] = React.useState<string>('')
  const [complexityMaps, setComplexityMaps] = React.useState<any>(null)
  const [bppThreshold, setBppThreshold] = React.useState(3)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  const handleFileUpload = (info: any) => {
    const { file } = info
    if (file.status !== 'uploading') {
      setUploadedFile(file.originFileObj || file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedPreview(e.target?.result as string)
        // Auto-analyze when file is uploaded
        mockAnalyze()
      }
      reader.readAsDataURL(file.originFileObj || file)
    }
  }

  const mockAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      // Mock processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock complexity maps (different base64 images for each method)
      setComplexityMaps({
        sobel: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/58BAQAChAKDB4Z7GQAAAABJRU5ErkJggg==',
        laplacian: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/AAADAAQAAAAAAaFFJRU5ErkJggg==',
        variance: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPjPwAABzAAA/TaAJWTMv6kAAAAASUVORK5CYII=',
        entropy: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        bpp: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPi/DwAChwG8t7P3SwAAAABJRU5ErkJggg==',
      })
      
      message.success('Phân tích ảnh hoàn thành!')
    } catch (error) {
      message.error('Có lỗi xảy ra khi phân tích ảnh')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setUploadedFile(null)
    setUploadedPreview('')
    setComplexityMaps(null)
  }

  const getMockBppMap = () => {
    // Return different BPP map based on threshold
    return complexityMaps?.bpp || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPi/DwAChwG8t7P3SwAAAABJRU5ErkJggg=='
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Upload Section */}
        <Col span={24}>
          <Card title="Tải Lên Ảnh Phân Tích">
            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Dragger
                  accept=".png,.jpg,.jpeg"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleFileUpload}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    {uploadedFile ? uploadedFile.name : 'Click hoặc kéo thả ảnh để tải lên'}
                  </p>
                  <p className="ant-upload-hint">
                    Hỗ trợ định dạng PNG, JPG để phân tích độ phức tạp
                  </p>
                </Dragger>
                
                {uploadedFile && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    {uploadedFile.name} - {Math.round(uploadedFile.size / 1024)}KB
                  </div>
                )}
                
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    loading={isAnalyzing}
                    disabled={!uploadedFile}
                    onClick={mockAnalyze}
                  >
                    Phân Tích
                  </Button>
                  <Button onClick={handleReset}>
                    Làm Mới
                  </Button>
                </div>
              </Col>
              
              {/* Original Image Preview */}
              <Col xs={24} lg={12}>
                {uploadedPreview && (
                  <div>
                    <Text strong>Ảnh gốc:</Text>
                    <div style={{ marginTop: 8, textAlign: 'center', maxHeight: 300, overflow: 'auto' }}>
                      <Image
                        src={uploadedPreview}
                        style={{ maxWidth: '100%', maxHeight: 280 }}
                        placeholder="Đang tải..."
                      />
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Complexity Maps */}
        {complexityMaps && (
          <Col span={24}>
            <Card title="Bản Đồ Độ Phức Tạp">
              <Tabs defaultActiveKey="sobel" type="card">
                <TabPane tab="Phát Hiện Biên Sobel" key="sobel">
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={complexityMaps.sobel}
                      style={{ maxWidth: '100%', maxHeight: 400 }}
                      placeholder="Đang tải bản đồ Sobel..."
                    />
                    <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                      Phát Hiện Biên Sobel - Phát hiện biên cạnh trong ảnh
                    </div>
                  </div>
                </TabPane>
                
                <TabPane tab="Bộ Lọc Laplacian" key="laplacian">
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={complexityMaps.laplacian}
                      style={{ maxWidth: '100%', maxHeight: 400 }}
                      placeholder="Đang tải bản đồ Laplacian..."
                    />
                    <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                      Bộ Lọc Laplacian - Phát hiện vùng có độ thay đổi cường độ cao
                    </div>
                  </div>
                </TabPane>
                
                <TabPane tab="Phân Tích Phương Sai" key="variance">
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={complexityMaps.variance}
                      style={{ maxWidth: '100%', maxHeight: 400 }}
                      placeholder="Đang tải bản đồ Phương Sai..."
                    />
                    <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                      Phân Tích Phương Sai - Phân tích độ biến thiên cục bộ
                    </div>
                  </div>
                </TabPane>
                
                <TabPane tab="Tính Toán Entropy" key="entropy">
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={complexityMaps.entropy}
                      style={{ maxWidth: '100%', maxHeight: 400 }}
                      placeholder="Đang tải bản đồ Entropy..."
                    />
                    <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                      Tính Toán Entropy - Đo lường thông tin cục bộ
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        )}

        {/* Curve Editor & BPP Preview */}
        {complexityMaps && (
          <Col span={24}>
            <Card title="Trình Chỉnh Sửa Đường Cong & Xem Trước BPP">
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <div>
                    <Text strong>Ngưỡng BPP:</Text>
                    <div style={{ marginTop: 8 }}>
                      <Slider
                        min={1}
                        max={8}
                        value={bppThreshold}
                        onChange={setBppThreshold}
                        marks={{
                          1: '1',
                          2: '2',
                          3: '3',
                          4: '4',
                          5: '5',
                          6: '6',
                          7: '7',
                          8: '8',
                        }}
                      />
                      <div style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
                        Ngưỡng hiện tại: {bppThreshold} bpp
                      </div>
                    </div>
                  </div>
                  
                  {/* Placeholder for Curve Editor */}
                  <div
                    style={{
                      marginTop: 24,
                      border: '2px dashed #d9d9d9',
                      borderRadius: 6,
                      padding: 40,
                      textAlign: 'center',
                      color: '#999',
                    }}
                  >
                    <Text>Trình Chỉnh Sửa Đường Cong</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Trình chỉnh sửa đường cong tương tác để tinh chỉnh ngưỡng độ phức tạp
                    </Text>
                  </div>
                </Col>
                
                <Col xs={24} lg={12}>
                  <div>
                    <Text strong>Xem Trước Bản Đồ BPP:</Text>
                    <div style={{ marginTop: 8, textAlign: 'center' }}>
                      <Image
                        src={getMockBppMap()}
                        style={{ maxWidth: '100%', maxHeight: 300 }}
                        placeholder="Đang tải bản đồ BPP..."
                      />
                      <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                        Bản đồ Bits Per Pixel với ngưỡng {bppThreshold}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  )
}

import React from 'react'
import {
  Card,
  Upload,
  Button,
  Input,
  Form,
  message,
  Typography,
  Row,
  Col,
  Image,
  Space,
  Alert
} from 'antd'
import {
  InboxOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  CopyOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { http } from '../services/http'

const { Dragger } = Upload
const { TextArea } = Input
const { Text } = Typography

export default function ExtractPage() {
  const [form] = Form.useForm()
  const [stegoFile, setStegoFile] = React.useState<File | null>(null)
  const [stegoPreview, setStegoPreview] = React.useState<string>('')
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [results, setResults] = React.useState<any>(null)

  const canExtract = stegoFile

  const handleStegoUpload = (info: any) => {
    const { file } = info
    if (file.status !== 'uploading') {
      const uploadedFile = file.originFileObj || file
      setStegoFile(uploadedFile)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setStegoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(uploadedFile)
    }
  }

  const handleExtract = async () => {
    if (!canExtract) return
    
    setIsProcessing(true)
    setResults(null)
    
    try {
      const formData = new FormData()
      formData.append('stegoImage', stegoFile!)
      
      const response = await http.post('/api/v1/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.success) {
        setResults({
          type: 'text',
          content: response.data.extractedKey,
          success: true,
          time: `${response.data.processingTime}s`,
          imageInfo: response.data.imageInfo
        })
        message.success('✅ Giải mã dữ liệu thành công!')
      } else {
        throw new Error(response.data.message || 'Extract failed')
      }
    } catch (error: any) {
      console.error('Extract error:', error)
      const errorMsg = error.response?.data?.detail || error.message || 'Không thể giải mã dữ liệu từ ảnh này'
      
      setResults({
        type: 'error',
        success: false,
        message: errorMsg,
        time: '0.0s',
      })
      message.error(`❌ ${errorMsg}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setStegoFile(null)
    setStegoPreview('')
    setResults(null)
    form.resetFields()
  }

  const handleCopyText = () => {
    if (results?.content) {
      navigator.clipboard.writeText(results.content)
      message.success('Đã copy nội dung!')
    }
  }

  const mockDownloadFile = () => {
    if (results?.fileName) {
      message.info(`Mock download: ${results.fileName}`)
    }
  }


  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Left Column - Input Form */}
        <Col xs={24} lg={12}>
          <Card title="📤 Tải Ảnh Stego" style={{ height: '100%' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleExtract}
            >
              {/* Stego Upload */}
              <Form.Item label="Tải Lên Ảnh Stego" required>
                <Dragger
                  accept=".png,.jpg,.jpeg"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleStegoUpload}
                >
                  {stegoPreview ? (
                    <div style={{ padding: '10px' }}>
                      <img
                        src={stegoPreview}
                        alt="Stego preview"
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px' }}
                      />
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                        📷 {stegoFile?.name}
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                      </p>
                      <p className="ant-upload-text">
                        Click hoặc kéo thả ảnh stego để tải lên
                      </p>
                      <p className="ant-upload-hint">
                        Hỗ trợ định dạng PNG, JPG, JPEG
                      </p>
                    </>
                  )}
                </Dragger>
                
                {stegoFile && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    {stegoFile.name} - {Math.round(stegoFile.size / 1024)}KB
                  </div>
                )}
              </Form.Item>


              {/* Action Buttons */}
              <Form.Item>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    loading={isProcessing}
                    disabled={!canExtract}
                    onClick={handleExtract}
                  >
                    Giải Mã
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    Làm Mới
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Column - Results */}
        <Col xs={24} lg={12}>
          <Card title="🔓 Kết Quả Giải Mã" style={{ height: '100%' }}>
            {!results ? (
              <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
                <Text>Chưa có kết quả. Tải ảnh stego và nhấn "Giải Mã" để bắt đầu.</Text>
              </div>
            ) : (
              <>
                {/* Processing Time */}
                <div style={{ marginBottom: 16, fontSize: 12, color: '#666' }}>
                  Thời gian xử lý: {results.time}
                </div>

                {results.success ? (
                  <>
                    {/* Image Info */}
                    {results.imageInfo && (
                      <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px', fontSize: '12px', color: '#666' }}>
                        <Text strong>📏 Thông tin ảnh:</Text> {results.imageInfo.size} • <Text strong>📝 Độ dài text:</Text> {results.imageInfo.extractedLength} ký tự
                      </div>
                    )}
                    
                    {/* Text Result */}
                    {results.type === 'text' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <Text strong>🔓 Nội dung giải được:</Text>
                          <Button
                            type="link"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={handleCopyText}
                          >
                            Sao Chép
                          </Button>
                        </div>
                        <TextArea
                          value={results.content}
                          rows={6}
                          readOnly
                          style={{ marginBottom: 16, fontFamily: 'monospace' }}
                        />
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          ✅ Đã giải mã thành công <Text strong>{results.imageInfo?.extractedLength || results.content?.length || 0}</Text> ký tự từ ảnh stego
                        </div>
                      </div>
                    )}

                    {/* File Result */}
                    {results.type === 'file' && (
                      <div>
                        <Text strong>File giải được:</Text>
                        <div
                          style={{
                            border: '1px dashed #d9d9d9',
                            borderRadius: 6,
                            padding: 16,
                            textAlign: 'center',
                            marginTop: 8,
                            marginBottom: 16,
                          }}
                        >
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>{results.fileName}</Text>
                          </div>
                          <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
                            Kích thước: {results.fileSize}
                          </div>
                          <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={mockDownloadFile}
                          >
                            Tải Xuống
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Error Result */
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <div style={{ color: '#ff4d4f', marginBottom: 8 }}>
                      <Text strong>Lỗi giải mã</Text>
                    </div>
                    <Text>{results.message}</Text>
                  </div>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

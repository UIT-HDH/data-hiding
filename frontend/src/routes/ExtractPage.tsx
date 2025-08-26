import React from 'react'
import {
  Card,
  Upload,
  Button,
  Input,
  Form,
  message,
  Typography,
  Select,
  Row,
  Col,
} from 'antd'
import {
  InboxOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  CopyOutlined,
  DownloadOutlined,
} from '@ant-design/icons'

const { Dragger } = Upload
const { TextArea } = Input
const { Text } = Typography

export default function ExtractPage() {
  const [form] = Form.useForm()
  const [stegoFile, setStegoFile] = React.useState<File | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [results, setResults] = React.useState<any>(null)

  const canExtract = stegoFile

  const handleStegoUpload = (info: any) => {
    const { file } = info
    if (file.status !== 'uploading') {
      setStegoFile(file.originFileObj || file)
    }
  }

  const mockExtract = async () => {
    if (!canExtract) return
    
    setIsProcessing(true)
    try {
      // Mock processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock results - randomly return text or file
      const isTextResult = Math.random() > 0.5
      
      setResults({
        type: isTextResult ? 'text' : 'file',
        content: isTextResult 
          ? 'Đây là nội dung bí mật được giải từ ảnh stego. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
          : null,
        fileName: isTextResult ? null : 'secret_document.txt',
        fileSize: isTextResult ? null : '1.2 KB',
        time: '0.8s',
        success: true,
      })
      
      message.success('Giải mã dữ liệu thành công!')
    } catch (error) {
      setResults({
        type: 'error',
        success: false,
        message: 'Không thể giải mã dữ liệu từ ảnh này',
        time: '0.5s',
      })
      message.error('Có lỗi xảy ra khi giải mã dữ liệu')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setStegoFile(null)
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

  const generateSeed = () => {
    form.setFieldsValue({
      seed: Math.random().toString(36).substring(2, 10)
    })
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Left Column - Input Form */}
        <Col xs={24} lg={12}>
          <Card title="Thông tin giải mã" style={{ height: '100%' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={mockExtract}
            >
              {/* Stego Upload */}
              <Form.Item label="Upload Stego Image" required>
                <Dragger
                  accept=".png,.jpg,.jpeg"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleStegoUpload}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    {stegoFile ? stegoFile.name : 'Click or drag stego image to upload'}
                  </p>
                  <p className="ant-upload-hint">
                    Supports PNG, JPG formats
                  </p>
                </Dragger>
                
                {stegoFile && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    {stegoFile.name} - {Math.round(stegoFile.size / 1024)}KB
                  </div>
                )}
              </Form.Item>

              {/* Password */}
              <Form.Item 
                name="password" 
                label="Password (optional)"
              >
                <Input.Password placeholder="Enter password if used during embedding" />
              </Form.Item>

              {/* Seed/PRNG */}
              <Form.Item 
                name="seed" 
                label="Seed/PRNG"
              >
                <Input
                  placeholder="Enter seed used during embedding"
                  addonAfter={
                    <Button type="link" size="small" onClick={generateSeed}>
                      Tạo
                    </Button>
                  }
                />
              </Form.Item>

              {/* Domain */}
              <Form.Item 
                name="domain" 
                label="Domain"
                initialValue="spatial"
              >
                <Select
                  options={[
                    { label: 'Spatial Domain', value: 'spatial' },
                    { label: 'DCT Domain', value: 'dct' },
                  ]}
                />
              </Form.Item>

              {/* Action Buttons */}
              <Form.Item>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    loading={isProcessing}
                    disabled={!canExtract}
                    onClick={mockExtract}
                  >
                    Giải
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    Reset
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Column - Results */}
        <Col xs={24} lg={12}>
          <Card title="Kết quả" style={{ height: '100%' }}>
            {!results ? (
              <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
                <Text>Chưa có kết quả. Upload ảnh stego và nhấn "Giải" để bắt đầu.</Text>
              </div>
            ) : (
              <>
                {/* Processing Time */}
                <div style={{ marginBottom: 16, fontSize: 12, color: '#666' }}>
                  Thời gian xử lý: {results.time}
                </div>

                {results.success ? (
                  <>
                    {/* Text Result */}
                    {results.type === 'text' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <Text strong>Nội dung giải được:</Text>
                          <Button
                            type="link"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={handleCopyText}
                          >
                            Copy
                          </Button>
                        </div>
                        <TextArea
                          value={results.content}
                          rows={8}
                          readOnly
                          style={{ marginBottom: 16 }}
                        />
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
                            Download
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

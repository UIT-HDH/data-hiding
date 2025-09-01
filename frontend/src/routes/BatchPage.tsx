import React from 'react'
import {
  Card,
  Upload,
  Button,
  Select,
  Table,
  Progress,
  message,
  Typography,
  Row,
  Col,
  Checkbox,
  Input,
  Slider,
} from 'antd'
import {
  InboxOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
} from '@ant-design/icons'

const { Dragger } = Upload
const { Text } = Typography

interface BatchResult {
  key: string
  filename: string
  payload: string
  psnr: string
  ssim: string
  time: string
  status: 'pending' | 'processing' | 'success' | 'error'
}

export default function BatchPage() {
  const [coverFiles, setCoverFiles] = React.useState<File[]>([])
  const [method, setMethod] = React.useState('sobel')
  const [payloadCap, setPayloadCap] = React.useState(60)
  const [seed, setSeed] = React.useState('')
  const [encrypt, setEncrypt] = React.useState(true)
  const [compress, setCompress] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [results, setResults] = React.useState<BatchResult[]>([])

  const canProcess = coverFiles.length > 0

  const handleFilesUpload = (info: any) => {
    const files = info.fileList.map((file: any) => file.originFileObj || file)
    setCoverFiles(files)
    
    // Initialize results table
    const initialResults: BatchResult[] = files.map((file: File, index: number) => ({
      key: index.toString(),
      filename: file.name,
      payload: '-',
      psnr: '-',
      ssim: '-',
      time: '-',
      status: 'pending',
    }))
    setResults(initialResults)
  }

  const generateSeed = () => {
    setSeed(Math.random().toString(36).substring(2, 10))
  }

  const mockBatchProcess = async () => {
    if (!canProcess) return
    
    setIsProcessing(true)
    setProgress(0)
    
    try {
      for (let i = 0; i < results.length; i++) {
        // Update current item to processing
        setResults(prev => 
          prev.map((item, index) => 
            index === i ? { ...item, status: 'processing' as const } : item
          )
        )
        
        // Mock processing time per file
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
        
        // Mock success/error (90% success rate)
        const success = Math.random() > 0.1
        
        // Update result
        setResults(prev => 
          prev.map((item, index) => {
            if (index === i) {
              if (success) {
                return {
                  ...item,
                  payload: `${(Math.random() * 10 + 5).toFixed(1)} KB`,
                  psnr: `${(Math.random() * 10 + 40).toFixed(1)} dB`,
                  ssim: `0.${(Math.random() * 50 + 950).toFixed(0)}`,
                  time: `${(Math.random() * 2 + 1).toFixed(1)}s`,
                  status: 'success' as const,
                }
              } else {
                return {
                  ...item,
                  payload: 'Lỗi',
                  psnr: 'Lỗi',
                  ssim: 'Lỗi',
                  time: `${(Math.random() * 0.5 + 0.5).toFixed(1)}s`,
                  status: 'error' as const,
                }
              }
            }
            return item
          })
        )
        
        // Update progress
        const currentProgress = Math.round(((i + 1) / results.length) * 100)
        setProgress(currentProgress)
      }
      
      message.success('Xử lý hàng loạt hoàn thành!')
    } catch (error) {
      message.error('Có lỗi xảy ra trong quá trình xử lý hàng loạt')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setCoverFiles([])
    setResults([])
    setProgress(0)
    setSeed('')
  }

  const mockExportCSV = () => {
    if (results.length === 0) return
    
    message.info('Mock export results to CSV')
  }

  const columns = [
    {
      title: 'Tên File',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: true,
    },
    {
      title: 'Dữ Liệu',
      dataIndex: 'payload',
      key: 'payload',
      width: 100,
    },
    {
      title: 'PSNR',
      dataIndex: 'psnr',
      key: 'psnr',
      width: 100,
    },
    {
      title: 'SSIM',
      dataIndex: 'ssim',
      key: 'ssim',
      width: 100,
    },
    {
      title: 'Thời Gian',
      dataIndex: 'time',
      key: 'time',
      width: 80,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: BatchResult['status']) => {
        const statusConfig = {
          pending: { color: '#d9d9d9', text: 'Chờ xử lý' },
          processing: { color: '#1890ff', text: 'Đang xử lý...' },
          success: { color: '#52c41a', text: 'Thành công' },
          error: { color: '#ff4d4f', text: 'Lỗi' },
        }
        const config = statusConfig[status]
        return (
          <span style={{ color: config.color }}>
            {config.text}
          </span>
        )
      },
    },
  ]

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Configuration Panel */}
        <Col span={24}>
          <Card title="Cấu Hình Xử Lý Hàng Loạt">
            <Row gutter={[16, 16]}>
              {/* File Upload */}
              <Col xs={24} lg={12}>
                <Text strong>Tải Lên Ảnh Cover:</Text>
                <Dragger
                  accept=".png,.jpg,.jpeg"
                  multiple
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleFilesUpload}
                  style={{ marginTop: 8 }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click hoặc kéo thả nhiều ảnh để tải lên
                  </p>
                  <p className="ant-upload-hint">
                    Hỗ trợ định dạng PNG, JPG (chọn nhiều)
                  </p>
                </Dragger>
                
                {coverFiles.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    {coverFiles.length} files được chọn (
                    {Math.round(coverFiles.reduce((sum, f) => sum + f.size, 0) / 1024)}KB tổng cộng)
                  </div>
                )}
              </Col>

              {/* Configuration Options */}
              <Col xs={24} lg={12}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Method Selection */}
                  <div>
                    <Text strong>Phương pháp phức tạp:</Text>
                    <Select
                      value={method}
                      onChange={setMethod}
                      style={{ width: '100%', marginTop: 4 }}
                      options={[
                        { label: 'Phát Hiện Biên Sobel', value: 'sobel' },
                        { label: 'Bộ Lọc Laplacian', value: 'laplacian' },
                        { label: 'Phân Tích Phương Sai', value: 'variance' },
                        { label: 'Tính Toán Entropy', value: 'entropy' },
                      ]}
                    />
                  </div>

                  {/* Payload Cap */}
                  <div>
                    <Text strong>Dung lượng tối đa (%):</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <Slider
                        style={{ flex: 1 }}
                        min={10}
                        max={90}
                        value={payloadCap}
                        onChange={setPayloadCap}
                      />
                      <Text>{payloadCap}%</Text>
                    </div>
                  </div>

                  {/* Seed */}
                  <div>
                    <Text strong>Hạt giống/PRNG:</Text>
                    <Input
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder="Nhập hạt giống"
                      style={{ marginTop: 4 }}
                      addonAfter={
                        <Button type="link" size="small" onClick={generateSeed}>
                          Tạo
                        </Button>
                      }
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <Checkbox checked={encrypt} onChange={(e) => setEncrypt(e.target.checked)}>
                      Mã hóa (mặc định: BẬT)
                    </Checkbox>
                    <br />
                    <Checkbox
                      checked={compress}
                      onChange={(e) => setCompress(e.target.checked)}
                      style={{ marginTop: 8 }}
                    >
                      Nén (mặc định: TẮT)
                    </Checkbox>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Action Buttons */}
            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={isProcessing}
                disabled={!canProcess}
                onClick={mockBatchProcess}
              >
                Chạy Lô
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Làm Mới
              </Button>
              <Button
                icon={<ExportOutlined />}
                onClick={mockExportCSV}
                disabled={results.length === 0 || results.every(r => r.status === 'pending')}
              >
                Xuất CSV
              </Button>
            </div>
          </Card>
        </Col>

        {/* Progress & Results */}
        <Col span={24}>
          <Card title="Tiến Độ & Kết Quả">
            {/* Progress */}
            {isProcessing && (
              <div style={{ marginBottom: 16 }}>
                <Text>Đang xử lý... ({progress}%)</Text>
                <Progress percent={progress} status="active" style={{ marginTop: 8 }} />
              </div>
            )}

            {/* Results Table */}
            <Table
              columns={columns}
              dataSource={results}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 600 }}
              size="small"
              locale={{
                emptyText: results.length === 0 ? 'Chưa có file nào được tải lên' : 'Không có dữ liệu',
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

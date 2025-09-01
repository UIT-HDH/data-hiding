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
  Divider,
  Statistic,
  Progress,
  Tabs
} from 'antd'
import {
  InboxOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { http } from '../services/http'

const { Dragger } = Upload
const { TextArea } = Input
const { Text, Title } = Typography
const { TabPane } = Tabs

/**
 * Enhanced Interface cho Backend API Response
 */
interface EmbedResult {
  stegoImage: string
  complexityMap: string
  embeddingMask: string
  metrics: {
    psnr: number
    ssim: number
    text_length_chars: number
    text_length_bytes: number
    binary_length_bits: number
    image_size: string
  }
  embeddingInfo: {
    total_capacity: number
    data_embedded: number
    utilization: number
    complexity_threshold: number
    algorithm: string
  }
  capacityAnalysis: {
    total_capacity_bits: number
    total_capacity_bytes: number
    total_capacity_chars: number
    average_bpp: number
    high_complexity_blocks: number
    low_complexity_blocks: number
    total_blocks: number
    complexity_threshold: number
    high_complexity_percentage: number
    low_complexity_percentage: number
    utilization_1bit: number
    utilization_2bit: number
  }
  algorithmInfo: {
    method: string
    complexity_analysis: string
    adaptive_strategy: string
    embedding_domain: string
    data_processing: string
  }
  processingTime: number
  timestamp: string
}

/**
 * EmbedPage Enhanced - Academic Version
 * Đồ án môn học: Data Hiding với Adaptive LSB Steganography
 */
export default function EmbedPageEnhanced() {
  // =============================================================================
  // State Management  
  // =============================================================================
  const [coverFile, setCoverFile] = React.useState<File | null>(null)
  const [coverPreview, setCoverPreview] = React.useState<string>('')
  const [secretText, setSecretText] = React.useState<string>('')
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false)
  const [results, setResults] = React.useState<EmbedResult | null>(null)

  // =============================================================================
  // Helper Functions
  // =============================================================================

  const handleCoverUpload = (info: any) => {
    const { file } = info
    if (file.status !== 'uploading') {
      const uploadedFile = file.originFileObj || file
      setCoverFile(uploadedFile)

      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(uploadedFile)
    }
  }

  const downloadStegoImage = () => {
    if (!results?.stegoImage) return

    try {
      const base64Data = results.stegoImage.replace(/^data:image\/[^;]+;base64,/, '')
      const byteArray = new Uint8Array(atob(base64Data).split('').map(char => char.charCodeAt(0)))
      const blob = new Blob([byteArray], { type: 'image/png' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `stego_image_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      message.success('🎉 Stego image downloaded!')
    } catch (error) {
      message.error('❌ Download failed')
    }
  }

  const canEmbed = coverFile && secretText.trim().length > 0 && !isProcessing

  const handleEmbed = async () => {
    if (!canEmbed) return

    setIsProcessing(true)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append('coverImage', coverFile!)
      formData.append('secretText', secretText)

      const response = await http.post('/api/v1/embed', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        setResults(response.data.data)
        message.success('✅ Text embedded successfully!')
      } else {
        throw new Error(response.data.message || 'Embedding failed')
      }
    } catch (error: any) {
      console.error('Embed error:', error)
      const errorMsg = error.response?.data?.detail || error.message || 'Network error occurred'
      message.error(`❌ ${errorMsg}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // =============================================================================
  // Render Functions
  // =============================================================================

  const renderMetricsCard = () => (
    <Card title="📊 Quality Metrics" size="small">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Statistic
            title="PSNR"
            value={results?.metrics.psnr}
            precision={2}
            suffix="dB"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="SSIM"
            value={results?.metrics.ssim}
            precision={4}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Text Length"
            value={results?.metrics.text_length_chars}
            suffix="chars"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Processing Time"
            value={results?.processingTime}
            precision={3}
            suffix="s"
          />
        </Col>
      </Row>
    </Card>
  )

  const renderCapacityCard = () => (
    <Card title="🔢 Capacity Analysis" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Total Capacity: </Text>
          <Text>{results?.capacityAnalysis.total_capacity_bytes} bytes ({results?.capacityAnalysis.total_capacity_bits} bits)</Text>
        </div>
        <div>
          <Text strong>Utilization: </Text>
          <Progress
            percent={results?.embeddingInfo.utilization}
            size="small"
            format={(percent) => `${percent?.toFixed(1)}%`}
          />
        </div>
        <div>
          <Text strong>Average BPP: </Text>
          <Text type="secondary">{results?.capacityAnalysis.average_bpp?.toFixed(4)}</Text>
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>High Complexity:</Text>
            <br />
            <Text>{results?.capacityAnalysis.high_complexity_percentage?.toFixed(1)}%</Text>
            <br />
            <Text type="secondary">({results?.capacityAnalysis.high_complexity_blocks} blocks, 2-bit)</Text>
          </Col>
          <Col span={12}>
            <Text strong>Low Complexity:</Text>
            <br />
            <Text>{results?.capacityAnalysis.low_complexity_percentage?.toFixed(1)}%</Text>
            <br />
            <Text type="secondary">({results?.capacityAnalysis.low_complexity_blocks} blocks, 1-bit)</Text>
          </Col>
        </Row>
      </Space>
    </Card>
  )

  const renderVisualizationsCard = () => (
    <Card title="🎨 Algorithm Visualizations" size="small">
      <Tabs defaultActiveKey="complexity">
        <TabPane tab="🔥 Complexity Map" key="complexity">
          <div style={{ textAlign: 'center' }}>
            <Image
              src={results?.complexityMap}
              alt="Complexity Map"
              style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                🔴 Red: High complexity (2-bit LSB) • 🔵 Blue: Low complexity (1-bit LSB)
              </Text>
            </div>
          </div>
        </TabPane>
        <TabPane tab="🎯 Embedding Mask" key="mask">
          <div style={{ textAlign: 'center' }}>
            <Image
              src={results?.embeddingMask}
              alt="Embedding Mask"
              style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                🟢 Green: 1-bit embedding • 🟡 Yellow: 2-bit embedding • ⚫ Black: No embedding
              </Text>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  )

  const renderAlgorithmCard = () => (
    <Card title="🔬 Algorithm Information" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Method: </Text>
          <Text>{results?.algorithmInfo.method}</Text>
        </div>
        <div>
          <Text strong>Complexity Analysis: </Text>
          <Text>{results?.algorithmInfo.complexity_analysis}</Text>
        </div>
        <div>
          <Text strong>Adaptive Strategy: </Text>
          <Text>{results?.algorithmInfo.adaptive_strategy}</Text>
        </div>
        <div>
          <Text strong>Embedding Domain: </Text>
          <Text>{results?.algorithmInfo.embedding_domain}</Text>
        </div>
        <div>
          <Text strong>Data Processing: </Text>
          <Text>{results?.algorithmInfo.data_processing}</Text>
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          🕒 Processed at: {results?.timestamp ? new Date(results.timestamp).toLocaleString() : 'N/A'}
        </Text>
      </Space>
    </Card>
  )

  // =============================================================================
  // Main Render
  // =============================================================================

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>📚 Xử lý nhúng</Title>

      <Alert
        message="🔬 Algorithm: Sobel Edge Detection + Adaptive LSB (1-2 bit)"
        description="Thuật toán nhúng thích ứng: vùng phẳng dùng 1-bit LSB, vùng phức tạp dùng 2-bit LSB"
        type="info"
        showIcon
        style={{ marginBottom: '20px' }}
      />

      <Row gutter={[24, 24]}>
        {/* ===== INPUT SECTION ===== */}
        <Col span={24} lg={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Upload Cover Image */}
            <Card title="🖼️ Upload Cover Image" size="small">
              <Dragger
                accept="image/*"
                showUploadList={false}
                customRequest={({ file, onSuccess }) => {
                  setTimeout(() => {
                    onSuccess && onSuccess('ok')
                  }, 0)
                }}
                onChange={handleCoverUpload}
              >
                {coverPreview ? (
                  <Image
                    src={coverPreview}
                    alt="Cover preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ padding: '20px' }}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text">Click or drag image file to upload</p>
                    <p className="ant-upload-hint">Support PNG, JPG, JPEG formats</p>
                  </div>
                )}
              </Dragger>
            </Card>

            {/* Secret Text Input */}
            <Card title="✍️ Secret Text" size="small">
              <TextArea
                value={secretText}
                onChange={(e) => setSecretText(e.target.value)}
                placeholder="Enter text to hide in the image..."
                rows={4}
                showCount
                maxLength={1000}
              />
            </Card>

            {/* Embed Button */}
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={handleEmbed}
              disabled={!canEmbed}
              loading={isProcessing}
              style={{ width: '100%', height: '50px', fontSize: '16px' }}
            >
              {isProcessing ? 'Processing...' : 'Embed Text into Image'}
            </Button>
          </Space>
        </Col>

        {/* ===== RESULTS SECTION ===== */}
        <Col span={24} lg={12}>
          {results ? (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Stego Image */}
              <Card
                title="🖼️ Stego Image"
                size="small"
                extra={
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={downloadStegoImage}
                    size="small"
                  >
                    Download
                  </Button>
                }
              >
                <Image
                  src={results.stegoImage}
                  alt="Stego Image"
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                />
              </Card>

              {/* Metrics */}
              {renderMetricsCard()}
            </Space>
          ) : (
            <Card title="📊 Results" style={{ textAlign: 'center', minHeight: '400px' }}>
              <div style={{ padding: '60px 20px' }}>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Upload cover image and enter text to begin
                </Text>
                <br /><br />
                <Text type="secondary">
                  Embedding results will appear here
                </Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* ===== DETAILED ANALYSIS (when results available) ===== */}
      {results && (
        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
          <Col span={24} lg={12}>
            {renderCapacityCard()}
          </Col>
          <Col span={24} lg={12}>
            {renderVisualizationsCard()}
          </Col>
          <Col span={24}>
            {renderAlgorithmCard()}
          </Col>
        </Row>
      )}
    </div>
  )
}

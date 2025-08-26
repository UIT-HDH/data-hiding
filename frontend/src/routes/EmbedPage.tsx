import React from 'react'
import {
  Row,
  Col,
  Card,
  Upload,
  Button,
  Select,
  Slider,
  Input,
  Radio,
  Checkbox,
  message,
  Typography,
  Segmented,
  Image,
} from 'antd'
import {
  InboxOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons'

const { Dragger } = Upload
const { TextArea } = Input
const { Text } = Typography

export default function EmbedPage() {
  const [coverFile, setCoverFile] = React.useState<File | null>(null)
  const [coverPreview, setCoverPreview] = React.useState<string>('')
  const [secretType, setSecretType] = React.useState<'text' | 'file'>('text')
  const [secretText, setSecretText] = React.useState('')
  const [secretFile, setSecretFile] = React.useState<File | null>(null)
  const [method, setMethod] = React.useState('sobel')
  const [payloadCap, setPayloadCap] = React.useState(60)
  const [seed, setSeed] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [encrypt, setEncrypt] = React.useState(true)
  const [compress, setCompress] = React.useState(false)
  const [domain, setDomain] = React.useState('spatial')
  const [previewMode, setPreviewMode] = React.useState('stego')
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [results, setResults] = React.useState<any>(null)

  const canEmbed = coverFile && (secretText.trim() || secretFile)

  const handleCoverUpload = (info: any) => {
    const { file } = info
    if (file.status !== 'uploading') {
      setCoverFile(file.originFileObj || file)
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setCoverPreview(e.target?.result as string)
      reader.readAsDataURL(file.originFileObj || file)
    }
  }

  const handleSecretFileUpload = (info: any) => {
    const { file } = info
    if (file.status !== 'uploading') {
      setSecretFile(file.originFileObj || file)
    }
  }

  const generateSeed = () => {
    setSeed(Math.random().toString(36).substring(2, 10))
  }

  const mockEmbed = async () => {
    if (!canEmbed) return
    
    setIsProcessing(true)
    try {
      // Mock processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock results
      setResults({
        psnr: '45.2 dB',
        ssim: '0.987',
        payload: `${Math.round((secretText.length || secretFile?.size || 0) / 1024 * 100) / 100} KB`,
        time: '1.2s',
        stegoPreview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      })
      
      message.success('Nhúng dữ liệu thành công!')
    } catch (error) {
      message.error('Có lỗi xảy ra khi nhúng dữ liệu')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setCoverFile(null)
    setCoverPreview('')
    setSecretText('')
    setSecretFile(null)
    setPassword('')
    setResults(null)
  }

  const mockDownloadStego = () => {
    if (results) {
      message.info('Mock download stego image')
    }
  }

  // Mock preview images
  const getMockPreview = (_mode: string) => {
    // Return different mock base64 images based on mode
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  }

  return (
    <div>
      {/* Control Bar */}
      <div
        style={{
          background: '#f5f5f5',
          padding: '8px 16px',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Text strong>Tùy chọn nhúng:</Text>
        
        <Select
          size="small"
          style={{ width: 220 }}
          value={method}
          onChange={setMethod}
          options={[
            { label: 'Sobel Edge Detection', value: 'sobel' },
            { label: 'Laplacian Filter', value: 'laplacian' },
            { label: 'Variance Analysis', value: 'variance' },
            { label: 'Entropy Calculation', value: 'entropy' },
          ]}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text>Payload cap (%):</Text>
          <Slider
            style={{ width: 120 }}
            min={10}
            max={90}
            value={payloadCap}
            onChange={setPayloadCap}
          />
          <Text>{payloadCap}%</Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Input
            size="small"
            placeholder="Seed/PRNG"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            style={{ width: 120 }}
          />
          <Button size="small" onClick={generateSeed}>
            Tạo
          </Button>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={isProcessing}
            disabled={!canEmbed}
            onClick={mockEmbed}
          >
            Nhúng
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Row gutter={[8, 8]} style={{ minHeight: 'calc(100vh - 160px)' }}>
        {/* Left Column - Cover & Maps */}
        <Col xs={24} lg={10}>
          <Card title="Ảnh & Bản đồ" style={{ height: '100%' }}>
            {/* Cover Upload */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>Upload Cover Image:</Text>
              <Dragger
                accept=".png,.jpg,.jpeg"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleCoverUpload}
                style={{ marginTop: 8 }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to upload
                </p>
                <p className="ant-upload-hint">
                  Supports PNG, JPG formats
                </p>
              </Dragger>
              
              {coverFile && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  {coverFile.name} - {Math.round(coverFile.size / 1024)}KB
                </div>
              )}
            </div>

            {/* Preview Controls */}
            {coverPreview && (
              <>
                <Segmented
                  value={previewMode}
                  onChange={setPreviewMode}
                  options={[
                    { label: 'Stego', value: 'stego' },
                    { label: 'Complexity', value: 'complexity' },
                    { label: 'BPP', value: 'bpp' },
                    { label: 'Mask', value: 'mask' },
                  ]}
                  style={{ marginBottom: 16 }}
                />

                {/* Image Preview */}
                <div style={{ textAlign: 'center', maxHeight: 400, overflow: 'auto' }}>
                  <Image
                    src={previewMode === 'stego' && results ? results.stegoPreview : getMockPreview(previewMode)}
                    style={{ maxWidth: '100%' }}
                    placeholder="Loading preview..."
                  />
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* Right Column - Secret & Results */}
        <Col xs={24} lg={14}>
          <Card title="Secret & Kết quả" style={{ height: '100%' }}>
            {/* Secret Input */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>Secret Input:</Text>
              <Radio.Group
                value={secretType}
                onChange={(e) => setSecretType(e.target.value)}
                style={{ marginLeft: 16, marginBottom: 8 }}
              >
                <Radio value="text">Text</Radio>
                <Radio value="file">File</Radio>
              </Radio.Group>

              {secretType === 'text' ? (
                <TextArea
                  rows={4}
                  placeholder="Nhập nội dung cần giấu..."
                  value={secretText}
                  onChange={(e) => setSecretText(e.target.value)}
                />
              ) : (
                <Dragger
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleSecretFileUpload}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    {secretFile ? secretFile.name : 'Click or drag file to upload'}
                  </p>
                </Dragger>
              )}
            </div>

            {/* Options */}
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Password (optional):</Text>
                  <Input.Password
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ marginTop: 4 }}
                  />
                </Col>
                <Col span={12}>
                  <Text strong>Domain:</Text>
                  <Select
                    value={domain}
                    onChange={setDomain}
                    style={{ width: '100%', marginTop: 4 }}
                    options={[
                      { label: 'Spatial Domain', value: 'spatial' },
                      { label: 'DCT Domain', value: 'dct' },
                    ]}
                  />
                </Col>
              </Row>
              
              <div style={{ marginTop: 12 }}>
                <Checkbox checked={encrypt} onChange={(e) => setEncrypt(e.target.checked)}>
                  Encrypt (default: ON)
                </Checkbox>
                <Checkbox
                  checked={compress}
                  onChange={(e) => setCompress(e.target.checked)}
                  style={{ marginLeft: 16 }}
                >
                  Compress (default: OFF)
                </Checkbox>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div style={{ marginTop: 16, padding: 16, background: '#f8f9fa', borderRadius: 6 }}>
                <Text strong>Metrics:</Text>
                <Row gutter={16} style={{ marginTop: 8 }}>
                  <Col span={6}>
                    <div>PSNR: {results.psnr}</div>
                  </Col>
                  <Col span={6}>
                    <div>SSIM: {results.ssim}</div>
                  </Col>
                  <Col span={6}>
                    <div>Payload: {results.payload}</div>
                  </Col>
                  <Col span={6}>
                    <div>Time: {results.time}</div>
                  </Col>
                </Row>
                
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={mockDownloadStego}
                  style={{ marginTop: 12 }}
                >
                  Tải stego
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

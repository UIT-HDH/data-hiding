import React from 'react'
import {
  Row, Col, Card, Upload, Button, Input, message, Typography, Image,
  Space, Alert, Divider, Statistic, Progress, Tag, Tooltip, Select
} from 'antd'
import {
  InboxOutlined, PlayCircleOutlined, CopyOutlined, DownloadOutlined,
  ReloadOutlined, LockOutlined, BranchesOutlined
} from '@ant-design/icons'
import { http } from '../services/http'

const { Dragger } = Upload
const { TextArea } = Input
const { Text, Title } = Typography

/* ====================== Types từ backend (đề xuất) ====================== */
type Domain = 'spatial' | 'dct'
type Policy = 'adaptive-lsb-1-2' | 'fixed-lsb-1' | 'fixed-lsb-2'

interface ExtractParams {
  password?: string
  seed?: string
  domain: Domain
  policy: Policy
}

interface ExtractResultText {
  kind: 'text'
  text: string
  integrity: 'ok' | 'fail'
  crc?: string
  tookMs: number
  metrics?: { psnr?: number; ssim?: number }
}

interface ExtractResultFile {
  kind: 'file'
  filename: string
  size: number
  fileBase64: string           // base64 (không có prefix data:)
  mime?: string                // ví dụ application/octet-stream
  integrity: 'ok' | 'fail'
  crc?: string
  tookMs: number
  metrics?: { psnr?: number; ssim?: number }
}

type ExtractResult = ExtractResultText | ExtractResultFile

/* ====================== Trang GIẢI MÃ ====================== */
export default function ExtractPageEnhanced() {
  // Upload & preview
  const [stegoFile, setStegoFile] = React.useState<File | null>(null)
  const [stegoPreview, setStegoPreview] = React.useState<string>('')
  const [uploadKey, setUploadKey] = React.useState(0)

  // Params
  const [password, setPassword] = React.useState<string>('')
  const [seed, setSeed] = React.useState<string>('')
  const [domain, setDomain] = React.useState<Domain>('spatial')
  const [policy, setPolicy] = React.useState<Policy>('adaptive-lsb-1-2')

  // Extract state
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false)
  const [progress, setProgress] = React.useState<number>(0)
  const [result, setResult] = React.useState<ExtractResult | null>(null)

  /* -------------------- Upload handlers -------------------- */
  const beforeUpload = (f: File) => {
    const ok = ['image/png', 'image/jpeg'].includes(f.type)
    if (!ok) message.error('Chỉ hỗ trợ PNG/JPG')
    return ok || Upload.LIST_IGNORE
  }

  const handleStegoUpload = (info: any) => {
    const { file } = info
    if (file.status !== 'uploading') {
      const f: File = file.originFileObj || file
      setStegoFile(f)
      const reader = new FileReader()
      reader.onload = e => setStegoPreview(e.target?.result as string)
      reader.readAsDataURL(f)
    }
  }

  const resetAll = () => {
    setStegoFile(null)
    setStegoPreview('')
    setResult(null)
    setProgress(0)
    setUploadKey(k => k + 1)
  }

  /* -------------------- Extract action -------------------- */
  const canExtract = stegoFile && !isProcessing

  const doExtract = async () => {
    if (!canExtract) return
    setIsProcessing(true)
    setProgress(10)
    setResult(null)

    try {
      const form = new FormData()
      form.append('stegoImage', stegoFile!)
      form.append('password', password)
      form.append('seed', seed)
      form.append('domain', domain)
      form.append('policy', policy)

      // NOTE: Nếu backend có progress (SSE/WS) thì thay bằng đó.
      // Ở đây: animate nhẹ đến 90% trong lúc chờ.
      const tick = setInterval(() => {
        setProgress(p => (p < 90 ? p + 3 : p))
      }, 120)

      const res = await http.post('/api/v1/extract', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      clearInterval(tick)
      setProgress(100)

      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Extract failed')
      }

      const data = res.data.data as ExtractResult
      setResult(data)

      if (data.integrity === 'fail') {
        message.warning('CRC/Integrity FAIL — có thể password/seed/policy sai hoặc ảnh không chứa dữ liệu.')
      } else {
        message.success('✅ Giải mã thành công')
      }
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.detail || err.message || 'Network error'
      message.error(`❌ ${msg}`)
    } finally {
      setIsProcessing(false)
    }
  }

  /* -------------------- Helpers -------------------- */
  const copyText = async (text: string) => {
    try { await navigator.clipboard.writeText(text); message.success('Đã copy') }
    catch { message.error('Copy thất bại') }
  }

  const downloadBase64 = (b64: string, filename: string, mime = 'application/octet-stream') => {
    try {
      const byteArray = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
      const blob = new Blob([byteArray], { type: mime })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
    } catch {
      message.error('Download thất bại')
    }
  }

  /* -------------------- UI -------------------- */
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🔓 Giải mã</Title>

      <Alert
        type="info"
        showIcon
        message="Extract hidden data from stego image"
        description="Nhập đúng password/seed và chọn domain/policy để giải mã. Hệ thống hiển thị CRC/Integrity để kiểm chứng tính toàn vẹn."
        style={{ marginBottom: 20 }}
      />

      <Row gutter={[24, 24]}>
        {/* ===== LEFT: Upload + Params + Extract ===== */}
        <Col span={24} lg={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Upload Stego */}
            <Card title="🖼️ Upload Stego" size="small">
              <Dragger
                key={uploadKey}
                accept="image/*"
                showUploadList={false}
                beforeUpload={beforeUpload}
                customRequest={({ file, onSuccess }) => { onSuccess && onSuccess('ok') }}
                onChange={handleStegoUpload}
              >
                {stegoPreview ? (
                  <Image
                    src={stegoPreview}
                    alt="Stego preview"
                    style={{ maxWidth: '100%', maxHeight: 220, objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ padding: 20 }}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text">Click hoặc kéo thả ảnh stego để tải lên</p>
                    <p className="ant-upload-hint">Hỗ trợ PNG, JPG</p>
                  </div>
                )}
              </Dragger>
            </Card>

            {/* Params */}
            <Card title="🔑 Tham số giải mã" size="small">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Space wrap>
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password (nếu có)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: 260 }}
                  />
                  <Input
                    prefix={<BranchesOutlined />}
                    placeholder="Seed / PRNG (nếu có)"
                    value={seed}
                    onChange={e => setSeed(e.target.value)}
                    style={{ width: 220 }}
                  />
                </Space>

                <Space wrap>
                  <Select<Domain>
                    value={domain}
                    onChange={setDomain}
                    style={{ width: 180 }}
                    options={[
                      { value: 'spatial', label: 'Spatial domain' },
                      { value: 'dct', label: 'DCT domain' }
                    ]}
                  />
                  <Select<Policy>
                    value={policy}
                    onChange={setPolicy}
                    style={{ width: 220 }}
                    options={[
                      { value: 'adaptive-lsb-1-2', label: 'Adaptive LSB (1–2 bit)' },
                      { value: 'fixed-lsb-1', label: 'Fixed LSB 1-bit' },
                      { value: 'fixed-lsb-2', label: 'Fixed LSB 2-bit' }
                    ]}
                  />
                </Space>

                <Space>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={doExtract}
                    disabled={!canExtract}
                    loading={isProcessing}
                  >
                    Extract
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={resetAll}>
                    Làm Mới
                  </Button>
                </Space>

                {(isProcessing || progress > 0) && (
                  <div style={{ width: 320 }}>
                    <Text type="secondary">Tiến độ:</Text>
                    <Progress percent={progress} size="small" status={isProcessing ? 'active' : 'normal'} />
                  </div>
                )}
              </Space>
            </Card>
          </Space>
        </Col>

        {/* ===== RIGHT: Kết quả ===== */}
        <Col span={24} lg={12}>
          <Card title="🧾 Kết quả giải mã" size="small">
            {/* Preview ảnh */}
            <Text type="secondary">Ảnh stego:</Text>
            <div
              style={{
                border: '1px solid #eee', borderRadius: 8, marginTop: 8, marginBottom: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: 220, background: '#fff'
              }}
            >
              {stegoPreview
                ? <img src={stegoPreview} style={{ maxWidth: '100%', maxHeight: 220, objectFit: 'contain' }} />
                : <Text type="secondary">Chưa có ảnh — tải ở khung bên trái.</Text>}
            </div>

            {/* Result area */}
            {!result ? (
              <Text type="secondary">Chưa có kết quả. Tải ảnh stego và nhấn “Extract”.</Text>
            ) : result.kind === 'text' ? (
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Space>
                  <Text strong>Chuỗi bí mật:</Text>
                  <Tag color={result.integrity === 'ok' ? 'green' : 'red'}>
                    {result.integrity === 'ok' ? 'CRC OK' : 'CRC FAIL'}
                  </Tag>
                  {result.crc && (
                    <Tooltip title="CRC / Hash"><Tag>{result.crc}</Tag></Tooltip>
                  )}
                </Space>
                <TextArea value={result.text} readOnly rows={4} />
                <Space>
                  <Button icon={<CopyOutlined />} onClick={() => copyText(result.text)}>Copy</Button>
                  <Text type="secondary">Thời gian xử lý: {(result.tookMs/1000).toFixed(2)}s</Text>
                </Space>
              </Space>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Space>
                  <Text strong>Tệp bí mật:</Text>
                  <Tag color={result.integrity === 'ok' ? 'green' : 'red'}>
                    {result.integrity === 'ok' ? 'CRC OK' : 'CRC FAIL'}
                  </Tag>
                  {result.crc && <Tag>{result.crc}</Tag>}
                </Space>
                <Text>Tên: <b>{result.filename}</b> — Kích thước: <b>{(result.size/1024).toFixed(1)} KB</b></Text>
                <Space>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => downloadBase64(result.fileBase64, result.filename, result.mime)}
                  >
                    Download
                  </Button>
                  <Text type="secondary">Thời gian xử lý: {(result.tookMs/1000).toFixed(2)}s</Text>
                </Space>
              </Space>
            )}
          </Card>

          {/* Optional: show metrics nếu backend trả */}
          {result?.metrics && (
            <Card title="📊 Quality Metrics" size="small" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={12}><Statistic title="PSNR" value={result.metrics.psnr} precision={2} suffix="dB" /></Col>
                <Col span={12}><Statistic title="SSIM" value={result.metrics.ssim} precision={4} /></Col>
              </Row>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

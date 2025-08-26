import React, { useMemo, useState } from 'react'
import {
  App as AntApp,
  Button,
  Descriptions,
  Divider,
  Flex,
  Form,
  Image as AntImage,
  Input,
  Radio,
  Segmented,
  Select,
  Slider,
  Space,
  Spin,
  Switch,
  Tabs,
  Typography,
  Upload,
} from 'antd'
import type { UploadProps } from 'antd'

type EmbedResult = {
  stegoBase64: string
  metrics: { psnr: number; ssim: number; payload: number; time_ms: number }
  maps: { complexity: string; bpp: string; mask: string }
  log: Record<string, any>
}

type ExtractResult = {
  text?: string
  file?: { name: string; size: number; data: string }
}

// helper type(s) intentionally omitted

const PLACEHOLDER_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABZ8H0PAAAAnUlEQVR4Xu3XsQ3CMBQF0aQk6QKQ2Sxg3Q4l0h6mQ3J3J0dG0q0bq8Bq0oO3o8nP6b8C2F0yWf3X0GQWf1oRNX5VwB9gI5x8n0P4yq8mNw7cGJgB1CwKQxqgq1Z5cQ7jW0Jg0m3Q1q0l1zXwD0v0qDq4C2p9c7m7s7wHfHq0jBqQq2m0y8bQ5pS7j0u2w3h8Gg8P1G0fVQ6jE2YB/7kqQmJfQ3A3n+e8l0o8wJ+7k6uQ6nC1o4T8c9o2cCjQ0oAAAAASUVORK5CYII='

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

async function readImageMeta(file: File): Promise<{ width: number; height: number; type: string; size: number }>
{
  const url = URL.createObjectURL(file)
  try {
    const dim = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = reject
      img.src = url
    })
    return { width: dim.width, height: dim.height, type: file.type || 'image', size: file.size }
  } finally {
    URL.revokeObjectURL(url)
  }
}

function downloadBase64(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

async function mockEmbed(formData: any): Promise<EmbedResult> {
  const { coverMeta, payloadCapPercent } = formData
  const pixels = (coverMeta?.width || 256) * (coverMeta?.height || 256)
  const payload = Math.floor(((payloadCapPercent || 60) / 100) * (pixels / 8))
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        stegoBase64: PLACEHOLDER_PNG,
        metrics: {
          psnr: Number((40 + Math.random() * 10).toFixed(2)),
          ssim: Number((0.96 + Math.random() * 0.03).toFixed(4)),
          payload,
          time_ms: randomInt(100, 800),
        },
        maps: {
          complexity: PLACEHOLDER_PNG,
          bpp: PLACEHOLDER_PNG,
          mask: PLACEHOLDER_PNG,
        },
        log: { ok: true, ts: Date.now() },
      })
    }, randomInt(350, 900))
  })
}

async function mockExtract(_formData: any): Promise<ExtractResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isText = Math.random() < 0.7
      if (isText) {
        resolve({ text: 'Hello from stego! This is a mocked extraction.' })
      } else {
        resolve({ file: { name: 'secret.bin', size: 128, data: 'data:application/octet-stream;base64,aGVsbG8=' } })
      }
    }, randomInt(250, 700))
  })
}

const { Title, Text } = Typography

export default function StegoDemoPage() {
  const [dark, setDark] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('embed')

  const [embedForm] = Form.useForm()
  const [extractForm] = Form.useForm()

  const [embedLoading, setEmbedLoading] = useState<boolean>(false)
  const [extractLoading, setExtractLoading] = useState<boolean>(false)

  const [coverMeta, setCoverMeta] = useState<{ width: number; height: number; type: string; size: number } | null>(null)
  const [stegoBase64, setStegoBase64] = useState<string | null>(null)
  const [mapsTab, setMapsTab] = useState<'stego' | 'complexity' | 'bpp' | 'mask'>('stego')

  const { message } = AntApp.useApp()

  const themeStyle = useMemo(() => ({
    background: dark ? '#0b0c10' : '#fff',
    color: dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)',
  }), [dark])

  const containerStyle: React.CSSProperties = useMemo(() => ({
    minHeight: '100vh',
    padding: 16,
    background: themeStyle.background,
  }), [themeStyle])

  const cardStyle: React.CSSProperties = useMemo(() => ({
    background: dark ? '#141414' : '#fafafa',
    borderRadius: 8,
    padding: 16,
    boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.65)' : '0 2px 8px rgba(0,0,0,0.08)',
  }), [dark])

  const uploadProps: UploadProps = {
    accept: 'image/png,image/jpeg',
    beforeUpload: () => false,
    maxCount: 1,
    listType: 'picture-card',
  }

  const handleCoverChange: UploadProps['onChange'] = async ({ fileList }) => {
    const file = fileList[0]?.originFileObj as File | undefined
    if (!file) {
      setCoverMeta(null)
      return
    }
    try {
      const meta = await readImageMeta(file)
      setCoverMeta(meta)
    } catch (e) {
      message.error('Failed to read image metadata')
    }
  }

  function MetricsCard({ result }: { result: EmbedResult | null }) {
    if (!result) return null
    return (
      <Descriptions title="Metrics" bordered size="small" column={2} style={{ marginTop: 16 }}>
        <Descriptions.Item label="PSNR">{result.metrics.psnr} dB</Descriptions.Item>
        <Descriptions.Item label="SSIM">{result.metrics.ssim}</Descriptions.Item>
        <Descriptions.Item label="Payload">{formatBytes(result.metrics.payload)}</Descriptions.Item>
        <Descriptions.Item label="Time">{result.metrics.time_ms} ms</Descriptions.Item>
      </Descriptions>
    )
  }

  function OverlayViewer({ result }: { result: EmbedResult | null }) {
    if (!result) return null
    const current = mapsTab === 'stego' ? result.stegoBase64 : result.maps[mapsTab]
    return (
      <div style={{ marginTop: 16 }}>
        <Segmented
          value={mapsTab}
          onChange={(val) => setMapsTab(val as any)}
          options={[
            { label: 'stego', value: 'stego' },
            { label: 'complexity', value: 'complexity' },
            { label: 'bpp', value: 'bpp' },
            { label: 'mask', value: 'mask' },
          ]}
        />
        <div style={{ marginTop: 12 }}>
          <AntImage src={current} width={256} height={256} style={{ objectFit: 'contain' }} />
        </div>
      </div>
    )
  }

  const [embedResult, setEmbedResult] = useState<EmbedResult | null>(null)

  async function onEmbed(values: any) {
    if (!coverMeta) {
      message.error('Please upload a cover image')
      return
    }
    if (values.secretType === 'text' && !values.secretText) {
      message.error('Please input secret text')
      return
    }
    if (values.secretType === 'file' && (!values.secretFile || values.secretFile.fileList?.length === 0)) {
      message.error('Please upload a secret file')
      return
    }
    setEmbedLoading(true)
    setEmbedResult(null)
    try {
      const result = await mockEmbed({
        ...values,
        coverMeta,
        payloadCapPercent: values.payloadCap,
      })
      setEmbedResult(result)
      setStegoBase64(result.stegoBase64)
      message.success('Embed completed')
    } catch (e) {
      message.error('Embed failed')
    } finally {
      setEmbedLoading(false)
    }
  }

  async function onExtract(values: any) {
    if (!values.stego || values.stego.fileList?.length === 0) {
      message.error('Please upload a stego image')
      return
    }
    setExtractLoading(true)
    try {
      const result = await mockExtract(values)
      if (result.text) {
        extractForm.setFieldsValue({ extractedText: result.text })
        message.success('Extracted text found')
      } else if (result.file) {
        extractForm.setFieldsValue({ extractedText: undefined })
        message.success('Extracted file found')
      }
      ;(window as any).__lastExtract = result
    } catch (e) {
      message.error('Extract failed')
    } finally {
      setExtractLoading(false)
    }
  }

  return (
    <AntApp>
      <div style={containerStyle}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
          <Title level={4} style={{ color: themeStyle.color, margin: 0 }}>
            Adaptive Image Complexity Steganography — Demo
          </Title>
          <Space>
            <Text style={{ color: themeStyle.color }}>Dark</Text>
            <Switch checked={dark} onChange={setDark} />
          </Space>
        </Flex>

        <div style={cardStyle}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
            {
              key: 'embed',
              label: 'Embed',
              children: (
                <Form
                  form={embedForm}
                  layout="vertical"
                  onFinish={onEmbed}
                  initialValues={{
                    secretType: 'text',
                    encrypt: true,
                    compress: false,
                    domain: 'spatial',
                    method: 'sobel',
                    payloadCap: 60,
                  }}
                >
                  <Form.Item label="Upload Cover Image" required>
                    <Upload {...uploadProps} onChange={handleCoverChange}>
                      <div>Click or drag image</div>
                    </Upload>
                    {coverMeta && (
                      <div style={{ marginTop: 8, fontSize: 12, color: themeStyle.color }}>
                        {coverMeta.width}×{coverMeta.height} · {coverMeta.type} · {formatBytes(coverMeta.size)}
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item label="Secret Input" name="secretType">
                    <Radio.Group>
                      <Radio.Button value="text">Text</Radio.Button>
                      <Radio.Button value="file">File</Radio.Button>
                    </Radio.Group>
                  </Form.Item>

                  {embedForm.getFieldValue('secretType') !== 'file' ? (
                    <Form.Item name="secretText" rules={[{ required: true, message: 'Please input secret text' }]}> 
                      <Input.TextArea rows={4} showCount maxLength={2000} placeholder="Enter secret text" />
                    </Form.Item>
                  ) : (
                    <Form.Item name="secretFile" rules={[{ required: true, message: 'Please upload a secret file' }]}> 
                      <Upload beforeUpload={() => false} maxCount={1}>
                        <Button>Select secret file</Button>
                      </Upload>
                    </Form.Item>
                  )}

                  <Divider />
                  <Title level={5} style={{ color: themeStyle.color }}>Options</Title>
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Form.Item label="Password" name="password">
                      <Input.Password placeholder="Password" />
                    </Form.Item>
                    <Form.Item label="Encrypt" name="encrypt" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item label="Compress" name="compress" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item label="Domain" name="domain">
                      <Select options={[{ value: 'spatial' }, { value: 'dct' }]} />
                    </Form.Item>
                    <Form.Item label="Complexity Method" name="method">
                      <Select options={[{ value: 'sobel' }, { value: 'laplacian' }, { value: 'variance' }, { value: 'entropy' }]} />
                    </Form.Item>
                    <Form.Item label="Payload cap (%)" name="payloadCap">
                      <Slider min={1} max={100} />
                    </Form.Item>
                    <Form.Item label="Seed/PRNG" name="seed">
                      <Space>
                        <Input placeholder="6 digits" style={{ width: 160 }} />
                        <Button onClick={() => embedForm.setFieldsValue({ seed: String(randomInt(100000, 999999)) })}>Generate</Button>
                      </Space>
                    </Form.Item>
                  </Space>

                  <Space>
                    <Button type="primary" htmlType="submit" loading={embedLoading} disabled={embedLoading}>Embed</Button>
                    <Button htmlType="reset" onClick={() => { setEmbedResult(null); setStegoBase64(null); }}>Reset</Button>
                  </Space>

                  {embedLoading && (
                    <div style={{ marginTop: 16 }}>
                      <Spin />
                    </div>
                  )}

                  <MetricsCard result={embedResult} />
                  <OverlayViewer result={embedResult} />

                  {stegoBase64 && (
                    <div style={{ marginTop: 12 }}>
                      <Button onClick={() => downloadBase64(stegoBase64, 'stego.png')}>Download Stego</Button>
                    </div>
                  )}
                </Form>
              ),
            },
            {
              key: 'extract',
              label: 'Extract',
              children: (
                <Form form={extractForm} layout="vertical" onFinish={onExtract} initialValues={{ domain: 'spatial' }}>
                  <Form.Item label="Upload Stego Image" name="stego" rules={[{ required: true, message: 'Please upload stego image' }]}>
                    <Upload beforeUpload={() => false} maxCount={1} listType="picture-card" accept="image/png,image/jpeg">
                      <div>Click or drag image</div>
                    </Upload>
                  </Form.Item>
                  <Form.Item label="Password" name="password">
                    <Input.Password placeholder="Password" />
                  </Form.Item>
                  <Form.Item label="Seed/PRNG" name="seed">
                    <Input placeholder="Seed" />
                  </Form.Item>
                  <Form.Item label="Domain" name="domain">
                    <Select options={[{ value: 'spatial' }, { value: 'dct' }]} />
                  </Form.Item>

                  <Space>
                    <Button type="primary" htmlType="submit" loading={extractLoading} disabled={extractLoading}>Extract</Button>
                    <Button htmlType="reset" onClick={() => extractForm.resetFields()}>Reset</Button>
                  </Space>

                  <Form.Item label="Extracted Text" name="extractedText">
                    <Input.TextArea rows={4} readOnly placeholder="Extraction result will appear here if text" />
                  </Form.Item>

                  <Button
                    onClick={() => {
                      const data = (window as any).__lastExtract as ExtractResult | undefined
                      if (data?.file) {
                        downloadBase64(data.file.data, data.file.name)
                      } else {
                        message.info('No extracted file to download')
                      }
                    }}
                  >
                    Download Extracted File
                  </Button>
                </Form>
              ),
            },
          ]} />
        </div>
      </div>
    </AntApp>
  )
}



import React from 'react';
import {
  Row, Col, Card, Upload, Button, Input, Typography, Space,
  Alert, Image, message, Progress, Select, Divider
} from 'antd';
import {
  InboxOutlined, PlayCircleOutlined, CopyOutlined, DownloadOutlined
} from '@ant-design/icons';
import { http } from '../services/http';

const { Dragger } = Upload;
const { TextArea } = Input;
const { Text, Title } = Typography;

type Domain = 'spatial' | 'dct';
type Policy = 'sobel' | 'laplacian' | 'variance' | 'entropy';

type ExtractResponse = {
  success?: boolean;
  message?: string;
  data?: {
    secretType?: 'text' | 'file';
    text?: string;
    filename?: string;
    size?: number;
    fileBase64?: string;          // "data:...;base64,...." hoặc chỉ base64
    crc_ok?: boolean;
    processingTime?: number;
  };
};

export default function ExtractPage() {
  const [stegoFile, setStegoFile] = React.useState<File | null>(null);
  const [stegoPreview, setStegoPreview] = React.useState<string>('');

  const [seed, setSeed] = React.useState<string>('');
  const [domain, setDomain] = React.useState<Domain>('spatial');
  const [policy, setPolicy] = React.useState<Policy>('sobel');

  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const [result, setResult] = React.useState<ExtractResponse['data'] | null>(null);

  const beforeUpload = (f: File) => {
    const ok = ['image/png', 'image/jpeg'].includes(f.type);
    if (!ok) message.error('Chỉ hỗ trợ ảnh PNG/JPG');
    return ok || Upload.LIST_IGNORE;
  };
  const onChangeUpload = (info: any) => {
    const f: File = info.file.originFileObj || info.file;
    if (!f) return;
    setStegoFile(f);
    const reader = new FileReader();
    reader.onload = e => setStegoPreview(String(e.target?.result || ''));
    reader.readAsDataURL(f);
    setResult(null);
  };

  const copyText = async (txt: string) => {
    await navigator.clipboard.writeText(txt);
    message.success('Đã copy nội dung');
  };

  const downloadSecretFile = (base64: string, filename = 'secret.bin') => {
    const hasPrefix = /^data:/.test(base64);
    const url = hasPrefix ? base64 : `data:application/octet-stream;base64,${base64}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const doExtract = async () => {
    if (!stegoFile) return message.warning('Hãy chọn ảnh stego');
    setLoading(true);
    setProgress(0);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('stegoImage', stegoFile);
      // tuỳ backend có nhận thêm tham số:
      fd.append('seed', seed);
      fd.append('domain', domain);
      fd.append('policy', policy);

      const res = await http.post<ExtractResponse>('/api/v1/extract', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          if (e.total) setProgress(Math.min(95, Math.round(e.loaded / e.total * 95)));
        }
      });

      const ok = res.data?.success !== false;
      const data = res.data?.data ?? (res.data as any);

      setProgress(100);
      setResult(data);
      if (!ok) {
        message.error(res.data?.message || 'Giải mã thất bại');
      } else {
        message.success('Giải mã thành công');
      }
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.detail || err.message || 'Lỗi mạng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>🔓 Giải</Title>

      <Row gutter={[24,24]}>
        {/* Upload + cấu hình */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="🖼️ Tải Ảnh Stego" size="small">
              <Dragger
                accept="image/png,image/jpeg"
                beforeUpload={beforeUpload}
                showUploadList={false}
                customRequest={({ onSuccess }) => { onSuccess && onSuccess('ok'); }}
                onChange={onChangeUpload}
              >
                {stegoPreview ? (
                  <Image src={stegoPreview} alt="stego" style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain' }}/>
                ) : (
                  <div style={{ padding: 20 }}>
                    <p className="ant-upload-drag-icon"><InboxOutlined style={{ fontSize: 48, color:'#1677ff' }}/></p>
                    <p className="ant-upload-text">Click hoặc kéo thả ảnh để tải lên</p>
                    <p className="ant-upload-hint">Hỗ trợ PNG/JPG</p>
                  </div>
                )}
              </Dragger>
            </Card>

            <Card title="⚙️ Tham số giải mã" size="small">
              <Space direction="vertical" style={{ width:'100%' }} size="middle">
                <Input placeholder="Password / Seed (nếu có)" value={seed} onChange={e=>setSeed(e.target.value)} />
                <Row gutter={12}>
                  <Col span={12}>
                    <div>Miền (Domain):</div>
                    <Select value={domain} onChange={v=>setDomain(v)} style={{ width:'100%' }}
                      options={[
                        {value:'spatial', label:'Spatial'},
                        {value:'dct', label:'DCT'}
                      ]}/>
                  </Col>
                  <Col span={12}>
                    <div>Chính sách (Policy):</div>
                    <Select value={policy} onChange={v=>setPolicy(v)} style={{ width:'100%' }}
                      options={[
                        {value:'sobel', label:'Sobel'},
                        {value:'laplacian', label:'Laplacian'},
                        {value:'variance', label:'Variance'},
                        {value:'entropy', label:'Entropy'}
                      ]}/>
                  </Col>
                </Row>

                <Button type="primary" icon={<PlayCircleOutlined />} onClick={doExtract} disabled={!stegoFile} loading={loading}>
                  Extract
                </Button>
                {loading && <Progress percent={progress} />}
              </Space>
            </Card>
          </Space>
        </Col>

        {/* Kết quả */}
        <Col xs={24} lg={12}>
          <Card title="📤 Kết Quả Giải Mã" size="small">
            {!result ? (
              <div style={{ padding: 40, textAlign:'center' }}>
                <Text type="secondary">Tải ảnh và bấm Extract để bắt đầu</Text>
              </div>
            ) : (
              <Space direction="vertical" style={{ width:'100%' }} size="large">
                {/* Integrity / CRC */}
                {'crc_ok' in result && (
                  result.crc_ok
                    ? <Alert type="success" showIcon message="CRC / Integrity: OK" />
                    : <Alert type="error" showIcon message="CRC / Integrity: FAILED" />
                )}

                {/* Text */}
                {result.secretType === 'text' && (
                  <div>
                    <Text strong>Nội dung bí mật:</Text>
                    <Space.Compact style={{ width:'100%', marginTop:8 }}>
                      <TextArea readOnly value={result.text || ''} rows={5}/>
                      <Button icon={<CopyOutlined />} onClick={()=>copyText(result.text || '')}>Copy</Button>
                    </Space.Compact>
                  </div>
                )}

                {/* File */}
                {result.secretType === 'file' && (
                  <div>
                    <Text strong>File bí mật:</Text>
                    <div style={{ marginTop:6 }}>
                      <Text type="secondary">{result.filename || 'secret.bin'} • {(result.size ?? 0)} bytes</Text>
                    </div>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={()=>downloadSecretFile(result.fileBase64 || '', result.filename || 'secret.bin')}
                      style={{ marginTop:8 }}
                    >
                      Download
                    </Button>
                  </div>
                )}

                {typeof result.processingTime === 'number' && (
                  <>
                    <Divider style={{ margin:'8px 0' }}/>
                    <Text type="secondary">Thời gian xử lý: {result.processingTime}s</Text>
                  </>
                )}
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

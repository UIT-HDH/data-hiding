// frontend/src/routes/BatchPage.tsx
import React from 'react';
import {
  Row, Col, Card, Upload, Button, Input, Typography, Space,
  Progress, Select, Slider, Switch, Table, Tag, Divider, message, Radio
} from 'antd';
import {
  InboxOutlined, PlayCircleOutlined, ReloadOutlined, DownloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { http } from '../services/http';

const { Dragger } = Upload;
const { Text, Paragraph } = Typography;

type StatusUnion = 'OK' | 'FAIL';
type SecretMode = 'text' | 'file';
type Method = 'sobel' | 'laplacian' | 'variance' | 'entropy';

type RowState = {
  file: File;
  progress: number;
  state: 'queued' | 'running' | 'done' | 'error';
  result?: {
    key: string;
    filename: string;
    sizeKB: number;
    payloadKB: number;
    psnr?: number;
    ssim?: number;
    timeMs?: number;
    status: StatusUnion;
    message?: string;
  };
};

function exportCsv(rows: NonNullable<RowState['result']>[]) {
  const header = ['TenFile','DuLieu(KB)','PSNR','SSIM','ThoiGian(ms)','TrangThai','GhiChu'];
  const csv = [
    header.join(','),
    ...rows.map(r => [
      `"${r.filename.replace(/"/g,'""')}"`,
      r.payloadKB.toFixed(2),
      r.psnr?.toFixed(2) ?? '',
      r.ssim?.toFixed(4) ?? '',
      r.timeMs ?? '',
      r.status,
      r.message ? `"${r.message.replace(/"/g,'""')}"` : ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `batch_results_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* ===== util: sinh seed ngẫu nhiên, base62 ===== */
function genSeedBase62(len = 8) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[buf[i] % alphabet.length];
  return out;
}

export default function BatchPage() {
  // Upload cover images
  const [files, setFiles] = React.useState<RowState[]>([]);
  const [uploadKey, setUploadKey] = React.useState(0);

  const onChangeCovers = (info: any) => {
    const seen = new Set<string>();
    const items: RowState[] = [];
    for (const it of info.fileList) {
      const f: File = it.originFileObj || it;
      if (!f || !/image\/(png|jpeg)/.test(f.type)) continue;
      const key = `${f.name}:${f.size}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ file: f, progress: 0, state: 'queued' });
    }
    setFiles(items);
  };

  // Secret chung
  const [secretMode, setSecretMode] = React.useState<SecretMode>('text');
  const [secretText, setSecretText] = React.useState('');
  const [secretFile, setSecretFile] = React.useState<File | null>(null);

  // Cấu hình (nếu BE cần sẽ nhận được)
  const [method, setMethod] = React.useState<Method>('sobel');
  const [payloadCap, setPayloadCap] = React.useState<number>(60);
  const [seed, setSeed] = React.useState<string>('');
  const [encrypt, setEncrypt] = React.useState<boolean>(true);
  const [compress, setCompress] = React.useState<boolean>(false);

  // Run
  const [running, setRunning] = React.useState(false);
  const [overall, setOverall] = React.useState(0);

  const canRun = files.length > 0 && !running && (
    (secretMode==='text' && secretText.trim().length>0) ||
    (secretMode==='file' && !!secretFile)
  );

  const clearAll = () => {
    setFiles([]); setOverall(0);
    setSecretText(''); setSecretFile(null);
    setSeed('');
    setUploadKey(k=>k+1);
  };

  /* ===== Concurrency + progress batching ===== */
  const progressRef = React.useRef<number[]>([]);
  const CONCURRENCY = 3;
  const TICK_MS = 100;

  const runBatch = async () => {
    if (!canRun) return;
    setRunning(true); setOverall(0);
    progressRef.current = Array(files.length).fill(0);
    setFiles(prev => prev.map(r => ({ ...r, progress: 0, state: 'queued', result: undefined })));

    const tick = window.setInterval(() => {
      setFiles(prev => prev.map((r, i) => {
        if (prev[i].state === 'running' || prev[i].state === 'queued') {
          return { ...r, progress: progressRef.current[i] };
        }
        return r;
      }));
      const sum = progressRef.current.reduce((a,b)=>a+b,0);
      setOverall(Math.round(sum / (progressRef.current.length || 1)));
    }, TICK_MS);

    const worker = async (idx: number) => {
      setFiles(prev => {
        const cp = [...prev];
        cp[idx] = { ...cp[idx], state: 'running', progress: 5 };
        return cp;
      });

      try {
        const form = new FormData();
        form.append('coverImage', files[idx].file);

        // ====== DATA: giống tab Embed (đang chạy OK) ======
        if (secretMode === 'text') {
          form.append('secretText', secretText);
        } else if (secretFile) {
          // Nếu BE chưa hỗ trợ secret file, fail sớm để hiện lý do
          throw new Error('Backend /api/v1/embed hiện chỉ nhận secretText (text), chưa hỗ trợ secretFile.');
        }

        // ====== OPTIONAL: chỉ gửi khi có, nếu BE hỗ trợ sẽ dùng ======
        if (seed)        form.append('seed', seed);
        form.append('policy', method);                          // sobel/laplacian/variance/entropy
        form.append('payloadCap', String(payloadCap));          // %
        form.append('encrypt',    String(encrypt));             // 'true' | 'false'
        form.append('compress',   String(compress));            // 'true' | 'false'

        const res = await http.post('/api/v1/embed', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: e => {
            if (e.total) {
              const p = Math.min(98, Math.round(e.loaded / e.total * 95));
              progressRef.current[idx] = p;
            }
          }
        });

        const data = (res.data?.data ?? res.data) as any;
        const ok   = (res.status >= 200 && res.status < 300) && !!data?.stegoImage;

        const metrics = data?.metrics ?? {};
        const payloadKB =
          metrics?.payloadKB ??
          (typeof metrics?.binary_length_bits === 'number'
             ? metrics.binary_length_bits / 8 / 1024
             : 0);

        const row = {
          key: String(idx),
          filename: files[idx].file.name,
          sizeKB: files[idx].file.size / 1024,
          payloadKB: Number(payloadKB) || 0,
          psnr:     typeof metrics?.psnr === 'number' ? metrics.psnr : undefined,
          ssim:     typeof metrics?.ssim === 'number' ? metrics.ssim : undefined,
          timeMs:   data?.processingTime ?? data?.timeMs,
          status: ok ? 'OK' as StatusUnion : 'FAIL',
          message: ok ? undefined : (res.data?.message || res.data?.detail || 'Unknown error')
        };

        progressRef.current[idx] = 100;
        setFiles(prev => {
          const cp = [...prev];
          cp[idx] = { ...cp[idx], progress: 100, state: ok ? 'done' : 'error', result: row };
          return cp;
        });

        if (!ok) {
          // eslint-disable-next-line no-console
          console.warn('[BATCH][FAIL]', row.message, res.data);
        }
      } catch (err:any) {
        progressRef.current[idx] = 100;
        const msg = err?.response?.data?.detail || err?.message || 'Network error';
        setFiles(prev => {
          const cp=[...prev];
          cp[idx] = {
            ...cp[idx],
            state: 'error',
            progress: 100,
            result: {
              key: String(idx),
              filename: files[idx].file.name,
              sizeKB: files[idx].file.size/1024,
              payloadKB: 0, status: 'FAIL', message: msg
            }
          };
          return cp;
        });
        // eslint-disable-next-line no-console
        console.error('[BATCH][ERROR]', msg, err?.response?.data || err);
      }
    };

    // Hàng đợi chạy song song
    let next = 0;
    const runners: Promise<void>[] = [];
    const spawn = () => {
      if (next >= files.length) return;
      const idx = next++;
      runners.push(worker(idx).then(spawn));
    };
    for (let i=0;i<Math.min(CONCURRENCY, files.length);i++) spawn();
    await Promise.all(runners);

    window.clearInterval(tick);
    setOverall(100);
    setRunning(false);
    message.success('Đã chạy xong lô ảnh');
  };

  // Bảng
  const columns: ColumnsType<RowState> = [
    { title: 'Tên File', key: 'name', render: (_t, r) => r.file.name },
    { title: 'Dữ Liệu', key: 'payload', render: (_t, r) => r.result?.payloadKB?.toFixed(2) ?? '' },
    { title: 'PSNR',    key: 'psnr',    render: (_t, r) => r.result?.psnr ? r.result.psnr.toFixed(2) : '' },
    { title: 'SSIM',    key: 'ssim',    render: (_t, r) => r.result?.ssim ? r.result.ssim.toFixed(4) : '' },
    { title: 'Thời Gian', key: 'time',  render: (_t, r) => r.result?.timeMs ?? '' },
    {
      title: 'Trạng Thái', key: 'status',
      render: (_t, r) =>
        r.state === 'running' ? <Progress percent={r.progress} size="small" /> :
        r.result ? <Tag color={r.result.status === 'OK' ? 'green' : 'red'}>{r.result.status}</Tag> :
        r.state === 'error' ? <Tag color="red">FAIL</Tag> : <Tag>QUEUED</Tag>
    },
    { title: 'Ghi chú', key: 'note', render: (_t, r) => r.result?.message ?? '' }
  ];

  const resultsOnly = files.map(f => f.result).filter(Boolean) as NonNullable<RowState['result']>[];

  return (
    <div style={{ padding: 16 }}>
      <Card title="Cấu Hình Xử Lý Hàng Loạt" style={{ marginBottom: 16 }}>
        <Row gutter={24}>
          {/* Upload */}
          <Col xs={24} md={14}>
            <div style={{ marginBottom: 8 }}>Tải Lên Ảnh Cover:</div>
            <Dragger
              key={uploadKey}
              multiple
              directory
              showUploadList
              accept="image/png,image/jpeg"
              beforeUpload={(f)=> /image\/(png|jpeg)/.test(f.type) || Upload.LIST_IGNORE}
              onChange={onChangeCovers}
              customRequest={({onSuccess})=>{onSuccess && onSuccess('ok')}}
            >
              <div style={{ padding: 18 }}>
                <p className="ant-upload-drag-icon"><InboxOutlined style={{ fontSize: 44, color:'#1677ff' }}/></p>
                <p className="ant-upload-text">Click hoặc kéo thả nhiều ảnh để tải lên</p>
                <p className="ant-upload-hint">Hỗ trợ PNG, JPG (chọn nhiều)</p>
              </div>
            </Dragger>
          </Col>

          {/* Config + Secret */}
          <Col xs={24} md={10}>
            <Space direction="vertical" size="middle" style={{ width:'100%' }}>
              <div>
                <div>Phương pháp phức tạp:</div>
                <Select<Method>
                  value={method}
                  onChange={setMethod as any}
                  style={{ width: '100%' }}
                  options={[
                    { value:'sobel', label:'Phát Hiện Biên Sobel' },
                    { value:'laplacian', label:'Bộ Lọc Laplacian' },
                    { value:'variance', label:'Phân Tích Phương Sai' },
                    { value:'entropy', label:'Tính Toán Entropy' },
                  ]}
                />
              </div>

              <div>
                <div>Dung lượng tối đa (%):</div>
                <Slider min={10} max={90} step={1} value={payloadCap} onChange={(v)=>setPayloadCap(Number(v))}/>
              </div>

              <div>
                <div>Hạt giống/PRNG:</div>
                <Space.Compact style={{ width:'100%' }}>
                  <Input placeholder="Nhập hạt giống" value={seed} onChange={e=>setSeed(e.target.value)} />
                  <Button
                    onClick={()=>{
                      const s = genSeedBase62(8);
                      setSeed(s);
                      try { navigator.clipboard.writeText(s); } catch {}
                      message.success(`Đã tạo seed: ${s}`);
                    }}
                  >
                    Tạo
                  </Button>
                </Space.Compact>
              </div>

              <div>
                <Space direction="vertical" size={8}>
                  <div>
                    <Switch checked={encrypt}  onChange={setEncrypt}/>
                    <span style={{ marginLeft: 8 }}>Mã hoá (mặc định: BẬT)</span>
                  </div>
                  <div>
                    <Switch checked={compress} onChange={setCompress}/>
                    <span style={{ marginLeft: 8 }}>Nén (mặc định: TẮT)</span>
                  </div>
                </Space>
              </div>

              <div>
                <div>Dữ liệu giấu dùng chung:</div>
                <Radio.Group value={secretMode} onChange={e=>setSecretMode(e.target.value)} style={{ marginBottom:8 }}>
                  <Radio.Button value="text">Text</Radio.Button>
                  <Radio.Button value="file">File</Radio.Button>
                </Radio.Group>
                {secretMode === 'text' ? (
                  <Input.TextArea
                    value={secretText}
                    onChange={e=>setSecretText(e.target.value)}
                    rows={3}
                    placeholder="Nhập text dùng chung cho toàn bộ ảnh"
                    showCount maxLength={2000}
                  />
                ) : (
                  <Upload
                    accept="*"
                    maxCount={1}
                    beforeUpload={(f)=>{ setSecretFile(f); return Upload.LIST_IGNORE; }}
                    onRemove={()=>{ setSecretFile(null); return true; }}
                  >
                    <Button>Chọn file bí mật</Button>
                  </Upload>
                )}
                <Paragraph type="secondary" style={{ marginTop:6 }}>
                  Nếu backend chưa hỗ trợ file bí mật, hãy dùng chế độ <b>Text</b>.
                </Paragraph>
              </div>

              <Space>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={runBatch}
                  disabled={!canRun}
                  loading={running}
                >
                  Chạy Lô
                </Button>
                <Button icon={<ReloadOutlined />} onClick={clearAll} disabled={running}>
                  Làm Mới
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={()=>{
                    const resultsOnly = files.map(f => f.result).filter(Boolean) as NonNullable<RowState['result']>[];
                    exportCsv(resultsOnly);
                  }}
                  disabled={files.every(f=>!f.result)}
                >
                  Xuất CSV
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ===== Tiến Độ & Kết Quả ===== */}
      <Card title="Tiến Độ & Kết Quả">
        {(running || overall>0) && (
          <div style={{ width: 340, marginBottom: 12 }}>
            <Text type="secondary">Tiến độ tổng:</Text>
            <Progress percent={overall} status={running ? 'active' : 'normal'} />
          </div>
        )}
        <Table<RowState>
          size="small"
          pagination={{ pageSize: 8 }}
          dataSource={files}
          columns={[
            ...columnsBase,
            { title: 'Ghi chú', key: 'note', render: (_t, r) => r.result?.message ?? '' }
          ]}
          rowKey={(_,i)=>String(i)}
          locale={{ emptyText: 'Chưa có file nào được tải lên' }}
        />
        <Divider style={{ marginTop: 8 }} />
        <Text type="secondary">
          {files.filter(f=>f.result).length} kết quả đã hoàn tất / {files.length} tệp
        </Text>
      </Card>
    </div>
  );
}

/* tách columnsBase cho gọn */
const columnsBase: ColumnsType<RowState> = [
  { title: 'Tên File', key: 'name', render: (_t, r) => r.file.name },
  { title: 'Dữ Liệu', key: 'payload', render: (_t, r) => r.result?.payloadKB?.toFixed(2) ?? '' },
  { title: 'PSNR',    key: 'psnr',    render: (_t, r) => r.result?.psnr ? r.result.psnr.toFixed(2) : '' },
  { title: 'SSIM',    key: 'ssim',    render: (_t, r) => r.result?.ssim ? r.result.ssim.toFixed(4) : '' },
  { title: 'Thời Gian', key: 'time',  render: (_t, r) => r.result?.timeMs ?? '' },
  {
    title: 'Trạng Thái', key: 'status',
    render: (_t, r) =>
      r.state === 'running' ? <Progress percent={r.progress} size="small" /> :
      r.result ? <Tag color={r.result.status === 'OK' ? 'green' : 'red'}>{r.result.status}</Tag> :
      r.state === 'error' ? <Tag color="red">FAIL</Tag> : <Tag>QUEUED</Tag>
  }
];

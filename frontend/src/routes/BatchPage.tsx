import React from 'react';
import {
  Row, Col, Card, Upload, Button, Input, Typography, Space,
  Progress, Select, Slider, Switch, Table, Tag, Divider, message
} from 'antd';
import {
  InboxOutlined, PlayCircleOutlined, ReloadOutlined, DownloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
// import { http } from '../services/http'; // bật khi nối backend

const { Dragger } = Upload;
const { Text } = Typography;

/* ======================= Types ======================= */
type Method = 'sobel' | 'laplacian' | 'variance' | 'entropy';
type StatusUnion = 'OK' | 'FAIL';

type BatchConfig = {
  method: Method;          // Phương pháp phức tạp
  payloadCap: number;      // 10..90 %
  seed: string;            // PRNG/seed
  encrypt: boolean;        // Mã hoá
  compress: boolean;       // Nén
};

type BatchItemState = 'queued' | 'running' | 'done' | 'error';

type BatchResult = {
  key: string;
  filename: string;
  sizeKB: number;
  payloadKB: number;       // “Dữ Liệu”
  psnr?: number;
  ssim?: number;
  timeMs?: number;
  status: StatusUnion;
  message?: string;
};

type RowState = {
  file: File;
  progress: number;
  state: BatchItemState;
  result?: BatchResult;
};

/* =================== Utils =================== */
function toStatusUnion(val: unknown): StatusUnion {
  return String(val).toUpperCase() === 'OK' ? 'OK' : 'FAIL';
}

function exportCsv(rows: BatchResult[]) {
  const header = ['TenFile', 'DuLieu(KB)', 'PSNR', 'SSIM', 'ThoiGian(ms)', 'TrangThai', 'GhiChu'];
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
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `batch_results_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* ===== Mock API (thay bằng http.post khi có backend) ===== */
async function mockEmbedOne(
  file: File,
  cfg: BatchConfig,
  onProgress: (p:number)=>void
) {
  let p = 0;
  while (p < 100) {
    await new Promise(r => setTimeout(r, 80 + Math.random()*50));
    p = Math.min(98, p + 6 + Math.random()*10);
    onProgress(Math.round(p));
  }
  const payloadKB = Math.max(0.5, (file.size/1024) * (cfg.payloadCap/100) * 0.02);
  const psnr = 42 + Math.random()*4;
  const ssim = 0.975 + Math.random()*0.02;
  const timeMs = 250 + Math.random()*500;
  const status = Math.random() > 0.05 ? 'OK' : 'FAIL';
  return { payloadKB, psnr, ssim, timeMs, status, message: status==='OK'?undefined:'CRC FAIL' };
}

/* ======================= Component ======================= */
export default function BatchPage() {
  // Files
  const [files, setFiles] = React.useState<RowState[]>([]);
  const [uploadKey, setUploadKey] = React.useState(0);

  const onChangeCovers = (info: any) => {
    const items: RowState[] = [];
    for (const it of info.fileList) {
      const f: File = it.originFileObj || it;
      if (!f || !/image\/(png|jpeg)/.test(f.type)) continue;
      items.push({ file: f, progress: 0, state: 'queued' });
    }
    setFiles(items);
  };

  // Config
  const [cfg, setCfg] = React.useState<BatchConfig>({
    method: 'sobel',
    payloadCap: 60,
    seed: '',
    encrypt: true,
    compress: false
  });

  // Run
  const [running, setRunning] = React.useState(false);
  const [overall, setOverall] = React.useState(0);

  const canRun = files.length > 0 && !running;

  const genSeed = () => {
    const s = Math.random().toString(36).slice(2, 10);
    setCfg(prev => ({ ...prev, seed: s }));
  };

  const clearAll = () => {
    setFiles([]);
    setOverall(0);
    setCfg(prev => ({ ...prev, seed: '' }));
    setUploadKey(k => k+1);
  };

  const runBatch = async () => {
    if (!canRun) return;
    setRunning(true);
    setOverall(0);
    setFiles(prev => prev.map(r => ({ ...r, progress: 0, state: 'queued', result: undefined })));

    for (let i=0; i<files.length; i++) {
      // mark running
      setFiles(prev => {
        const cp = [...prev];
        cp[i] = { ...cp[i], state: 'running', progress: 5 };
        return cp;
      });

      try {
        // --- Backend thật:
        // const form = new FormData();
        // form.append('cover', files[i].file);
        // Object.entries(cfg).forEach(([k,v])=> form.append(k, String(v)));
        // const res = await http.post('/api/v1/batch/embed-one', form, {
        //   onUploadProgress: e => {
        //     const p = e.total ? Math.round((e.loaded/e.total)*95) : 50;
        //     setFiles(prev => { const cp=[...prev]; cp[i]={...cp[i], progress:p}; return cp; });
        //   }
        // });
        // const out = res.data.data;

        // Mock:
        const out = await mockEmbedOne(files[i].file, cfg, (p) =>
          setFiles(prev => { const cp=[...prev]; cp[i]={...cp[i], progress:p}; return cp; })
        );

        const row: BatchResult = {
          key: String(i),
          filename: files[i].file.name,
          sizeKB: files[i].file.size/1024,
          payloadKB: out.payloadKB,
          psnr: out.psnr,
          ssim: out.ssim,
          timeMs: out.timeMs,
          status: toStatusUnion(out.status),
          message: out.message
        };

        setFiles(prev => {
          const cp = [...prev];
          cp[i] = { ...cp[i], progress: 100, state: 'done', result: row };
          return cp;
        });
      } catch (err:any) {
        const row: BatchResult = {
          key: String(i),
          filename: files[i].file.name,
          sizeKB: files[i].file.size/1024,
          payloadKB: 0,
          status: 'FAIL',
          message: err?.message || 'Network error'
        };
        setFiles(prev => {
          const cp=[...prev];
          cp[i] = { ...cp[i], state: 'error', progress: 100, result: row };
          return cp;
        });
      }

      setOverall(Math.round(((i+1)/files.length)*100));
    }

    setRunning(false);
    message.success('Đã chạy xong lô ảnh');
  };

  // Table
  const columns: ColumnsType<RowState> = [
    { title: 'Tên File', key: 'name', render: (_t, r) => r.file.name },
    { title: 'Dữ Liệu', key: 'payload', render: (_t, r) => r.result?.payloadKB?.toFixed(2) ?? '' },
    { title: 'PSNR', key: 'psnr', render: (_t, r) => r.result?.psnr ? r.result.psnr.toFixed(2) : '' },
    { title: 'SSIM', key: 'ssim', render: (_t, r) => r.result?.ssim ? r.result.ssim.toFixed(4) : '' },
    { title: 'Thời Gian', key: 'time', render: (_t, r) => r.result?.timeMs ?? '' },
    {
      title: 'Trạng Thái', key: 'status',
      render: (_t, r) =>
        r.state === 'running' ? <Progress percent={r.progress} size="small" /> :
        r.result ? <Tag color={r.result.status === 'OK' ? 'green' : 'red'}>{r.result.status}</Tag> :
        r.state === 'error' ? <Tag color="red">FAIL</Tag> : <Tag>QUEUED</Tag>
    }
  ];

  const resultsOnly: BatchResult[] = files.map(f => f.result).filter(Boolean) as BatchResult[];

  /* ======================= UI ======================= */
  return (
    <div style={{ padding: 16 }}>
      {/* ===== Cấu Hình Xử Lý Hàng Loạt ===== */}
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
              beforeUpload={(f)=> /image\/(png|jpeg)/.test(f.type) || Upload.LIST_IGNORE}
              onChange={onChangeCovers}
              customRequest={({onSuccess})=>{onSuccess && onSuccess('ok')}}
            >
              <div style={{ padding: 18 }}>
                <p className="ant-upload-drag-icon"><InboxOutlined style={{ fontSize: 44, color:'#1677ff' }}/></p>
                <p className="ant-upload-text">Click hoặc kéo thả nhiều ảnh để tải lên</p>
                <p className="ant-upload-hint">Hỗ trợ định dạng PNG, JPG (chọn nhiều)</p>
              </div>
            </Dragger>
          </Col>

          {/* Config bên phải */}
          <Col xs={24} md={10}>
            <Space direction="vertical" size="middle" style={{ width:'100%' }}>
              <div>
                <div>Phương pháp phức tạp:</div>
                <Select<Method>
                  value={cfg.method}
                  onChange={v=>setCfg({...cfg, method: v})}
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
                <Slider min={10} max={90} step={1}
                        value={cfg.payloadCap}
                        onChange={(v)=>setCfg({...cfg, payloadCap: Number(v)})}/>
              </div>

              <div>
                <div>Hạt giống/PRNG:</div>
                <Space.Compact style={{ width:'100%' }}>
                  <Input
                    placeholder="Nhập hạt giống"
                    value={cfg.seed}
                    onChange={e=>setCfg({...cfg, seed: e.target.value})}
                  />
                  <Button onClick={genSeed}>Tạo</Button>
                </Space.Compact>
              </div>

              <div>
                <Space direction="vertical" size={8}>
                  <div>
                    <Switch checked={cfg.encrypt} onChange={v=>setCfg({...cfg, encrypt:v})}/>
                    <span style={{ marginLeft: 8 }}>Mã hoá (mặc định: BẬT)</span>
                  </div>
                  <div>
                    <Switch checked={cfg.compress} onChange={v=>setCfg({...cfg, compress:v})}/>
                    <span style={{ marginLeft: 8 }}>Nén (mặc định: TẮT)</span>
                  </div>
                </Space>
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
                  onClick={()=>exportCsv(resultsOnly)}
                  disabled={resultsOnly.length===0}
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
          columns={columns}
          rowKey={(_,i)=>String(i)}
          locale={{ emptyText: 'Chưa có file nào được tải lên' }}
        />
        <Divider style={{ marginTop: 8 }} />
        <Text type="secondary">
          {resultsOnly.length} kết quả đã hoàn tất / {files.length} tệp
        </Text>
      </Card>
    </div>
  );
}

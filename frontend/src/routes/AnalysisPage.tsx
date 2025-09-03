import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Card, Col, Row, Upload, Button, Switch, Typography, Slider, Statistic, Tabs, message, Popconfirm
} from 'antd';
import { InboxOutlined, ReloadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

/* =========== Utils =========== */
function normalizeToUint8(arr: number[]): Uint8ClampedArray {
  let min = Infinity, max = -Infinity;
  for (const v of arr) { if (v < min) min = v; if (v > max) max = v; }
  const range = max - min || 1;
  const out = new Uint8ClampedArray(arr.length);
  for (let i = 0; i < arr.length; i++) out[i] = Math.round(((arr[i] - min) / range) * 255);
  return out;
}
function grayscaleToDataUrl(gray: Uint8ClampedArray, width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(width, height);
  for (let i = 0, j = 0; i < gray.length; i++, j += 4) {
    const g = gray[i];
    imgData.data[j] = g; imgData.data[j+1] = g; imgData.data[j+2] = g; imgData.data[j+3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}
function piecewiseLinearMap(x: number, points: Array<{x:number;y:number}>): number {
  const ps = [...points].sort((a,b)=>a.x-b.x);
  if (x <= ps[0].x) return ps[0].y;
  if (x >= ps[ps.length-1].x) return ps[ps.length-1].y;
  for (let i=0;i<ps.length-1;i++){
    const a=ps[i], b=ps[i+1];
    if (x>=a.x && x<=b.x){
      const t=(x-a.x)/(b.x-a.x || 1e-9);
      return a.y*(1-t)+b.y*t;
    }
  }
  return ps[ps.length-1].y;
}

/* =========== Mock services (đổi sang API thật khi sẵn sàng) =========== */
async function mockAnalyzeComplexity(image: File): Promise<{
  width: number; height: number;
  maps: Record<'sobel'|'laplacian'|'variance'|'entropy', number[]>;
}> {
  const bmp = await createImageBitmap(image);
  const width = bmp.width, height = bmp.height;
  const N = width*height;
  const rand = () => Math.random();
  return {
    width, height,
    maps: {
      sobel:     Array.from({length:N}, rand),
      laplacian: Array.from({length:N}, rand),
      variance:  Array.from({length:N}, rand),
      entropy:   Array.from({length:N}, rand),
    }
  };
}
async function mockDomainCompare(file: File, payloadCap: number) {
  const url = URL.createObjectURL(file);
  const fake = () => ({
    previewUrl: url,
    metrics: {
      psnr: 44 + Math.random()*2,
      ssim: 0.98 + Math.random()*0.01,
      payloadKB: 5 + Math.random()*2,
      timeMs: 400 + Math.random()*300
    }
  });
  return { spatial: fake(), dct: fake() };
}

/* =========== Page =========== */
const W = 320, H = 200, PAD = 16, R = 6;

export default function AnalysisPage() {
  // upload + preview gốc
  const [file, setFile] = useState<File | null>(null);
  const [originUrl, setOriginUrl] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState(0); // reset Dragger khi xóa ảnh

  // maps + normalize
  const [maps, setMaps] = useState<{
    width: number; height: number;
    maps: Record<'sobel'|'laplacian'|'variance'|'entropy', number[]>;
  } | null>(null);
  const [normalize, setNormalize] = useState(true);

  // curve editor (KHAI BÁO TRƯỚC để ref/state khác dùng)
  const [curvePoints, setCurvePoints] = useState<Array<{x:number;y:number}>>([
    { x: 0,   y: 0.1 },
    { x: 0.5, y: 0.6 },
    { x: 1,   y: 1.0 },
  ]);
  const [curveMethod, setCurveMethod] =
    useState<'sobel'|'laplacian'|'variance'|'entropy'>('sobel');
  const [bppThreshold, setBppThreshold] = useState<number>(8); // slider 1..8
  const svgRef = useRef<SVGSVGElement>(null);

  // Throttle & debounce cho Curve Editor
  const pointsRef = useRef(curvePoints);
  const [debouncedPoints, setDebouncedPoints] = useState(curvePoints);
  const rafRef = useRef<number | null>(null);

  // Đồng bộ ref khi curvePoints đổi
  useEffect(() => { pointsRef.current = curvePoints; }, [curvePoints]);

  // Debounce 80ms để giảm tính toán preview
  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedPoints(pointsRef.current);
    }, 80);
    return () => window.clearTimeout(id);
  }, [curvePoints]);

  // compare
  const [payloadCap, setPayloadCap] = useState(60);
  const [cmp, setCmp] = useState<any>(null);

  // loading flags
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [loadingCmp, setLoadingCmp] = useState(false);

  /* ---------- actions ---------- */
  const beforeUpload = (f: File) => {
    const ok = ['image/png','image/jpeg'].includes(f.type);
    if (!ok) message.error('Chỉ hỗ trợ PNG/JPG');
    return ok || Upload.LIST_IGNORE;
  };
  const onCustomUpload = async ({ file, onSuccess }: any) => {
    const f = file as File;
    setFile(f);
    setOriginUrl(URL.createObjectURL(f));
    // Không auto-analyze: người dùng chủ động nhấn nút
    onSuccess && onSuccess({}, new XMLHttpRequest());
  };
  const runAnalyze = async () => {
    if (!file) return message.warning('Hãy chọn ảnh trước');
    setLoadingAnalyze(true);
    try {
      const res = await mockAnalyzeComplexity(file); // TODO: đổi sang http.post('/analysis')
      setMaps(res);
      message.success('Đã phân tích complexity maps');
    } finally { setLoadingAnalyze(false); }
  };
  const resetAll = () => {
    setMaps(null);
    setCmp(null);
    message.success('Đã làm mới kết quả phân tích');
  };
  const removeImage = () => {
    if (originUrl) URL.revokeObjectURL(originUrl);
    setFile(null);
    setOriginUrl(null);
    setMaps(null);
    setCmp(null);
    setUploadKey(k => k + 1); // remount Dragger để clear file đã chọn
    message.success('Đã xóa ảnh đã tải lên');
  };
  const runCompare = async () => {
    if (!file) return message.warning('Hãy chọn ảnh trước');
    setLoadingCmp(true);
    try {
      const res = await mockDomainCompare(file, payloadCap); // TODO: gọi /embed cho spatial & dct
      setCmp(res);
    } finally { setLoadingCmp(false); }
  };

  /* ---------- render helpers ---------- */
  const mapTabs = useMemo(() => {
    if (!maps) return null;
    const mk = (name: string, arr: number[]) => {
      const data = normalize
        ? normalizeToUint8(arr)
        : new Uint8ClampedArray(arr.map(v => Math.max(0, Math.min(1, v))*255));
      const url = grayscaleToDataUrl(data, maps.width, maps.height);
      // Thu nhỏ ảnh trong tabs
      return (
        <img
          src={url}
          alt={name}
          style={{ width:'100%', maxHeight:320, objectFit:'contain', borderRadius:8 }}
        />
      );
    };
    return (
      <Tabs
        defaultActiveKey="sobel"
        items={[
          { key:'sobel',     label:'Phát Hiện Biên Sobel',   children: mk('Sobel',     maps.maps.sobel) },
          { key:'laplacian', label:'Bộ Lọc Laplacian',      children: mk('Laplacian', maps.maps.laplacian) },
          { key:'variance',  label:'Phân Tích Phương Sai',  children: mk('Variance',  maps.maps.variance) },
          { key:'entropy',   label:'Tính Toán Entropy',     children: mk('Entropy',   maps.maps.entropy) },
        ]}
      />
    );
  }, [maps, normalize]);

  const curvePath = useMemo(()=>{
    const ps = [...curvePoints].sort((a,b)=>a.x-b.x);
    const toXY = (p:{x:number;y:number}) => ({
      x: PAD + p.x * (W-2*PAD),
      y: H - PAD - p.y * (H-2*PAD),
    });
    const m = ps.map(toXY);
    if (!m.length) return '';
    return `M ${m[0].x},${m[0].y} ` + m.slice(1).map(p=>`L ${p.x},${p.y}`).join(' ');
  }, [curvePoints]);

  const bppPreviewUrl = useMemo(() => {
    if (!maps) return null;
    const arr = maps.maps[curveMethod];
    const bppNorm = arr.map(c =>
      piecewiseLinearMap(Math.max(0, Math.min(1, c)), debouncedPoints)
    );
    const bppMax = Math.max(1, Math.min(8, bppThreshold));
    const bppBits = bppNorm.map(v => v * 8);   // 0..8
    const capped  = bppBits.map(v => Math.min(v, bppMax));
    const view01 = capped.map(v => v / bppMax);
    const u8 = normalizeToUint8(view01);
    return grayscaleToDataUrl(u8, maps.width, maps.height);
  }, [maps, curveMethod, debouncedPoints, bppThreshold]);

  const onDrag = (idx:number)=>{
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();

    const move = (ev: MouseEvent) => {
      const x = (ev.clientX - rect.left - PAD) / (W - 2*PAD);
      const y = 1 - (ev.clientY - rect.top - PAD) / (H - 2*PAD);
      const nx = Math.min(1, Math.max(0, x));
      const ny = Math.min(1, Math.max(0, y));

      // cập nhật vào ref (không setState liên tục)
      const next = [...pointsRef.current];
      next[idx] = { x: nx, y: ny };
      pointsRef.current = next;

      // rAF: tối đa ~60fps mới setState 1 lần
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          setCurvePoints(pointsRef.current);
        });
      }
    };

    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      // chốt lại ngay để preview cập nhật
      setCurvePoints(pointsRef.current);
      setDebouncedPoints(pointsRef.current);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <Row gutter={[12,12]}>
      {/* ===== Tải lên ảnh & ảnh gốc bên phải ===== */}
      <Col span={24}>
        <Card title="Tải Lên Ảnh Phân Tích">
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Dragger
                key={uploadKey}
                multiple={false}
                maxCount={1}
                beforeUpload={beforeUpload}
                customRequest={onCustomUpload}
                showUploadList={false} // ẩn danh sách file mặc định để tránh chồng nút
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">Click hoặc kéo thả ảnh để tải lên</p>
                <p className="ant-upload-hint">Hỗ trợ PNG/JPG để phân tích độ phức tạp</p>
              </Dragger>

              {/* --- Thanh nút ngay dưới Dragger --- */}
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={runAnalyze}
                  loading={loadingAnalyze}
                  disabled={!file}
                >
                  Phân Tích
                </Button>

                <Button
                  icon={<ReloadOutlined />}
                  onClick={resetAll}
                  disabled={!file}
                >
                  Làm Mới
                </Button>

                <Popconfirm
                  title="Xóa ảnh đã tải lên?"
                  description="Thao tác này sẽ xóa ảnh và các kết quả phân tích/so sánh."
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={removeImage}
                  disabled={!file}
                >
                  <Button danger icon={<DeleteOutlined />} disabled={!file}>
                    Xóa ảnh
                  </Button>
                </Popconfirm>

                <span style={{ marginLeft: 12 }}>Normalize</span>
                <Switch checked={normalize} onChange={setNormalize}/>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <Typography.Text strong>Ảnh gốc:</Typography.Text>
              <div style={{
                border:'1px solid #eee', borderRadius:8, marginTop:8,
                display:'flex', alignItems:'center', justifyContent:'center',
                minHeight:240, background:'#fff'
              }}>
                {originUrl
                  ? <img src={originUrl} style={{ maxWidth:'100%', maxHeight:240, objectFit:'contain' }}/>
                  : <Typography.Text type="secondary">Chưa có ảnh</Typography.Text>}
              </div>
            </Col>
          </Row>
        </Card>
      </Col>

      {/* ===== Bản đồ độ phức tạp (Tabs theo đúng nhãn VN) ===== */}
      <Col span={24}>
        <Card title="Bản Đồ Độ Phức Tạp">
          {!maps
            ? <Typography.Text type="secondary">Chưa có dữ liệu — hãy tải ảnh và nhấn “Phân Tích”.</Typography.Text>
            : <>{mapTabs}</>}
        </Card>
      </Col>

      {/* ===== Trình chỉnh sửa đường cong + slider ngưỡng BPP + preview ===== */}
      <Col span={24}>
        <Card title="Trình Chỉnh Sửa Đường Cong & Xem Trước BPP">
          {!maps && <Typography.Text type="secondary">Tải ảnh và Phân tích trước khi dùng mục này.</Typography.Text>}

          <div style={{ opacity: maps?1:0.5, pointerEvents: maps? 'auto':'none' }}>
            <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap', marginBottom:8 }}>
              <div style={{ minWidth:240 }}>
                <Typography.Text type="secondary">Ngưỡng BPP:</Typography.Text>
                <Slider
                  min={1} max={8} step={1}
                  value={bppThreshold}
                  onChange={setBppThreshold}
                  marks={{1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8'}}
                />
                <Typography.Text type="secondary">Ngưỡng hiện tại: <b>{bppThreshold} bpp</b></Typography.Text>
              </div>

              <div>
                <Typography.Text type="secondary">Map dùng cho preview:</Typography.Text><br/>
                <select value={curveMethod} onChange={(e)=>setCurveMethod(e.target.value as any)}>
                  <option value="sobel">Phát Hiện Biên Sobel</option>
                  <option value="laplacian">Bộ Lọc Laplacian</option>
                  <option value="variance">Phân Tích Phương Sai</option>
                  <option value="entropy">Tính Toán Entropy</option>
                </select>
              </div>

              <svg ref={svgRef} width={W} height={H}
                   style={{ background:'#fafafa', borderRadius:8, boxShadow:'inset 0 0 0 1px #eee' }}>
                <path d={curvePath} stroke="#1677ff" fill="none" strokeWidth={2}/>
                {[...curvePoints].sort((a,b)=>a.x-b.x).map((p, i) => {
                  const x = PAD + p.x*(W-2*PAD);
                  const y = H - PAD - p.y*(H-2*PAD);
                  return <circle key={i} cx={x} cy={y} r={R} fill="#1677ff" onMouseDown={()=>onDrag(i)}/>
                })}
                <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke="#999" />
                <line x1={PAD} y1={PAD}   x2={PAD}   y2={H-PAD} stroke="#999" />
              </svg>

              <div style={{ flex:1, minWidth:240 }}>
                <Typography.Text type="secondary">Xem Trước Bản Đồ BPP:</Typography.Text>
                <div style={{ border:'1px solid #eee', borderRadius:8, overflow:'hidden' }}>
                  {bppPreviewUrl
                    ? <img src={bppPreviewUrl} style={{ width:'100%' }}/>
                    : <div style={{ padding:12, color:'#999' }}>Chưa có dữ liệu</div>}
                </div>
                <Typography.Paragraph type="secondary" style={{ marginTop:8 }}>
                  Bản đồ Bits Per Pixel với ngưỡng <b>{bppThreshold}</b>
                </Typography.Paragraph>
              </div>
            </div>
          </div>
        </Card>
      </Col>

      {/* ===== So sánh Spatial vs DCT ===== */}
      <Col span={24}>
        <Card title="So sánh Spatial vs DCT (cùng payload cap)">
          <div>
            Payload cap: <b>{payloadCap}%</b>
            <Slider min={10} max={90} step={1} value={payloadCap} onChange={setPayloadCap} />
            <Button type="primary" onClick={runCompare} loading={loadingCmp} disabled={!file}>Compare</Button>
          </div>

          {cmp && (
            <Row gutter={12} style={{ marginTop:8 }}>
              <Col xs={24} md={12}>
                <Card size="small" title="Spatial" hoverable>
                  {cmp.spatial?.previewUrl && <img src={cmp.spatial.previewUrl} style={{ width:'100%', borderRadius:8 }}/>}
                  <Row gutter={12} style={{ marginTop:8 }}>
                    <Col span={12}><Statistic title="PSNR (dB)" value={cmp.spatial.metrics.psnr.toFixed(2)} /></Col>
                    <Col span={12}><Statistic title="SSIM" value={cmp.spatial.metrics.ssim.toFixed(3)} /></Col>
                    <Col span={12}><Statistic title="Payload (KB)" value={cmp.spatial.metrics.payloadKB.toFixed(2)} /></Col>
                    <Col span={12}><Statistic title="Time (ms)" value={Math.round(cmp.spatial.metrics.timeMs)} /></Col>
                  </Row>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card size="small" title="DCT" hoverable>
                  {cmp.dct?.previewUrl && <img src={cmp.dct.previewUrl} style={{ width:'100%', borderRadius:8 }}/>}
                  <Row gutter={12} style={{ marginTop:8 }}>
                    <Col span={12}><Statistic title="PSNR (dB)" value={cmp.dct.metrics.psnr.toFixed(2)} /></Col>
                    <Col span={12}><Statistic title="SSIM" value={cmp.dct.metrics.ssim.toFixed(3)} /></Col>
                    <Col span={12}><Statistic title="Payload (KB)" value={cmp.dct.metrics.payloadKB.toFixed(2)} /></Col>
                    <Col span={12}><Statistic title="Time (ms)" value={Math.round(cmp.dct.metrics.timeMs)} /></Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          )}
        </Card>
      </Col>
    </Row>
  );
}

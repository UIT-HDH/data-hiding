#!/usr/bin/env python3
"""
CORS-enabled FastAPI server đơn giản cho Tab Embed
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import base64
import io
from PIL import Image
import numpy as np
from typing import Optional

app = FastAPI(title="Tab Embed API - CORS Fixed")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"]
)

@app.get("/")
async def root():
    return {"message": "Tab Embed API with CORS enabled", "cors": "OK"}

@app.get("/health")
async def health():
    return {"status": "healthy", "cors_enabled": True}

@app.get("/embed/methods")
async def get_methods():
    methods = [
        {"value": "sobel", "label": "Sobel Edge Detection"},
        {"value": "laplacian", "label": "Laplacian Filter"},
        {"value": "variance", "label": "Variance Analysis"},
        {"value": "entropy", "label": "Entropy Calculation"}
    ]
    return {"data": methods}

@app.get("/embed/domains")
async def get_domains():
    domains = [
        {"value": "spatial", "label": "Spatial Domain (LSB)"},
        {"value": "dct", "label": "DCT Domain"}
    ]
    return {"data": domains}

def image_to_base64(img):
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

@app.post("/embed")
async def embed_endpoint(
    coverImage: UploadFile = File(...),
    secretText: Optional[str] = Form(None),
    secretType: str = Form("text"),
    complexityMethod: str = Form("sobel"),
    payloadCap: float = Form(50.0),
    domain: str = Form("spatial"),
    encrypt: bool = Form(False),
    compress: bool = Form(False)
):
    try:
        # Read and process image
        image_data = await coverImage.read()
        img = Image.open(io.BytesIO(image_data))
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        w, h = img.size
        
        # Create mock stego image (add minimal noise)
        arr = np.array(img)
        noise = np.random.randint(-1, 2, arr.shape)
        stego_arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
        stego_img = Image.fromarray(stego_arr)
        
        # Create mock complexity map
        complexity = np.random.rand(h, w) * 255
        complexity_img = Image.fromarray(complexity.astype(np.uint8))
        
        # Create mock embedding mask
        mask = (np.random.rand(h, w) > 0.4) * 255
        mask_img = Image.fromarray(mask.astype(np.uint8))
        
        # Convert to base64
        original_b64 = image_to_base64(img)
        stego_b64 = image_to_base64(stego_img)
        complexity_b64 = image_to_base64(complexity_img)
        mask_b64 = image_to_base64(mask_img)
        
        # Mock metrics
        psnr = round(np.random.uniform(38, 45), 2)
        ssim = round(np.random.uniform(0.95, 0.99), 4)
        payload = len(secretText or "") if secretText else 0
        
        result = {
            "originalImage": original_b64,
            "stegoImage": stego_b64,
            "complexityMap": complexity_b64,
            "embeddingMask": mask_b64,
            "metadata": {
                "dimensions": {"width": w, "height": h},
                "format": "PNG",
                "size": len(image_data)
            },
            "metrics": {
                "psnr": psnr,
                "ssim": ssim,
                "payloadBytes": payload,
                "processingTime": round(np.random.uniform(100, 300), 1),
                "bpp": round(payload * 8 / (w * h), 4)
            },
            "configuration": {
                "complexityMethod": complexityMethod,
                "payloadCap": payloadCap,
                "domain": domain,
                "encrypt": encrypt,
                "compress": compress
            },
            "logs": [
                f"✅ Image processed: {w}x{h}",
                f"🔍 Method: {complexityMethod}",
                f"📊 Payload: {payloadCap}%",
                f"🎯 Domain: {domain}",
                f"📈 PSNR: {psnr}dB, SSIM: {ssim}"
            ]
        }
        
        return {
            "success": True,
            "message": "Embedding completed successfully!",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting CORS-enabled Tab Embed API...")
    print("✅ CORS: Allow all origins")
    print("🔗 Endpoints: /health, /embed, /embed/methods, /embed/domains")
    uvicorn.run(app, host="0.0.0.0", port=8000)

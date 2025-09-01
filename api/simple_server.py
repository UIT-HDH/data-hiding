#!/usr/bin/env python3
"""
Simple FastAPI server với CORS đã sửa cho Tab Embed
"""

import os
import sys
import base64
import io
from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
import json

# Đảm bảo CORS origins bao gồm localhost:5173
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",  # Vite dev server backup
    "*"  # Tạm thời cho phép tất cả để test
]

app = FastAPI(
    title="Steganography API - Tab Embed",
    description="API for Tab Embed functionality with CORS fixed",
    version="1.0.0"
)

# CORS middleware - đặt đầu tiên để xử lý preflight
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"]
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "cors_origins": CORS_ORIGINS}

@app.get("/embed/methods")
async def get_complexity_methods():
    """Get available complexity methods"""
    methods = [
        {"value": "sobel", "label": "Sobel Edge Detection", "description": "Detects edges using Sobel operator"},
        {"value": "laplacian", "label": "Laplacian Filter", "description": "Detects edges using Laplacian operator"},
        {"value": "variance", "label": "Variance Analysis", "description": "Analyzes local variance in image regions"},
        {"value": "entropy", "label": "Entropy Calculation", "description": "Calculates information entropy of image blocks"}
    ]
    return {"data": methods}

@app.get("/embed/domains")
async def get_embedding_domains():
    """Get available embedding domains"""
    domains = [
        {"value": "spatial", "label": "Spatial Domain (LSB)", "description": "Direct pixel manipulation using LSB"},
        {"value": "dct", "label": "DCT Domain", "description": "Frequency domain embedding using DCT"}
    ]
    return {"data": domains}

def create_mock_complexity_map(width: int, height: int) -> str:
    """Tạo complexity map giả lập"""
    # Tạo complexity map với noise
    complexity = np.random.rand(height, width) * 255
    
    # Tạo image từ array
    img = Image.fromarray(complexity.astype(np.uint8))
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def create_mock_embedding_mask(width: int, height: int) -> str:
    """Tạo embedding mask giả lập"""
    # Tạo binary mask (0 hoặc 255)
    mask = (np.random.rand(height, width) > 0.3) * 255
    
    # Tạo image từ array 
    img = Image.fromarray(mask.astype(np.uint8))
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def image_to_base64(image: Image.Image) -> str:
    """Convert PIL Image to base64 string"""
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    buffer.seek(0)
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

@app.post("/embed")
async def embed_data(
    coverImage: UploadFile = File(...),
    secretText: Optional[str] = Form(None),
    secretFile: Optional[UploadFile] = File(None),
    secretType: str = Form("text"),
    complexityMethod: str = Form("sobel"),
    payloadCap: float = Form(50.0),
    minBpp: float = Form(1.0),
    maxBpp: float = Form(4.0),
    threshold: float = Form(128.0),
    domain: str = Form("spatial"),
    seed: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    encrypt: bool = Form(False),
    compress: bool = Form(False)
):
    """
    Embed secret data into cover image với CORS support
    """
    try:
        # Kiểm tra file upload
        if not coverImage.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Cover file must be an image")
        
        # Đọc cover image
        cover_bytes = await coverImage.read()
        cover_img = Image.open(io.BytesIO(cover_bytes))
        
        # Convert sang RGB nếu cần
        if cover_img.mode != 'RGB':
            cover_img = cover_img.convert('RGB')
        
        width, height = cover_img.size
        
        # Kiểm tra secret data
        if secretType == "text" and not secretText:
            raise HTTPException(status_code=400, detail="Secret text is required")
        elif secretType == "file" and not secretFile:
            raise HTTPException(status_code=400, detail="Secret file is required")
        
        # Mock steganography process
        # Tạo stego image (thêm noise nhẹ)
        img_array = np.array(cover_img)
        noise = np.random.randint(-2, 3, img_array.shape)
        stego_array = np.clip(img_array + noise, 0, 255).astype(np.uint8)
        stego_img = Image.fromarray(stego_array)
        
        # Tạo complexity map và embedding mask
        complexity_map_b64 = create_mock_complexity_map(width, height)
        embedding_mask_b64 = create_mock_embedding_mask(width, height)
        
        # Convert images to base64
        original_b64 = image_to_base64(cover_img)
        stego_b64 = image_to_base64(stego_img)
        
        # Mock metrics
        psnr = round(np.random.uniform(35, 45), 2)
        ssim = round(np.random.uniform(0.92, 0.99), 4)
        payload_bytes = len(secretText.encode()) if secretText else (await secretFile.read()).__len__() if secretFile else 0
        processing_time = round(np.random.uniform(150, 500), 1)
        bpp = round(payload_bytes * 8 / (width * height), 4)
        
        # Response data
        result = {
            "originalImage": original_b64,
            "stegoImage": stego_b64,
            "complexityMap": complexity_map_b64,
            "embeddingMask": embedding_mask_b64,
            "metadata": {
                "dimensions": {"width": width, "height": height},
                "format": cover_img.format or "PNG",
                "size": len(cover_bytes)
            },
            "metrics": {
                "psnr": psnr,
                "ssim": ssim,
                "payloadBytes": payload_bytes,
                "processingTime": processing_time,
                "bpp": bpp
            },
            "configuration": {
                "complexityMethod": complexityMethod,
                "payloadCap": payloadCap,
                "domain": domain,
                "encrypt": encrypt,
                "compress": compress,
                "seed": seed
            },
            "logs": [
                f"✅ Cover image loaded: {width}x{height}",
                f"🔍 Complexity method: {complexityMethod}",
                f"📊 Payload capacity: {payloadCap}%",
                f"🎯 Domain: {domain}",
                f"🔐 Encryption: {'Enabled' if encrypt else 'Disabled'}",
                f"📦 Compression: {'Enabled' if compress else 'Disabled'}",
                f"⚡ Processing completed in {processing_time}ms",
                f"📈 Quality metrics - PSNR: {psnr}dB, SSIM: {ssim}"
            ]
        }
        
        return JSONResponse(
            content={
                "success": True,
                "message": "Data embedded successfully",
                "data": result
            },
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            }
        )
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": f"Embedding failed: {str(e)}",
                "error": str(e)
            },
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", 
                "Access-Control-Allow-Headers": "*",
            }
        )

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting Steganography API with CORS origins: {CORS_ORIGINS}")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

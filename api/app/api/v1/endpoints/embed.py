"""
Simple Embed/Extract endpoints for fast steganography operations.
Academic project focusing on quick key embedding and extraction.
"""

from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
import time
from PIL import Image
import io
from datetime import datetime

from app.services.steganography import steganography_service
from app.config.simple_settings import get_settings

settings = get_settings()

router = APIRouter()

@router.post("/embed")
async def embed_data(
    coverImage: UploadFile = File(...),
    secretText: str = Form(...)
) -> dict:
    """
    Embed key/secret text vào cover image using Adaptive LSB Steganography.
    
    Đây là API tối ưu cho tốc độ, tập trung vào:
    - Input đơn giản: coverImage + secretText
    - Output tập trung: chỉ stego image + basic info
    - Performance cao: tối ưu cho tốc độ
    - Response đơn giản: không có complexity maps, metrics chi tiết
    
    Args:
        coverImage: Cover image để embed
        secretText: Secret text/key cần embed
        
    Returns:
        Simple response với stego image
    """
    start_time = time.time()
    
    try:
        # 1. Basic input validation
        if not secretText or not secretText.strip():
            raise HTTPException(status_code=400, detail="Secret text cannot be empty")
        
        if not coverImage.content_type or not coverImage.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Please upload a valid image file")
        
        # 2. Load cover image
        try:
            image_data = await coverImage.read()
            cover_image = Image.open(io.BytesIO(image_data))
            
            if cover_image.mode != 'RGB':
                cover_image = cover_image.convert('RGB')
                
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")
        
        # 3. Basic size validation
        width, height = cover_image.size
        if width < 50 or height < 50:
            raise HTTPException(status_code=400, detail="Image too small (minimum 50x50 pixels)")
        
        if width > 2000 or height > 2000:
            raise HTTPException(status_code=400, detail="Image too large (maximum 2000x2000 pixels)")
        
        # 4. Simple embedding
        result = steganography_service.embed_text_simple(cover_image, secretText.strip())
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Embedding failed'))
        
        # 5. Calculate processing time
        processing_time = round(time.time() - start_time, 3)
        
        # 6. Simple response
        response = {
            'success': True,
            'stegoImage': f"data:image/png;base64,{result['stego_image_base64']}",
            'processingTime': processing_time,
            'embeddingInfo': {
                'textLength': len(secretText.strip()),
                'imageSize': f"{width}x{height}",
                'capacityUsed': result.get('capacity_used', 0)
            }
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")


@router.post("/extract")
async def extract_data(
    stegoImage: UploadFile = File(...)
) -> dict:
    """
    Extract key/secret text từ stego image using Adaptive LSB Steganography.
    
    Đây là API tối ưu cho tốc độ, tập trung vào:
    - Input tối giản: chỉ cần stego image
    - Output tập trung: extracted key/text
    - Performance cao: tối ưu cho tốc độ
    - Error handling đơn giản
    
    Args:
        stegoImage: Stego image chứa hidden data/key
        
    Returns:
        Simple response với extracted key
    """
    start_time = time.time()
    
    try:
        # 1. Basic input validation
        if not stegoImage.content_type or not stegoImage.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Please upload a valid image file")
        
        # 2. Load stego image
        try:
            image_data = await stegoImage.read()
            stego_image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if needed
            if stego_image.mode != 'RGB':
                stego_image = stego_image.convert('RGB')
                
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")
        
        # 3. Simple extraction
        result = steganography_service.extract_text_simple(stego_image)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Cannot extract key from image'))
        
        # 4. Calculate processing time
        processing_time = round(time.time() - start_time, 3)
        
        # 5. Simple response
        response = {
            'success': True,
            'extractedKey': result['extracted_text'],
            'processingTime': processing_time,
            'imageInfo': {
                'size': f"{stego_image.size[0]}x{stego_image.size[1]}",
                'extractedLength': len(result['extracted_text']) if result['extracted_text'] else 0
            }
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check endpoint for steganography service"""
    return {
        'status': 'healthy',
        'service': 'steganography',
        'algorithm': 'Adaptive LSB with Sobel Edge Detection',
        'version': '1.0.0',
        'endpoints': ['embed', 'extract']
    }
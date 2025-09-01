"""
Enhanced Embed endpoint for Tab "Embed" functionality.
Academic project focusing on adaptive steganography with complexity analysis.
"""

from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
import time
from PIL import Image
import io
from datetime import datetime

from app.services.steganography import steganography_service

router = APIRouter()

@router.post("/embed")
async def embed_data(
    coverImage: UploadFile = File(...),
    secretText: str = Form(...)
) -> dict:
    """
    Embed secret text into cover image using Adaptive LSB Steganography.
    
    Academic Implementation:
    - Sobel Edge Detection for complexity analysis
    - Adaptive LSB: 1-bit for smooth areas, 2-bit for complex areas
    - Blue channel embedding in spatial domain
    
    Args:
        coverImage: Cover image file (PNG, JPG, etc.)
        secretText: Secret text to embed
        
    Returns:
        Embedding result with stego image and metrics
    """
    start_time = time.time()
    
    try:
        # 1. Validate inputs
        if not secretText or not secretText.strip():
            raise HTTPException(status_code=400, detail="Secret text cannot be empty")
        
        if not coverImage.content_type or not coverImage.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Please upload a valid image file")
        
        # 2. Load and validate cover image
        try:
            image_data = await coverImage.read()
            cover_image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if cover_image.mode != 'RGB':
                cover_image = cover_image.convert('RGB')
                
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")
        
        # 3. Validate image size (reasonable limits for academic demo)
        width, height = cover_image.size
        if width < 50 or height < 50:
            raise HTTPException(status_code=400, detail="Image too small (minimum 50x50 pixels)")
        
        if width > 2000 or height > 2000:
            raise HTTPException(status_code=400, detail="Image too large (maximum 2000x2000 pixels)")
        
        # 4. Perform embedding using steganography service
        result = steganography_service.embed_text_in_image(cover_image, secretText.strip())
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Embedding failed'))
        
        # 5. Calculate processing time
        processing_time = round(time.time() - start_time, 3)
        
        # 6. Prepare response
        response = {
            'success': True,
            'message': 'Text embedded successfully',
            'data': {
                'stegoImage': f"data:image/png;base64,{result['stego_image_base64']}",
                'complexityMap': f"data:image/png;base64,{result['complexity_map_base64']}",
                'embeddingMask': f"data:image/png;base64,{result['embedding_mask_base64']}",
                'metrics': result['metrics'],
                'embeddingInfo': result['embedding_info'],
                'capacityAnalysis': result['capacity_analysis'],
                'algorithmInfo': result['algorithm_info'],
                'processingTime': processing_time,
                'timestamp': datetime.now().isoformat()
            }
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/extract")
async def extract_data(
    stegoImage: UploadFile = File(...)
) -> dict:
    """
    Extract secret text from stego image using Adaptive LSB Steganography.
    
    Args:
        stegoImage: Stego image file containing hidden data
        
    Returns:
        Extraction result with recovered text
    """
    start_time = time.time()
    
    try:
        # 1. Validate input
        if not stegoImage.content_type or not stegoImage.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Please upload a valid image file")
        
        # 2. Load stego image
        try:
            image_data = await stegoImage.read()
            stego_image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if stego_image.mode != 'RGB':
                stego_image = stego_image.convert('RGB')
                
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")
        
        # 3. Perform extraction using steganography service
        result = steganography_service.extract_text_from_image(stego_image)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Extraction failed'))
        
        # 4. Calculate processing time
        processing_time = round(time.time() - start_time, 3)
        
        # 5. Prepare response
        response = {
            'success': True,
            'message': 'Text extracted successfully',
            'data': {
                'extractedText': result['extracted_text'],
                'extractionInfo': result['extraction_info'],
                'imageInfo': result['image_info'],
                'algorithmInfo': result['algorithm_info'],
                'processingTime': processing_time,
                'timestamp': datetime.now().isoformat()
            }
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check endpoint for embed service"""
    return {
        'status': 'healthy',
        'service': 'embed',
        'algorithm': 'Adaptive LSB with Sobel Edge Detection',
        'version': '1.0.0'
    }

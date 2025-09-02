"""
Simple Steganography Service - Academic Project

Adaptive LSB Steganography with Sobel Edge Detection
- Optimized for speed and simplicity
- Focus on core functionality only
- Clean and minimal implementation
"""

import io
import base64
import struct
import time
import numpy as np
from typing import Dict, Any, Optional, Tuple
from PIL import Image


class SteganographyService:
    """
    Simplified steganography service for fast embedding and extraction.
    
    Core features:
    - Adaptive LSB with Sobel edge detection
    - Text-to-binary conversion with UTF-8 support
    - Fast embedding and extraction
    - Minimal overhead and dependencies
    """
    
    def text_to_binary(self, text: str) -> str:
        """Chuyển text thành chuỗi binary với format: [32-bit length][UTF-8 bytes][delimiter]"""
        if not text:
            return ""
        
        text_bytes = text.encode('utf-8')
        length = len(text_bytes)
        header = struct.pack('>I', length)
        full_data = header + text_bytes + b'\xFF'
        binary = ''.join(format(byte, '08b') for byte in full_data)
        
        return binary

    def binary_to_text(self, binary_string: str) -> str:
        """Chuyển chuỗi binary thành text"""
        if not binary_string or len(binary_string) < 32:
            return ""
        
        try:
            # Đọc 32-bit length header
            length_bits = binary_string[:32]
            length_bytes = bytes(int(length_bits[i:i+8], 2) for i in range(0, 32, 8))
            length = struct.unpack('>I', length_bytes)[0]
            
            if length <= 0 or length > 10000:
                return ""
            
            # Đọc data
            data_start = 32
            data_end = data_start + (length * 8)
            
            if data_end > len(binary_string):
                return ""
            
            data_bits = binary_string[data_start:data_end]
            data_bytes = bytes(int(data_bits[i:i+8], 2) for i in range(0, len(data_bits), 8))
            text = data_bytes.decode('utf-8', errors='ignore')
            return text
            
        except Exception:
            return ""

    def sobel_edge_detection(self, image: np.ndarray) -> np.ndarray:
        """Sobel edge detection để tính complexity map"""
        if len(image.shape) == 3:
            gray = np.mean(image, axis=2).astype(np.uint8)
        else:
            gray = image
        
        # Sobel kernels
        sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32)
        sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32)
        
        h, w = gray.shape
        grad_x = np.zeros((h, w), dtype=np.float32)
        grad_y = np.zeros((h, w), dtype=np.float32)
        
        # Apply Sobel filters
        for i in range(1, h-1):
            for j in range(1, w-1):
                region = gray[i-1:i+2, j-1:j+2].astype(np.float32)
                grad_x[i, j] = np.sum(region * sobel_x)
                grad_y[i, j] = np.sum(region * sobel_y)
        
        # Calculate magnitude
        magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        # Normalize to [0, 255]
        if magnitude.max() > 0:
            magnitude = (magnitude / magnitude.max() * 255).astype(np.uint8)
        
        return magnitude

    def adaptive_lsb_embed(self, cover: np.ndarray, binary_data: str) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Adaptive LSB embedding với Sobel edge detection"""
        h, w, c = cover.shape
        stego = cover.copy()
        
        # Generate complexity map
        complexity_map = self.sobel_edge_detection(cover)
        
        # Calculate complexity threshold
        block_h, block_w = h // 2, w // 2
        block_complexity = np.zeros((block_h, block_w))
        
        for i in range(block_h):
            for j in range(block_w):
                block_region = complexity_map[i*2:(i+1)*2, j*2:(j+1)*2]
                block_complexity[i, j] = np.mean(block_region)
        
        complexity_threshold = np.mean(block_complexity)
        
        # Embed data
        data_index = 0
        data_length = len(binary_data)
        
        for i in range(block_h):
            for j in range(block_w):
                if data_index >= data_length:
                    break
                
                # Determine bits per pixel
                bits_per_pixel = 2 if block_complexity[i, j] > complexity_threshold else 1
                
                # Process block
                for bi in range(2):
                    for bj in range(2):
                        if data_index >= data_length:
                            break
                        
                        pixel_i = i * 2 + bi
                        pixel_j = j * 2 + bj
                        
                        if pixel_i < h and pixel_j < w:
                            # Embed in blue channel
                            blue_value = stego[pixel_i, pixel_j, 2]
                            
                            # Extract bits to embed
                            bits_to_embed = binary_data[data_index:data_index + bits_per_pixel]
                            
                            if len(bits_to_embed) == bits_per_pixel:
                                # Clear LSBs and set new bits
                                if bits_per_pixel == 1:
                                    blue_value = (blue_value & 0xFE) | int(bits_to_embed[0])
                                else:  # 2 bits
                                    blue_value = (blue_value & 0xFC) | int(bits_to_embed, 2)
                                
                                stego[pixel_i, pixel_j, 2] = blue_value
                                data_index += bits_per_pixel
        
        # Metadata
        metadata = {
            'data_embedded': data_index,
            'complexity_threshold': float(complexity_threshold),
            'total_capacity': block_h * block_w * 4 * 2,  # Rough estimate
            'bits_embedded': data_index
        }
        
        return stego, metadata

    def adaptive_lsb_extract(self, stego: np.ndarray) -> Tuple[str, Dict[str, Any]]:
        """Adaptive LSB extraction"""
        h, w, c = stego.shape
        
        # Recreate complexity map
        complexity_map = self.sobel_edge_detection(stego)
        
        # Calculate same threshold as embedding
        block_h, block_w = h // 2, w // 2
        block_complexity = np.zeros((block_h, block_w))
        
        for i in range(block_h):
            for j in range(block_w):
                block_region = complexity_map[i*2:(i+1)*2, j*2:(j+1)*2]
                block_complexity[i, j] = np.mean(block_region)
        
        complexity_threshold = np.mean(block_complexity)
        
        # Extract binary string
        binary_string = ""
        
        for i in range(block_h):
            for j in range(block_w):
                # Determine bits per pixel
                bits_per_pixel = 2 if block_complexity[i, j] > complexity_threshold else 1
                
                # Process block
                for bi in range(2):
                    for bj in range(2):
                        pixel_i = i * 2 + bi
                        pixel_j = j * 2 + bj
                        
                        if pixel_i < h and pixel_j < w:
                            blue_value = stego[pixel_i, pixel_j, 2]
                            
                            if bits_per_pixel == 1:
                                bit = str(blue_value & 1)
                                binary_string += bit
                            else:  # 2 bits
                                bits = blue_value & 3
                                binary_string += format(bits, '02b')
        
        # Convert binary to text
        extracted_text = self.binary_to_text(binary_string)
        
        metadata = {
            'bits_extracted': len(binary_string),
            'complexity_threshold': float(complexity_threshold),
            'text_length': len(extracted_text) if extracted_text else 0
        }
        
        return extracted_text, metadata

    def image_to_base64(self, image_array: np.ndarray) -> str:
        """Convert numpy array to base64 string"""
        image = Image.fromarray(image_array.astype(np.uint8))
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return image_base64

    def embed_text_simple(self, cover_image: Image.Image, secret_text: str) -> Dict[str, Any]:
        """
        Simple và nhanh method để embed key/text vào cover image.
        
        Args:
            cover_image: PIL Image object làm cover
            secret_text: Text cần embed
            
        Returns:
            Dictionary với stego image và basic info
        """
        try:
            cover_array = np.array(cover_image)
            binary_data = self.text_to_binary(secret_text)
            
            if not binary_data:
                return {
                    'success': False,
                    'error': 'Failed to convert text to binary'
                }
            
            # Fast embedding without generating complex visualizations
            stego_array, embed_metadata = self.adaptive_lsb_embed(cover_array, binary_data)
            
            # Convert to base64 without extra processing
            stego_base64 = self.image_to_base64(stego_array)
            
            # Calculate basic capacity info
            total_capacity = embed_metadata.get('total_capacity', 0)
            data_embedded = embed_metadata.get('data_embedded', 0)
            capacity_used = (data_embedded / total_capacity * 100) if total_capacity > 0 else 0
            
            return {
                'success': True,
                'stego_image_base64': stego_base64,
                'capacity_used': round(capacity_used, 2),
                'embedding_info': {
                    'text_length': len(secret_text),
                    'data_embedded_bits': data_embedded,
                    'capacity_utilization': round(capacity_used, 2)
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Embedding failed: {str(e)}'
            }

    def extract_text_simple(self, stego_image: Image.Image) -> Dict[str, Any]:
        """
        Simple và nhanh method để extract key/text từ stego image.
        
        Args:
            stego_image: PIL Image object chứa hidden data
            
        Returns:
            Dictionary với extracted text và basic info
        """
        try:
            # Convert image to numpy array
            stego_array = np.array(stego_image)
            
            # Fast extraction using existing adaptive LSB method
            extracted_text, extract_metadata = self.adaptive_lsb_extract(stego_array)
            
            # Basic validation
            if not extracted_text:
                return {
                    'success': False,
                    'error': 'No hidden data found in image',
                    'extracted_text': ''
                }
            
            # Quick quality check
            is_valid_text = True
            if len(extracted_text) < 1:
                is_valid_text = False
            elif any(ord(c) < 32 and c not in '\t\n\r' for c in extracted_text[:100]):
                is_valid_text = False
            
            if not is_valid_text:
                return {
                    'success': False,
                    'error': 'Extracted data appears corrupted or invalid',
                    'extracted_text': extracted_text
                }
            
            return {
                'success': True,
                'extracted_text': extracted_text,
                'extraction_info': {
                    'bits_extracted': extract_metadata.get('bits_extracted', 0),
                    'text_length': len(extracted_text)
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Extraction failed: {str(e)}',
                'extracted_text': ''
            }


# Global service instance
steganography_service = SteganographyService()
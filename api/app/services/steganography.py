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
from skimage.metrics import peak_signal_noise_ratio, structural_similarity


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

    def adaptive_lsb_embed_enhanced(self, cover: np.ndarray, binary_data: str) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Enhanced adaptive LSB embedding với đầy đủ metadata và visualizations"""
        h, w, c = cover.shape
        stego = cover.copy()
        
        # Generate complexity map
        complexity_map = self.sobel_edge_detection(cover)
        
        # Calculate complexity threshold
        block_h, block_w = h // 2, w // 2
        block_complexity = np.zeros((block_h, block_w))
        embedding_mask = np.zeros((h, w), dtype=np.uint8)
        
        # Calculate block complexities
        for i in range(block_h):
            for j in range(block_w):
                block_region = complexity_map[i*2:(i+1)*2, j*2:(j+1)*2]
                block_complexity[i, j] = np.mean(block_region)
        
        complexity_threshold = np.mean(block_complexity)
        
        # Count blocks by complexity
        high_complexity_blocks = np.sum(block_complexity > complexity_threshold)
        low_complexity_blocks = np.sum(block_complexity <= complexity_threshold)
        total_blocks = block_h * block_w
        
        # Calculate percentages
        high_complexity_percentage = (high_complexity_blocks / total_blocks * 100) if total_blocks > 0 else 0
        low_complexity_percentage = (low_complexity_blocks / total_blocks * 100) if total_blocks > 0 else 0
        
        # Embed data và tạo embedding mask
        data_index = 0
        data_length = len(binary_data)
        total_capacity = 0
        utilization_1bit = 0
        utilization_2bit = 0
        
        for i in range(block_h):
            for j in range(block_w):
                if data_index >= data_length:
                    break
                
                # Determine bits per pixel
                bits_per_pixel = 2 if block_complexity[i, j] > complexity_threshold else 1
                
                # Update embedding mask cho visualization
                for bi in range(2):
                    for bj in range(2):
                        pixel_i = i * 2 + bi
                        pixel_j = j * 2 + bj
                        if pixel_i < h and pixel_j < w:
                            embedding_mask[pixel_i, pixel_j] = bits_per_pixel
                
                # Process block
                for bi in range(2):
                    for bj in range(2):
                        if data_index >= data_length:
                            break
                        
                        pixel_i = i * 2 + bi
                        pixel_j = j * 2 + bj
                        
                        if pixel_i < h and pixel_j < w:
                            total_capacity += bits_per_pixel
                            
                            # Embed in blue channel
                            blue_value = stego[pixel_i, pixel_j, 2]
                            
                            # Extract bits to embed
                            bits_to_embed = binary_data[data_index:data_index + bits_per_pixel]
                            
                            if len(bits_to_embed) == bits_per_pixel:
                                # Clear LSBs and set new bits
                                if bits_per_pixel == 1:
                                    blue_value = (blue_value & 0xFE) | int(bits_to_embed)
                                    utilization_1bit += 1
                                else:  # 2 bits
                                    blue_value = (blue_value & 0xFC) | int(bits_to_embed, 2)
                                    utilization_2bit += 1
                                
                                stego[pixel_i, pixel_j, 2] = blue_value
                                data_index += bits_per_pixel
        
        # Calculate average BPP
        total_pixels = h * w
        average_bpp = (utilization_1bit * 1 + utilization_2bit * 2) / total_pixels if total_pixels > 0 else 0
        
        # Comprehensive metadata
        metadata = {
            'complexity_map': complexity_map,
            'embedding_mask': embedding_mask,
            'complexity_threshold': float(complexity_threshold),
            'high_complexity_blocks': int(high_complexity_blocks),
            'low_complexity_blocks': int(low_complexity_blocks),
            'total_blocks': int(total_blocks),
            'high_complexity_percentage': float(high_complexity_percentage),
            'low_complexity_percentage': float(low_complexity_percentage),
            'total_capacity': int(total_capacity),
            'data_embedded': int(data_index),
            'average_bpp': float(average_bpp),
            'utilization_1bit': int(utilization_1bit),
            'utilization_2bit': int(utilization_2bit)
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

    def create_complexity_map_visualization(self, complexity_map: np.ndarray) -> str:
        """Create colored complexity map visualization"""
        # Normalize complexity map to 0-255
        if complexity_map.max() > 0:
            normalized = (complexity_map / complexity_map.max() * 255).astype(np.uint8)
        else:
            normalized = complexity_map.astype(np.uint8)
        
        # Create RGB visualization: red for high complexity, blue for low
        h, w = normalized.shape
        rgb_map = np.zeros((h, w, 3), dtype=np.uint8)
        
        # Red channel for high complexity
        rgb_map[:, :, 0] = normalized
        # Blue channel for low complexity (inverted)
        rgb_map[:, :, 2] = 255 - normalized
        
        return f"data:image/png;base64,{self.image_to_base64(rgb_map)}"

    def create_embedding_mask_visualization(self, embedding_mask: np.ndarray) -> str:
        """Create colored embedding mask visualization"""
        h, w = embedding_mask.shape
        rgb_mask = np.zeros((h, w, 3), dtype=np.uint8)
        
        # Green for 1-bit embedding, Yellow for 2-bit embedding, Black for no embedding
        rgb_mask[embedding_mask == 1] = [0, 255, 0]    # Green for 1-bit
        rgb_mask[embedding_mask == 2] = [255, 255, 0]  # Yellow for 2-bit
        rgb_mask[embedding_mask == 0] = [0, 0, 0]      # Black for no embedding
        
        return f"data:image/png;base64,{self.image_to_base64(rgb_mask)}"

    def calculate_psnr_ssim(self, original: np.ndarray, modified: np.ndarray) -> Tuple[float, float]:
        """Calculate PSNR and SSIM metrics"""
        try:
            # Convert to grayscale for metrics calculation
            if len(original.shape) == 3:
                orig_gray = np.mean(original, axis=2)
                mod_gray = np.mean(modified, axis=2)
            else:
                orig_gray = original
                mod_gray = modified
            
            # Calculate PSNR
            psnr = peak_signal_noise_ratio(orig_gray, mod_gray, data_range=255)
            
            # Calculate SSIM
            ssim = structural_similarity(orig_gray, mod_gray, data_range=255)
            
            return float(psnr), float(ssim)
        except Exception:
            return 0.0, 0.0

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

    def embed_text_enhanced(self, cover_image: Image.Image, secret_text: str) -> Dict[str, Any]:
        """
        Enhanced embedding method với đầy đủ visualizations và metrics.
        
        Args:
            cover_image: PIL Image object làm cover
            secret_text: Text cần embed
            
        Returns:
            Dictionary với full data cho frontend
        """
        try:
            cover_array = np.array(cover_image)
            binary_data = self.text_to_binary(secret_text)
            
            if not binary_data:
                return {
                    'success': False,
                    'error': 'Failed to convert text to binary'
                }
            
            # Enhanced embedding with full metadata
            stego_array, embed_metadata = self.adaptive_lsb_embed_enhanced(cover_array, binary_data)
            
            # Convert to base64
            stego_base64 = self.image_to_base64(stego_array)
            
            # Calculate PSNR and SSIM
            psnr, ssim = self.calculate_psnr_ssim(cover_array, stego_array)
            
            # Generate visualizations
            complexity_map_b64 = self.create_complexity_map_visualization(embed_metadata['complexity_map'])
            embedding_mask_b64 = self.create_embedding_mask_visualization(embed_metadata['embedding_mask'])
            
            # Calculate capacity metrics
            total_capacity = embed_metadata.get('total_capacity', 0)
            data_embedded = embed_metadata.get('data_embedded', 0)
            capacity_used = (data_embedded / total_capacity * 100) if total_capacity > 0 else 0
            
            return {
                'success': True,
                'stego_image_base64': stego_base64,
                'complexity_map_base64': complexity_map_b64,
                'embedding_mask_base64': embedding_mask_b64,
                'psnr': round(psnr, 4),
                'ssim': round(ssim, 6),
                'capacity_used': round(capacity_used, 2),
                'total_capacity': total_capacity,
                'data_embedded': data_embedded,
                'complexity_threshold': embed_metadata.get('complexity_threshold', 0),
                'high_complexity_blocks': embed_metadata.get('high_complexity_blocks', 0),
                'low_complexity_blocks': embed_metadata.get('low_complexity_blocks', 0),
                'total_blocks': embed_metadata.get('total_blocks', 0),
                'high_complexity_percentage': embed_metadata.get('high_complexity_percentage', 0),
                'low_complexity_percentage': embed_metadata.get('low_complexity_percentage', 0),
                'average_bpp': embed_metadata.get('average_bpp', 1.5),
                'utilization_1bit': embed_metadata.get('utilization_1bit', 0),
                'utilization_2bit': embed_metadata.get('utilization_2bit', 0)
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
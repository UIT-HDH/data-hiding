"""
Core steganography service implementation - Academic Version.

Đồ án môn học: Data Hiding với Adaptive LSB Steganography
Thuật toán: Sobel Edge Detection + Adaptive LSB (1-2 bit)

This module provides:
- Sobel edge detection for complexity analysis  
- Adaptive LSB embedding (1-bit for smooth, 2-bit for complex areas)
- Text-to-binary conversion with proper formatting
- Quality metrics (PSNR, SSIM)
"""

import io
import base64
import struct
import numpy as np
from typing import Dict, Any, Optional, Tuple
from PIL import Image


class SteganographyService:
    """
    Main steganography service class providing embedding and extraction operations.
    """
    
    def __init__(self):
        """Initialize the steganography service."""
        pass
    
    def sobel_edge_detection(self, image_array: np.ndarray) -> np.ndarray:
        """
        Phân tích độ phức tạp ảnh bằng Sobel Edge Detection
        
        Args:
            image_array: RGB image array (H, W, 3)
            
        Returns:
            complexity_map: Grayscale complexity map (H, W) - giá trị 0-255
        """
        # Chuyển RGB thành Grayscale
        if len(image_array.shape) == 3:
            gray = np.dot(image_array[...,:3], [0.299, 0.587, 0.114])
        else:
            gray = image_array.copy()
        
        # Sobel kernels (3x3)
        sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32)
        sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32)
        
        # Áp dụng convolution
        h, w = gray.shape
        grad_x = np.zeros_like(gray, dtype=np.float32)
        grad_y = np.zeros_like(gray, dtype=np.float32)
        
        # Manual convolution với padding
        padded = np.pad(gray, ((1, 1), (1, 1)), mode='edge')
        
        for i in range(h):
            for j in range(w):
                region = padded[i:i+3, j:j+3]
                grad_x[i, j] = np.sum(region * sobel_x)
                grad_y[i, j] = np.sum(region * sobel_y)
        
        # Tính gradient magnitude
        magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        # Normalize về 0-255
        if magnitude.max() > 0:
            magnitude = (magnitude / magnitude.max()) * 255
        
        return magnitude.astype(np.uint8)

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

    def adaptive_lsb_embed(self, cover_image: np.ndarray, binary_data: str) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Thực hiện Adaptive LSB embedding"""
        h, w, c = cover_image.shape
        
        # Tính complexity map
        complexity_map = self.sobel_edge_detection(cover_image)
        
        # Chia thành blocks 2x2
        block_h, block_w = h // 2, w // 2
        block_complexity = np.zeros((block_h, block_w))
        
        for i in range(block_h):
            for j in range(block_w):
                block_region = complexity_map[i*2:(i+1)*2, j*2:(j+1)*2]
                block_complexity[i, j] = np.mean(block_region)
        
        # Xác định threshold
        complexity_threshold = np.mean(block_complexity)
        
        # Tạo embedding mask
        embedding_mask = np.zeros((h, w), dtype=np.uint8)
        total_capacity = 0
        
        for i in range(block_h):
            for j in range(block_w):
                bits_per_pixel = 2 if block_complexity[i, j] > complexity_threshold else 1
                embedding_mask[i*2:(i+1)*2, j*2:(j+1)*2] = bits_per_pixel
                total_capacity += bits_per_pixel * 4
        
        # Kiểm tra capacity
        if len(binary_data) > total_capacity:
            raise ValueError(f"Payload too large: {len(binary_data)} > {total_capacity}")
        
        # Thực hiện embedding
        stego_image = cover_image.copy()
        data_index = 0
        
        for i in range(h):
            for j in range(w):
                if data_index >= len(binary_data):
                    break
                    
                bits_to_embed = embedding_mask[i, j]
                if bits_to_embed == 0:
                    continue
                
                # Lấy bits
                if data_index + bits_to_embed <= len(binary_data):
                    data_bits = binary_data[data_index:data_index + bits_to_embed]
                    data_index += bits_to_embed
                else:
                    remaining = len(binary_data) - data_index
                    data_bits = binary_data[data_index:] + '0' * (bits_to_embed - remaining)
                    data_index = len(binary_data)
                
                # Embed vào blue channel
                blue_value = stego_image[i, j, 2]
                
                if bits_to_embed == 1:
                    new_blue = (blue_value & 0xFE) | int(data_bits[0])
                else:
                    new_blue = (blue_value & 0xFC) | int(data_bits, 2)
                
                stego_image[i, j, 2] = new_blue
        
        metadata = {
            'total_capacity': total_capacity,
            'data_embedded': len(binary_data),
            'utilization': (len(binary_data) / total_capacity) * 100,
            'complexity_threshold': complexity_threshold,
            'algorithm': 'Adaptive LSB with Sobel Edge Detection'
        }
        
        return stego_image, metadata

    def adaptive_lsb_extract(self, stego_image: np.ndarray) -> Tuple[str, Dict[str, Any]]:
        """Trích xuất dữ liệu từ ảnh stego"""
        h, w, c = stego_image.shape
        
        # Tính lại complexity map
        complexity_map = self.sobel_edge_detection(stego_image)
        
        # Tính lại block complexity và embedding mask
        block_h, block_w = h // 2, w // 2
        block_complexity = np.zeros((block_h, block_w))
        
        for i in range(block_h):
            for j in range(block_w):
                block_region = complexity_map[i*2:(i+1)*2, j*2:(j+1)*2]
                block_complexity[i, j] = np.mean(block_region)
        
        complexity_threshold = np.mean(block_complexity)
        embedding_mask = np.zeros((h, w), dtype=np.uint8)
        
        for i in range(block_h):
            for j in range(block_w):
                bits_per_pixel = 2 if block_complexity[i, j] > complexity_threshold else 1
                embedding_mask[i*2:(i+1)*2, j*2:(j+1)*2] = bits_per_pixel
        
        # Trích xuất bits
        extracted_bits = []
        
        for i in range(h):
            for j in range(w):
                bits_to_extract = embedding_mask[i, j]
                if bits_to_extract == 0:
                    continue
                
                blue_value = stego_image[i, j, 2]
                
                if bits_to_extract == 1:
                    bit = blue_value & 1
                    extracted_bits.append(str(bit))
                else:
                    two_bits = blue_value & 3
                    extracted_bits.append(format(two_bits, '02b'))
        
        binary_string = ''.join(extracted_bits)
        extracted_text = self.binary_to_text(binary_string)
        
        metadata = {
            'bits_extracted': len(binary_string),
            'complexity_threshold': complexity_threshold,
            'text_length': len(extracted_text)
        }
        
        return extracted_text, metadata

    def calculate_psnr(self, original: np.ndarray, modified: np.ndarray) -> float:
        """Tính Peak Signal-to-Noise Ratio (PSNR)"""
        mse = np.mean((original.astype(float) - modified.astype(float)) ** 2)
        
        if mse == 0:
            return float('inf')
        
        max_pixel = 255.0
        psnr = 20 * np.log10(max_pixel / np.sqrt(mse))
        
        return round(psnr, 2)

    def calculate_ssim(self, original: np.ndarray, modified: np.ndarray) -> float:
        """Tính Structural Similarity Index (SSIM)"""
        # Chuyển thành grayscale
        if len(original.shape) == 3:
            orig_gray = np.dot(original[...,:3], [0.299, 0.587, 0.114])
            mod_gray = np.dot(modified[...,:3], [0.299, 0.587, 0.114])
        else:
            orig_gray = original
            mod_gray = modified
        
        # SSIM calculation
        c1 = (0.01 * 255) ** 2
        c2 = (0.03 * 255) ** 2
        
        mu1 = np.mean(orig_gray)
        mu2 = np.mean(mod_gray)
        var1 = np.var(orig_gray)
        var2 = np.var(mod_gray)
        cov12 = np.mean((orig_gray - mu1) * (mod_gray - mu2))
        
        numerator = (2 * mu1 * mu2 + c1) * (2 * cov12 + c2)
        denominator = (mu1**2 + mu2**2 + c1) * (var1 + var2 + c2)
        
        ssim = numerator / denominator
        return round(float(ssim), 4)

    def image_to_base64(self, image_array: np.ndarray) -> str:
        """Chuyển numpy array thành base64 string"""
        image = Image.fromarray(image_array.astype(np.uint8))
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        buffer.seek(0)
        base64_string = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return base64_string

    def generate_complexity_visualization(self, complexity_map: np.ndarray) -> str:
        """Tạo visualization cho complexity map"""
        # Normalize complexity map to 0-255 for visualization
        if complexity_map.max() > 0:
            normalized = (complexity_map / complexity_map.max() * 255).astype(np.uint8)
        else:
            normalized = complexity_map.astype(np.uint8)
        
        # Create RGB image from grayscale (heatmap effect)
        height, width = normalized.shape
        rgb_image = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Blue to red heatmap
        rgb_image[:, :, 0] = normalized  # Red channel
        rgb_image[:, :, 2] = 255 - normalized  # Blue channel (inverse)
        
        return self.image_to_base64(rgb_image)

    def generate_embedding_mask_visualization(self, embedding_mask: np.ndarray) -> str:
        """Tạo visualization cho embedding mask"""
        height, width = embedding_mask.shape
        rgb_image = np.zeros((height, width, 3), dtype=np.uint8)
        
        # 1-bit areas = green, 2-bit areas = yellow, no embedding = black
        mask_1bit = (embedding_mask == 1)
        mask_2bit = (embedding_mask == 2)
        
        rgb_image[mask_1bit] = [0, 255, 0]    # Green for 1-bit areas
        rgb_image[mask_2bit] = [255, 255, 0]  # Yellow for 2-bit areas
        
        return self.image_to_base64(rgb_image)

    def calculate_capacity_analysis(self, image_size: Tuple[int, int], complexity_map: np.ndarray) -> Dict[str, Any]:
        """Tính toán phân tích capacity chi tiết"""
        h, w = image_size[1], image_size[0]
        
        # Chia thành blocks và tính capacity
        block_h, block_w = h // 2, w // 2
        total_capacity_bits = 0
        total_capacity_bytes = 0
        high_complexity_blocks = 0
        low_complexity_blocks = 0
        
        # Tính threshold
        complexity_threshold = np.mean(complexity_map)
        
        for i in range(block_h):
            for j in range(block_w):
                block_region = complexity_map[i*2:(i+1)*2, j*2:(j+1)*2]
                block_complexity = np.mean(block_region)
                
                if block_complexity > complexity_threshold:
                    total_capacity_bits += 8  # 2 bits × 4 pixels
                    high_complexity_blocks += 1
                else:
                    total_capacity_bits += 4  # 1 bit × 4 pixels
                    low_complexity_blocks += 1
        
        total_capacity_bytes = total_capacity_bits // 8
        total_pixels = h * w
        average_bpp = total_capacity_bits / total_pixels
        
        return {
            'total_capacity_bits': total_capacity_bits,
            'total_capacity_bytes': total_capacity_bytes,
            'total_capacity_chars': total_capacity_bytes,  # Assuming 1 byte per char
            'average_bpp': round(average_bpp, 4),
            'high_complexity_blocks': high_complexity_blocks,
            'low_complexity_blocks': low_complexity_blocks,
            'total_blocks': high_complexity_blocks + low_complexity_blocks,
            'complexity_threshold': round(complexity_threshold, 2),
            'high_complexity_percentage': round((high_complexity_blocks / (high_complexity_blocks + low_complexity_blocks)) * 100, 2),
            'low_complexity_percentage': round((low_complexity_blocks / (high_complexity_blocks + low_complexity_blocks)) * 100, 2),
            'utilization_1bit': round((low_complexity_blocks * 4 / total_capacity_bits) * 100, 2),
            'utilization_2bit': round((high_complexity_blocks * 8 / total_capacity_bits) * 100, 2)
        }

    def embed_text_in_image(self, cover_image: Image.Image, secret_text: str) -> Dict[str, Any]:
        """Main function để embed text vào image"""
        try:
            cover_array = np.array(cover_image)
            binary_data = self.text_to_binary(secret_text)
            
            if not binary_data:
                raise ValueError("Failed to convert text to binary")
            
            # Generate complexity map for visualizations
            complexity_map = self.sobel_edge_detection(cover_array)
            
            stego_array, embed_metadata = self.adaptive_lsb_embed(cover_array, binary_data)
            
            # Calculate metrics
            psnr = self.calculate_psnr(cover_array, stego_array)
            ssim = self.calculate_ssim(cover_array, stego_array)
            stego_base64 = self.image_to_base64(stego_array)
            
            # Generate visualizations
            complexity_visualization = self.generate_complexity_visualization(complexity_map)
            
            # Create embedding mask for visualization
            h, w = complexity_map.shape
            block_h, block_w = h // 2, w // 2
            embedding_mask = np.zeros((h, w), dtype=np.uint8)
            complexity_threshold = np.mean(complexity_map)
            
            for i in range(block_h):
                for j in range(block_w):
                    block_region = complexity_map[i*2:(i+1)*2, j*2:(j+1)*2]
                    block_complexity = np.mean(block_region)
                    bits_per_pixel = 2 if block_complexity > complexity_threshold else 1
                    embedding_mask[i*2:(i+1)*2, j*2:(j+1)*2] = bits_per_pixel
            
            embedding_mask_visualization = self.generate_embedding_mask_visualization(embedding_mask)
            
            # Calculate capacity analysis
            capacity_analysis = self.calculate_capacity_analysis(cover_image.size, complexity_map)
            
            return {
                'success': True,
                'stego_image_base64': stego_base64,
                'complexity_map_base64': complexity_visualization,
                'embedding_mask_base64': embedding_mask_visualization,
                'metrics': {
                    'psnr': psnr,
                    'ssim': ssim,
                    'text_length_chars': len(secret_text),
                    'text_length_bytes': len(secret_text.encode('utf-8')),
                    'binary_length_bits': len(binary_data),
                    'image_size': f"{cover_image.size[0]}x{cover_image.size[1]}"
                },
                'embedding_info': embed_metadata,
                'capacity_analysis': capacity_analysis,
                'algorithm_info': {
                    'method': 'Adaptive LSB with Sobel Edge Detection',
                    'complexity_analysis': 'Sobel Gradient Magnitude',
                    'adaptive_strategy': '1-bit LSB for smooth areas, 2-bit LSB for complex areas',
                    'embedding_domain': 'Spatial Domain (Blue Channel)',
                    'data_processing': f"UTF-8 → Binary → LSB Embedding"
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'error_type': type(e).__name__
            }

    def extract_text_from_image(self, stego_image: Image.Image) -> Dict[str, Any]:
        """Main function để extract text từ stego image"""
        try:
            stego_array = np.array(stego_image)
            extracted_text, extract_metadata = self.adaptive_lsb_extract(stego_array)
            
            return {
                'success': True,
                'extracted_text': extracted_text,
                'extraction_info': extract_metadata,
                'image_info': {
                    'size': f"{stego_image.size[0]}x{stego_image.size[1]}",
                    'mode': stego_image.mode,
                    'format': stego_image.format or 'Unknown'
                },
                'algorithm_info': {
                    'method': 'Adaptive LSB with Sobel Edge Detection',
                    'extraction_domain': 'Spatial Domain (Blue Channel)'
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'error_type': type(e).__name__
            }


# Global service instance
steganography_service = SteganographyService()

/**
 * 🌟 Frontend Axios Example với CORS đã sửa
 * 
 * Copy code này vào EmbedPage.tsx của bạn
 */

import axios from 'axios';

// ✅ HTTP client đã được cấu hình CORS
const http = axios.create({
  baseURL: 'http://localhost:8000',  // Backend CORS server
  timeout: 60_000,
  headers: {
    'Accept': 'application/json',
  }
});

// 🔧 Ví dụ load options cho Select components
const loadOptions = async () => {
  try {
    const [methodsRes, domainsRes] = await Promise.all([
      http.get('/embed/methods'),
      http.get('/embed/domains')
    ]);
    
    console.log('✅ Methods loaded:', methodsRes.data.data);
    console.log('✅ Domains loaded:', domainsRes.data.data);
    
    // Set vào state components
    // setComplexityMethods(methodsRes.data.data);
    // setEmbeddingDomains(domainsRes.data.data);
    
  } catch (error) {
    console.error('❌ Load options failed:', error);
    // message.error('Failed to load options: ' + error.message);
  }
};

// 🚀 Ví dụ embed function hoàn chỉnh
const handleEmbed = async (formInputs) => {
  try {
    console.log('🔄 Starting embed process...');
    
    // Tạo FormData cho multipart/form-data
    const formData = new FormData();
    
    // Required fields
    formData.append('coverImage', formInputs.coverFile);
    formData.append('secretType', formInputs.secretType);
    formData.append('complexityMethod', formInputs.method);
    formData.append('payloadCap', formInputs.payloadCap.toString());
    formData.append('domain', formInputs.domain);
    
    // Optional fields
    if (formInputs.secretType === 'text' && formInputs.secretText) {
      formData.append('secretText', formInputs.secretText);
    }
    
    if (formInputs.secretType === 'file' && formInputs.secretFile) {
      formData.append('secretFile', formInputs.secretFile);
    }
    
    if (formInputs.seed) {
      formData.append('seed', formInputs.seed);
    }
    
    if (formInputs.password) {
      formData.append('password', formInputs.password);
    }
    
    formData.append('encrypt', formInputs.encrypt.toString());
    formData.append('compress', formInputs.compress.toString());
    formData.append('minBpp', formInputs.minBpp.toString());
    formData.append('maxBpp', formInputs.maxBpp.toString());
    formData.append('threshold', formInputs.threshold.toString());
    
    // ✅ POST request với CORS support
    const response = await http.post('/embed', formData, {
      headers: {
        // Đừng set Content-Type manually cho FormData
        // Axios sẽ tự động set với boundary
      },
      // onUploadProgress để show progress
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`📤 Upload progress: ${progress}%`);
      }
    });
    
    console.log('✅ Embed successful:', response.data);
    
    // Xử lý kết quả
    const result = response.data.data;
    
    // Display images từ base64
    console.log('🖼️ Original Image:', `data:image/png;base64,${result.originalImage}`);
    console.log('🖼️ Stego Image:', `data:image/png;base64,${result.stegoImage}`);
    console.log('🗺️ Complexity Map:', `data:image/png;base64,${result.complexityMap}`);
    console.log('🎭 Embedding Mask:', `data:image/png;base64,${result.embeddingMask}`);
    
    // Display metrics
    console.log('📊 Metrics:', result.metrics);
    console.log('⚙️ Configuration:', result.configuration);
    console.log('📝 Logs:', result.logs);
    
    return result;
    
  } catch (error) {
    console.error('❌ Embed failed:', error);
    
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Lỗi kết nối mạng. Kiểm tra backend có chạy không?');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout! Server phản hồi quá chậm.');
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định');
  }
};

// 🧪 Test function - chạy trong console để test
const testCORS = async () => {
  try {
    console.log('🧪 Testing CORS...');
    
    // Test health
    const health = await http.get('/health');
    console.log('✅ Health:', health.data);
    
    // Test methods
    const methods = await http.get('/embed/methods');
    console.log('✅ Methods:', methods.data.data);
    
    // Test domains
    const domains = await http.get('/embed/domains');
    console.log('✅ Domains:', domains.data.data);
    
    console.log('🎉 CORS test passed!');
    
  } catch (error) {
    console.error('❌ CORS test failed:', error);
  }
};

// Export functions để sử dụng
export { http, loadOptions, handleEmbed, testCORS };

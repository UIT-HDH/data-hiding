/**
 * 🧪 Test script để verify frontend có thể connect backend
 */

const testAPI = async () => {
  const baseURL = 'http://localhost:8000';
  
  try {
    console.log('🔍 Testing backend connection...');
    
    // Test 1: Health check
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);
    
    // Test 2: Methods
    console.log('\n2️⃣ Testing methods endpoint...');
    const methodsResponse = await fetch(`${baseURL}/embed/methods`);
    const methodsData = await methodsResponse.json();
    console.log('✅ Methods:', methodsData.data);
    
    // Test 3: Domains
    console.log('\n3️⃣ Testing domains endpoint...');
    const domainsResponse = await fetch(`${baseURL}/embed/domains`);
    const domainsData = await domainsResponse.json();
    console.log('✅ Domains:', domainsData.data);
    
    console.log('\n🎉 All endpoints working! Frontend should be able to connect.');
    
    return {
      health: healthData,
      methods: methodsData.data,
      domains: domainsData.data
    };
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.log('\n🔧 Make sure backend is running:');
    console.log('   cd api/');
    console.log('   python3 cors_server.py &');
  }
};

// Run test if in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testAPI();
} else {
  // Browser environment - expose function globally
  window.testAPI = testAPI;
  console.log('💡 Run testAPI() in browser console to test connection');
}

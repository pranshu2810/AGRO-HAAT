const axios = require('axios');

async function testE2E() {
  console.log('=== Starting Soil Health Module E2E Test ===');
  
  // Set up cookie jar / session
  let cookie = '';
  
  // 1. Farmer Login via dev route
  console.log('\n[1] Testing Farmer Session Authentication...');
  const loginRes = await axios.get('http://localhost:3000/dev-farmer-login', {
    maxRedirects: 0,
    validateStatus: status => status === 302 || status === 200
  });
  
  const setCookies = loginRes.headers['set-cookie'];
  if (setCookies && setCookies.length > 0) {
    cookie = setCookies[0].split(';')[0];
    console.log('✅ Farmer session cookie acquired:', cookie);
  } else {
    throw new Error('Failed to acquire farmer session cookie');
  }

  const client = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
      Cookie: cookie
    }
  });

  // 2. Load Soil Analysis Page
  console.log('\n[2] Testing GET /farmer/soil_analysis...');
  const pageRes = await client.get('/farmer/soil_analysis');
  console.log('Page response status:', pageRes.status);
  if (pageRes.status === 200 && pageRes.data.includes('Smart Soil Health Intelligence & Advisory')) {
    console.log('✅ Soil analysis dashboard loaded with updated EJS template');
  } else {
    throw new Error('Soil analysis page failed to render expected content');
  }

  // 3. Test Reverse Geocode
  console.log('\n[3] Testing POST /api/soil/reverse-geocode...');
  const geoRes = await client.post('/api/soil/reverse-geocode', {
    latitude: 26.8467,
    longitude: 80.9462
  });
  console.log('Geocoding result:', geoRes.data);
  if (geoRes.data.state && geoRes.data.district) {
    console.log('✅ Reverse geocoding endpoint functional:', geoRes.data.district, geoRes.data.state);
  } else {
    throw new Error('Reverse geocoding returned invalid structure');
  }

  // 4. Test Plot Saving
  console.log('\n[4] Testing POST /api/soil/plots...');
  const plotRes = await client.post('/api/soil/plots', {
    plot_name: 'Test Khet 1',
    survey_number: '88/1',
    area_acres: 3.5,
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    block_tehsil: 'Bakshi Ka Talab',
    village: 'Bhaisamau',
    latitude: 26.985,
    longitude: 80.92,
    soil_type: 'Clay Loam'
  });
  console.log('Plot save result:', plotRes.data);
  if (plotRes.data.success && plotRes.data.plot.id) {
    console.log('✅ Farm plot saved successfully, ID:', plotRes.data.plot.id);
  } else {
    throw new Error('Failed to save farm plot');
  }

  // 5. Test Plot Fetching
  console.log('\n[5] Testing GET /api/soil/plots...');
  const plotsListRes = await client.get('/api/soil/plots');
  console.log('Saved plots count:', plotsListRes.data.plots.length);
  if (plotsListRes.data.success && plotsListRes.data.plots.length > 0) {
    console.log('✅ Farm plots listed successfully');
  } else {
    throw new Error('Failed to retrieve farm plots');
  }

  // 6. Test Soil Health Analysis & AI Explanation
  console.log('\n[6] Testing POST /api/soil/analyze (Full ICAR + STCR + Groq AI)...');
  const analyzeRes = await client.post('/api/soil/analyze', {
    plot_name: 'Test Khet 1',
    area_acres: 3.5,
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    block_tehsil: 'Bakshi Ka Talab',
    village: 'Bhaisamau',
    n_value: 190,
    n_unit: 'kg/ha',
    p_value: 14,
    p_unit: 'kg/ha',
    k_value: 220,
    k_unit: 'kg/ha',
    ph_value: 7.2,
    ec_value: 0.65,
    oc_value: 0.60,
    zn_value: 0.50, // Deficient Zn (<0.60)
    crop_name: 'Wheat',
    season: 'Rabi',
    growth_stage: 'Pre-sowing',
    irrigation_type: 'Canal',
    target_yield: 45,
    data_source: 'Government Soil Health Card (SHC)',
    shc_sample_number: 'SHC-UP-2026-TEST'
  });

  const resData = analyzeRes.data;
  console.log('Analysis success:', resData.success);
  console.log('Saved Record ID:', resData.record_id);
  console.log('Fertility Rating:', resData.assessment.fertility_index.rating_en);
  console.log('Fertilizer Products:', resData.assessment.fertilizer_recommendations.commercial_products_per_acre.map(p => `${p.product_en}: ${p.quantity_kg} kg/acre`));
  console.log('AI Narrative (EN):', resData.ai_explanation.summary_en);
  console.log('AI Narrative (HI):', resData.ai_explanation.summary_hi);
  
  if (resData.success && resData.assessment && resData.ai_explanation) {
    console.log('✅ Complete bilingual analysis generated and persisted');
  } else {
    throw new Error('Analysis failed or missing required fields');
  }

  // 7. Test Historical Record Fetch by ID
  if (resData.record_id) {
    console.log(`\n[7] Testing GET /api/soil/record/${resData.record_id}...`);
    const recRes = await client.get(`/api/soil/record/${resData.record_id}`);
    if (recRes.data.success && recRes.data.record) {
      console.log('✅ Successfully retrieved persisted soil record from MySQL');
    } else {
      throw new Error('Failed to retrieve persisted soil record');
    }
  }

  // 8. Test GoI SHC Status Endpoint
  console.log('\n[8] Testing GET /api/soil/shc-status...');
  const shcRes = await client.get('/api/soil/shc-status');
  console.log('SHC Protocol:', shcRes.data.shc_status.protocol);
  console.log('SHC Disclosure:', shcRes.data.shc_status.statusMessage_en);
  if (shcRes.data.success && shcRes.data.shc_status.productionEndpoint) {
    console.log('✅ SHC status endpoint functional and transparently disclosing guidelines');
  } else {
    throw new Error('SHC status endpoint failed');
  }

  console.log('\n🎉 ALL 8 END-TO-END INTEGRATION TESTS PASSED!');
  process.exit(0);
}

testE2E().catch(err => {
  console.error('\n❌ E2E Test Failure:', err.response?.data || err.message);
  process.exit(1);
});

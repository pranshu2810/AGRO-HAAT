const http = require('http');

function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });
        req.on('error', reject);
        if (data) {
            req.write(typeof data === 'string' ? data : JSON.stringify(data));
        }
        req.end();
    });
}

async function runE2ETests() {
    console.log('--- STARTING E2E CROP RECOMMENDATION HTTP TESTS ---');

    // 1. Login as dev-farmer to get session cookie
    console.log('\n[TEST 1] Dev Farmer Login & Session Creation');
    const loginRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/dev-farmer-login',
        method: 'GET'
    });
    console.log('Login status:', loginRes.statusCode);
    const setCookie = loginRes.headers['set-cookie'];
    if (!setCookie) {
        throw new Error('Failed to obtain session cookie from /dev-farmer-login');
    }
    const sessionCookie = setCookie.map(c => c.split(';')[0]).join('; ');
    console.log('Obtained session cookie:', sessionCookie);

    // 2. Fetch GET /farmer/crop_recommendation page
    console.log('\n[TEST 2] GET /farmer/crop_recommendation UI Dashboard');
    const pageRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/farmer/crop_recommendation',
        method: 'GET',
        headers: {
            'Cookie': sessionCookie
        }
    });
    console.log('Dashboard status:', pageRes.statusCode);
    if (pageRes.statusCode !== 200) {
        throw new Error(`Expected 200 from /farmer/crop_recommendation, got ${pageRes.statusCode}`);
    }
    const hasHeader = pageRes.body.includes('Hybrid AI-Driven Crop Recommendation') || pageRes.body.includes('हाइब्रिड AI फसल संस्तुति');
    const hasLayers = pageRes.body.includes('Layer 1') || pageRes.body.includes('मृदा पोषक तत्व');
    const hasBilingual = pageRes.body.includes('langTabs') || pageRes.body.includes('English &amp; हिंदी') || pageRes.body.includes('English & हिंदी');
    console.log('Page checks:', { hasHeader, hasLayers, hasBilingual });
    if (!hasHeader || !hasLayers) {
        throw new Error('Dashboard page is missing expected Hybrid Crop UI elements');
    }

    // 3. POST /api/crop/recommend with complete valid payload
    console.log('\n[TEST 3] POST /api/crop/recommend - Complete 5-Layer Hybrid Recommendation');
    const validPayload = {
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        lat: 25.3176,
        lon: 82.9739,
        season: 'Rabi',
        soil_type: 'Alluvial',
        irrigation_type: 'Tube Well',
        nitrogen: 120,
        phosphorus: 50,
        potassium: 45,
        ph: 6.8
    };

    const recommendRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/crop/recommend',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
        }
    }, validPayload);

    console.log('Recommendation API Status:', recommendRes.statusCode);
    if (recommendRes.statusCode !== 200) {
        throw new Error(`Expected 200 from /api/crop/recommend, got ${recommendRes.statusCode}: ${recommendRes.body}`);
    }

    const recData = JSON.parse(recommendRes.body);
    const primary = recData.primary_recommendation;
    const weather = recData.weather_context;
    const market = recData.market_context;

    console.log('Success Flag:', recData.success);
    console.log('Record ID inserted:', recData.record_id);
    console.log('Total Ranked Crops:', recData.ranked_crops.length);
    console.log('Primary Crop (EN):', primary ? primary.name_en : 'None');
    console.log('Primary Crop (HI):', primary ? primary.name_hi : 'None');
    console.log('Confidence Score:', primary ? primary.composite_score : 'N/A');
    console.log('Weather Layer Present:', !!weather.data_source);
    console.log('Weather Observed Temp:', weather.temperature);
    console.log('Weather Timestamp:', weather.timestamp);
    console.log('Market Layer Available:', market.is_available);
    console.log('Market Disclosure (EN):', market.disclosure_en);
    console.log('Market Disclosure (HI):', market.disclosure_hi);
    console.log('Primary Reasons (EN count):', primary.reasons_en.length);
    console.log('Primary Reasons (HI count):', primary.reasons_hi.length);
    console.log('Agronomic Advice (EN):', primary.agronomic_advice.en);
    console.log('Agronomic Advice (HI):', primary.agronomic_advice.hi);

    if (!recData.success || !recData.ranked_crops || recData.ranked_crops.length === 0) {
        throw new Error('Recommendation returned empty or unsuccessful response');
    }
    if (!primary || !primary.reasons_hi || primary.reasons_hi.length === 0) {
        throw new Error('Missing Hindi reasons in response');
    }

    // 4. POST /api/crop/recommend with invalid soil pH (< 0 or > 14)
    console.log('\n[TEST 4] POST /api/crop/recommend - Validation Error (Invalid pH)');
    const invalidPayload = {
        state: 'Punjab',
        district: 'Ludhiana',
        season: 'Rabi',
        soil_type: 'Loamy',
        nitrogen: 100,
        phosphorus: 50,
        potassium: 50,
        ph: 16.5 // Invalid
    };
    const invalidRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/crop/recommend',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
        }
    }, invalidPayload);
    console.log('Invalid pH status code:', invalidRes.statusCode);
    if (invalidRes.statusCode !== 400) {
        throw new Error(`Expected 400 for invalid pH, got ${invalidRes.statusCode}`);
    }

    // 5. POST /actions/log_ai_action.php backward compatibility
    console.log('\n[TEST 5] POST /actions/log_ai_action.php Backward Compatibility');
    const legacyRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/actions/log_ai_action.php',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
        }
    }, { action: 'crop_recommendation_view', details: { test: true } });
    console.log('Legacy log status:', legacyRes.statusCode);
    if (legacyRes.statusCode !== 200) {
        throw new Error(`Expected 200 for legacy log action, got ${legacyRes.statusCode}`);
    }

    console.log('\n=== ALL E2E HTTP INTEGRATION TESTS PASSED SUCCESSFULLY! ===\n');
}

runE2ETests().catch(err => {
    console.error('E2E TEST FAILURE:', err);
    process.exit(1);
});

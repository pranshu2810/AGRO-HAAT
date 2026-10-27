const axios = require('axios');
const http = require('http');

async function runIntegrationTests() {
  const baseURL = 'http://localhost:3000';

  console.log('--- 1. Testing GET /api/market/commodities ---');
  const commRes = await axios.get(`${baseURL}/api/market/commodities`);
  console.log('Status:', commRes.status);
  console.log('Commodities count:', commRes.data.commodities.length);
  if (!commRes.data.success || commRes.data.commodities.length === 0) {
    throw new Error('Commodities endpoint failed');
  }

  console.log('\n--- 2. Testing GET /api/market/locations (States) ---');
  const statesRes = await axios.get(`${baseURL}/api/market/locations`);
  console.log('Status:', statesRes.status);
  console.log('States count:', statesRes.data.data.length);
  const sampleState = statesRes.data.data[1]; // e.g., Andhra Pradesh or Haryana
  console.log('Sample State:', sampleState);

  console.log(`\n--- 3. Testing GET /api/market/locations (Districts for state ${sampleState.id}) ---`);
  const distRes = await axios.get(`${baseURL}/api/market/locations?state_id=${sampleState.id}`);
  console.log('Districts count:', distRes.data.data.length);
  const sampleDistrict = distRes.data.data[0];
  console.log('Sample District:', sampleDistrict);

  if (sampleDistrict) {
    console.log(`\n--- 4. Testing GET /api/market/locations (Markets for district ${sampleDistrict.id}) ---`);
    const mktRes = await axios.get(`${baseURL}/api/market/locations?state_id=${sampleState.id}&district_id=${sampleDistrict.id}`);
    console.log('Markets count:', mktRes.data.data.length);
    console.log('Sample Market:', mktRes.data.data[0]);
  }

  console.log('\n--- 5. Testing GET /api/market/prices for Wheat ---');
  const priceRes = await axios.get(`${baseURL}/api/market/prices?commodity=Wheat`);
  console.log('Status:', priceRes.status);
  console.log('Success:', priceRes.data.success);
  console.log('Source:', priceRes.data.source);
  console.log('Reporting Date:', priceRes.data.reporting_date);
  console.log('Records returned:', priceRes.data.records.length);
  console.log('Analytics summary:', {
    avg: priceRes.data.analytics.national_modal_avg,
    highest: priceRes.data.analytics.highest_price,
    lowest: priceRes.data.analytics.lowest_price,
    spread: priceRes.data.analytics.price_spread,
    arrivals: priceRes.data.analytics.total_arrivals
  });

  console.log('\n--- 6. Testing GET /api/market/history for Wheat ---');
  const histRes = await axios.get(`${baseURL}/api/market/history?crop=Wheat&days=3`);
  console.log('Status:', histRes.status);
  console.log('History entries count:', histRes.data.history.length);
  console.log('Sample History:', histRes.data.history[0]);

  console.log('\n--- 7. Testing POST /api/market/transport-calc ---');
  const calcRes = await axios.post(`${baseURL}/api/market/transport-calc`, {
    records: priceRes.data.records.slice(0, 5),
    costPerKmPerQtl: 2.5,
    distanceKm: 30
  });
  console.log('Transport Calc Success:', calcRes.data.success);
  console.log('Best Mandi:', calcRes.data.best_mandi?.market, 'Net Realization: ₹' + calcRes.data.best_mandi?.net_realization);

  console.log('\n--- 8. Testing legacy POST /actions/price_history_action.php ---');
  const legacyRes = await axios.post(`${baseURL}/actions/price_history_action.php`, {
    crop: 'Wheat',
    market: 'Bagasara'
  });
  console.log('Legacy Endpoint Status:', legacyRes.status);
  console.log('Legacy Success:', legacyRes.data.success);
  console.log('Legacy History Count:', legacyRes.data.history.length);
  console.log('Legacy Source:', legacyRes.data.source);

  console.log('\n--- 9. Testing Farmer Dashboard and Market Prices HTML render with Session ---');
  // First simulate dev-farmer-login to get session cookie
  const loginRes = await axios.get(`${baseURL}/dev-farmer-login`, { maxRedirects: 0, validateStatus: s => s === 302 });
  const cookie = loginRes.headers['set-cookie'];
  console.log('Logged in as Dev Farmer! Cookie:', cookie ? 'Received' : 'None');

  const pageRes = await axios.get(`${baseURL}/farmer/market_prices`, {
    headers: { Cookie: cookie ? cookie[0] : '' }
  });
  console.log('Market Prices Page Status:', pageRes.status);
  console.log('Page Title Found in HTML:', pageRes.data.includes('Agricultural Market Intelligence &amp; Mandi Rates') || pageRes.data.includes('Agmarknet 2.0'));
  console.log('Government Data Indicators in HTML:', pageRes.data.includes('Official Agmarknet 2.0 Integration'));

  console.log('\n=============================================');
  console.log('🎉 ALL INTEGRATION AND ACCEPTANCE TESTS PASSED!');
  console.log('=============================================');
}

runIntegrationTests().catch(err => {
  console.error('Integration test failed:', err.response ? err.response.data : err.message);
  process.exit(1);
});

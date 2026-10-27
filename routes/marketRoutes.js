const express = require('express');
const router = express.Router();
const marketService = require('../services/marketIntelligenceService');

// Middleware to ensure user is logged in as a Farmer
function requireFarmer(req, res, next) {
  if (!req.session || !req.session.user_id || req.session.role !== 'Farmer') {
    return res.redirect('/login');
  }
  next();
}

/**
 * GET /farmer/market_prices
 * Server-rendered main Market Intelligence page
 */
router.get(['/farmer/market_prices', '/farmer/market_prices.php'], requireFarmer, async (req, res) => {
  try {
    const commodityParam = req.query.commodity || req.query.search || 'Wheat';
    const stateParam = req.query.state || '';
    const districtParam = req.query.district || '';
    const marketParam = req.query.market || '';
    const dateParam = req.query.date || '';
    const minPriceParam = req.query.min_price || '';
    const maxPriceParam = req.query.max_price || '';
    const sortByParam = req.query.sort_by || 'price_desc';
    const searchParam = req.query.search || '';

    // Fetch initial list of commodities and states for filters
    const [commodities, states] = await Promise.all([
      marketService.getCommodities(),
      marketService.getStates()
    ]);

    // Fetch live daily market prices
    let marketData = null;
    let errorMessage = null;

    try {
      marketData = await marketService.getDailyMarketPrices({
        commodity: commodityParam,
        state: stateParam,
        district: districtParam,
        market: marketParam,
        date: dateParam
      });

      if (marketData && marketData.records) {
        let records = marketData.records;

        // Apply min/max price filter if specified
        if (minPriceParam && !isNaN(minPriceParam)) {
          records = records.filter(r => r.modal_price >= Number(minPriceParam));
        }
        if (maxPriceParam && !isNaN(maxPriceParam)) {
          records = records.filter(r => r.modal_price <= Number(maxPriceParam));
        }

        // Apply search query if specified and not just the commodity name
        if (searchParam && searchParam.trim() && searchParam.toLowerCase() !== commodityParam.toLowerCase()) {
          const q = searchParam.trim().toLowerCase();
          records = filterRecordsBySearchQuery(records, q);
        }

        // Apply sorting
        records = sortMarketRecords(records, sortByParam);

        marketData.records = records;
        marketData.analytics = marketService.calculateAnalytics(records, marketData.analytics?.commodity || commodityParam);
      }
    } catch (fetchErr) {
      errorMessage = fetchErr.message;
    }

    res.render('farmer/market_prices', {
      user: req.session,
      page_title: 'Market Intelligence & Mandi Rates',
      commodities,
      states,
      selectedCommodity: commodityParam,
      selectedState: stateParam,
      selectedDistrict: districtParam,
      selectedMarket: marketParam,
      selectedDate: dateParam || (marketData ? marketData.reporting_date : ''),
      selectedMinPrice: minPriceParam,
      selectedMaxPrice: maxPriceParam,
      selectedSortBy: sortByParam,
      searchQuery: searchParam,
      marketData: marketData || { records: [], analytics: {} },
      errorMessage
    });
  } catch (err) {
    console.error('Market prices page render error:', err);
    res.status(500).render('farmer/market_prices', {
      user: req.session,
      page_title: 'Market Intelligence & Mandi Rates',
      commodities: marketService.popularCommodities,
      states: [],
      selectedCommodity: 'Wheat',
      selectedState: '',
      selectedDistrict: '',
      selectedMarket: '',
      selectedDate: '',
      selectedMinPrice: '',
      selectedMaxPrice: '',
      selectedSortBy: 'price_desc',
      searchQuery: '',
      marketData: { records: [], analytics: {} },
      errorMessage: 'Failed to load market intelligence data. Please try again.'
    });
  }
});

/**
 * Helper to filter records by search query, supporting text, exact numbers, and price operators (>2500, <3000, 2000-3000)
 */
function filterRecordsBySearchQuery(records, query) {
  if (!query) return records;
  const q = query.trim().toLowerCase();

  // Range expression: e.g. "2500-3000" or "2500 to 3000" or "2500..3000"
  const rangeMatch = q.match(/^(\d+)\s*(?:-|to|\.\.)\s*(\d+)$/);
  if (rangeMatch) {
    const minVal = Number(rangeMatch[1]);
    const maxVal = Number(rangeMatch[2]);
    return records.filter(r => r.modal_price >= minVal && r.modal_price <= maxVal);
  }

  // Greater than expression: e.g. "> 2500" or ">= 2500" or "above 2500"
  const gtMatch = q.match(/^(?:>=?|>|above|over)\s*(\d+)$/);
  if (gtMatch) {
    const val = Number(gtMatch[1]);
    return records.filter(r => r.modal_price >= val);
  }

  // Less than expression: e.g. "< 3000" or "<= 3000" or "below 3000"
  const ltMatch = q.match(/^(?:<=?|<|below|under)\s*(\d+)$/);
  if (ltMatch) {
    const val = Number(ltMatch[1]);
    return records.filter(r => r.modal_price <= val);
  }

  // If query is a pure number: e.g. "2745" or "2700"
  if (!isNaN(q)) {
    const num = Number(q);
    return records.filter(r => 
      r.modal_price === num ||
      r.min_price === num ||
      r.max_price === num ||
      r.modal_price.toString().includes(q) ||
      r.min_price.toString().includes(q) ||
      r.max_price.toString().includes(q)
    );
  }

  // Free text search across all attributes (market, state, district, variety, and prices)
  return records.filter(r =>
    (r.market && r.market.toLowerCase().includes(q)) ||
    (r.state && r.state.toLowerCase().includes(q)) ||
    (r.district && r.district.toLowerCase().includes(q)) ||
    (r.variety && r.variety.toLowerCase().includes(q)) ||
    (r.grade && r.grade.toLowerCase().includes(q)) ||
    (r.modal_price && r.modal_price.toString().includes(q))
  );
}

/**
 * Helper to sort market records
 */
function sortMarketRecords(records, sortBy = 'price_desc') {
  const sorted = [...records];
  switch (sortBy) {
    case 'price_desc':
      return sorted.sort((a, b) => b.modal_price - a.modal_price);
    case 'price_asc':
      return sorted.sort((a, b) => a.modal_price - b.modal_price);
    case 'arrivals_desc':
      return sorted.sort((a, b) => b.arrivals - a.arrivals);
    case 'arrivals_asc':
      return sorted.sort((a, b) => a.arrivals - b.arrivals);
    case 'market_asc':
      return sorted.sort((a, b) => a.market.localeCompare(b.market));
    case 'spread_desc':
      return sorted.sort((a, b) => (b.max_price - b.min_price) - (a.max_price - a.min_price));
    default:
      return sorted.sort((a, b) => b.modal_price - a.modal_price);
  }
}

/**
 * GET /api/market/prices
 * Real-time JSON API with filters including price range, price search, and sorting
 */
router.get('/api/market/prices', async (req, res) => {
  try {
    const { 
      commodity, 
      state, 
      district, 
      market, 
      date, 
      variety, 
      search, 
      min_price, 
      max_price, 
      sort_by 
    } = req.query;

    const result = await marketService.getDailyMarketPrices({
      commodity: commodity || search || 'Wheat',
      state,
      district,
      market,
      date
    });

    let filteredRecords = result.records;

    // Optional variety filter
    if (variety && variety !== 'all') {
      filteredRecords = filteredRecords.filter(r => 
        r.variety.toLowerCase().includes(variety.toLowerCase())
      );
    }

    // Explicit Min Price filter
    if (min_price && !isNaN(min_price)) {
      const minVal = Number(min_price);
      filteredRecords = filteredRecords.filter(r => r.modal_price >= minVal);
    }

    // Explicit Max Price filter
    if (max_price && !isNaN(max_price)) {
      const maxVal = Number(max_price);
      filteredRecords = filteredRecords.filter(r => r.modal_price <= maxVal);
    }

    // Search query: supports price numbers, expressions (>2500, <3000, 2000-3000), mandi name, state, variety
    if (search && search.trim() && search.toLowerCase() !== (commodity || '').toLowerCase()) {
      filteredRecords = filterRecordsBySearchQuery(filteredRecords, search);
    }

    // Apply sorting
    filteredRecords = sortMarketRecords(filteredRecords, sort_by || 'price_desc');

    // Recompute analytics for the filtered subset so all KPI cards update in real time
    const analytics = marketService.calculateAnalytics(filteredRecords, result.analytics.commodity);

    res.json({
      success: true,
      source: result.source,
      reporting_date: result.reporting_date,
      fetched_at: result.fetched_at,
      from_cache: result.from_cache,
      is_stale: result.is_stale,
      warning: result.warning || result.date_fallback_note || null,
      analytics,
      records: filteredRecords
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch market prices from Agmarknet 2.0'
    });
  }
});

/**
 * GET /api/market/commodities
 * JSON endpoint for commodities catalog
 */
router.get('/api/market/commodities', async (req, res) => {
  try {
    const commodities = await marketService.getCommodities();
    res.json({ success: true, commodities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/market/locations
 * Cascading endpoint: returns states, or districts (if state_id), or mandis (if district_id)
 */
router.get('/api/market/locations', async (req, res) => {
  try {
    const { state_id, district_id } = req.query;

    if (state_id && district_id) {
      const markets = await marketService.getMarkets(state_id, district_id);
      return res.json({ success: true, type: 'markets', data: markets });
    }

    if (state_id) {
      const districts = await marketService.getDistricts(state_id);
      return res.json({ success: true, type: 'districts', data: districts });
    }

    const states = await marketService.getStates();
    return res.json({ success: true, type: 'states', data: states });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/market/history
 * Multi-day historical trends for a given commodity and mandi
 */
router.get('/api/market/history', async (req, res) => {
  try {
    const crop = req.query.crop || req.query.commodity || 'Wheat';
    const market = req.query.market || '';
    const days = parseInt(req.query.days, 10) || 5;

    const historyData = await marketService.getHistoricalTrend(crop, market, days);
    res.json(historyData);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch historical mandi rates'
    });
  }
});

/**
 * POST /api/market/transport-calc
 * Calculate net selling realization taking distance & transport costs into account
 */
router.post('/api/market/transport-calc', (req, res) => {
  try {
    const { records, costPerKmPerQtl, distanceKm, distances, farmState } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'records array is required' });
    }

    const result = marketService.calculateNetRealization(records, {
      costPerKmPerQtl,
      distanceKm,
      distances,
      farmState
    });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

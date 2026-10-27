const axios = require('axios');

class MarketIntelligenceService {
  constructor() {
    this.agmarknetBaseUrl = process.env.AGMARKNET_BASE_URL || 'https://api.agmarknet.gov.in/v1';
    this.dataGovInBaseUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    this.dataGovInApiKey = process.env.DATA_GOV_IN_API_KEY || '';
    
    // In-memory cache
    this.cache = new Map();
    this.staleCache = new Map();
    this.cacheTTL = (parseInt(process.env.MARKET_CACHE_TTL_MINUTES, 10) || 15) * 60 * 1000;

    // Cache catalogs
    this.commoditiesCache = null;
    this.statesCache = null;
    this.districtsCache = new Map();
    this.marketsCache = new Map();

    // In-flight request de-duplication
    this.inFlightRequests = new Map();

    // Default common commodities for instant mapping
    this.popularCommodities = [
      { id: 1, name: 'Wheat' },
      { id: 3, name: 'Rice' },
      { id: 569, name: 'Basmati Rice' },
      { id: 23, name: 'Onion' },
      { id: 24, name: 'Potato' },
      { id: 65, name: 'Tomato' },
      { id: 12, name: 'Mustard' },
      { id: 15, name: 'Cotton' },
      { id: 4, name: 'Maize' },
      { id: 13, name: 'Soyabean' }
    ];
  }

  getHeaders() {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://agmarknet.gov.in',
      'Referer': 'https://agmarknet.gov.in/',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Automatically solves official Agmarknet 2.0 Captcha using GoI accessibility endpoint.
   */
  async solveCaptcha(retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const headers = this.getHeaders();
        const genRes = await axios.post(`${this.agmarknetBaseUrl}/captcha/generator`, {}, {
          headers,
          timeout: 8000
        });

        if (!genRes.data || !genRes.data.captcha_key) {
          throw new Error('Agmarknet captcha generator failed to return captcha_key');
        }

        const captchaKey = genRes.data.captcha_key;
        const audioRes = await axios.get(`${this.agmarknetBaseUrl}/captcha/getaudio/${captchaKey}`, {
          headers,
          timeout: 8000
        });

        if (!audioRes.data || !audioRes.data.audio_text) {
          throw new Error('Agmarknet audio accessibility endpoint failed to return audio_text');
        }

        const captchaText = audioRes.data.audio_text.trim();
        return { captcha: captchaText, captcha_key: captchaKey };
      } catch (err) {
        if (attempt === retries) {
          throw new Error(`Failed to solve Agmarknet 2.0 Captcha after ${retries} attempts: ${err.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  /**
   * Fetch and cache the official list of 600+ commodities from Agmarknet 2.0.
   */
  async getCommodities() {
    if (this.commoditiesCache && (Date.now() - this.commoditiesCache.timestamp < 24 * 60 * 60 * 1000)) {
      return this.commoditiesCache.data;
    }

    try {
      const res = await axios.get(`${this.agmarknetBaseUrl}/commodities?page_size=650`, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      if (res.data && Array.isArray(res.data.data)) {
        const normalized = res.data.data.map(c => ({
          id: c.id,
          name: c.cmdt_name,
          groupId: c.cmdt_group_id
        })).sort((a, b) => a.name.localeCompare(b.name));

        this.commoditiesCache = {
          timestamp: Date.now(),
          data: normalized
        };
        return normalized;
      }
    } catch (err) {
      console.warn('Agmarknet commodities catalog fetch failed, using fallback list:', err.message);
    }

    return this.popularCommodities;
  }

  /**
   * Fetch and cache official states from Agmarknet 2.0.
   */
  async getStates() {
    if (this.statesCache && (Date.now() - this.statesCache.timestamp < 24 * 60 * 60 * 1000)) {
      return this.statesCache.data;
    }

    try {
      const res = await axios.get(`${this.agmarknetBaseUrl}/guest-location-filters`, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      if (Array.isArray(res.data)) {
        const states = res.data.map(s => ({
          id: s.id,
          name: s.state_name
        })).sort((a, b) => a.name.localeCompare(b.name));

        this.statesCache = {
          timestamp: Date.now(),
          data: states
        };
        return states;
      }
    } catch (err) {
      console.warn('Agmarknet states fetch failed:', err.message);
    }

    return [];
  }

  /**
   * Fetch and cache districts for a given state.
   */
  async getDistricts(stateId) {
    if (!stateId) return [];
    const cacheKey = `districts_${stateId}`;
    if (this.districtsCache.has(cacheKey)) {
      return this.districtsCache.get(cacheKey);
    }

    try {
      const res = await axios.get(`${this.agmarknetBaseUrl}/guest-location-filters?state_id=${stateId}`, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      if (Array.isArray(res.data)) {
        const districts = res.data.map(d => ({
          id: d.id,
          name: d.district_name
        })).sort((a, b) => a.name.localeCompare(b.name));

        this.districtsCache.set(cacheKey, districts);
        return districts;
      }
    } catch (err) {
      console.warn(`Agmarknet districts fetch failed for state ${stateId}:`, err.message);
    }

    return [];
  }

  /**
   * Fetch and cache markets (mandis) for a given state and district.
   */
  async getMarkets(stateId, districtId) {
    if (!stateId || !districtId) return [];
    const cacheKey = `markets_${stateId}_${districtId}`;
    if (this.marketsCache.has(cacheKey)) {
      return this.marketsCache.get(cacheKey);
    }

    try {
      const res = await axios.get(`${this.agmarknetBaseUrl}/guest-location-filters?state_id=${stateId}&district_id=${districtId}`, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      if (Array.isArray(res.data)) {
        const markets = res.data.map(m => ({
          id: m.id,
          name: m.mkt_name
        })).sort((a, b) => a.name.localeCompare(b.name));

        this.marketsCache.set(cacheKey, markets);
        return markets;
      }
    } catch (err) {
      console.warn(`Agmarknet markets fetch failed for district ${districtId}:`, err.message);
    }

    return [];
  }

  /**
   * Helper to resolve commodity ID and name
   */
  async resolveCommodity(identifier) {
    if (!identifier) return { id: 1, name: 'Wheat' };

    const commodities = await this.getCommodities();
    if (!isNaN(identifier)) {
      const idNum = parseInt(identifier, 10);
      const match = commodities.find(c => c.id === idNum);
      if (match) return match;
    }

    const nameStr = String(identifier).trim().toLowerCase();
    const exactMatch = commodities.find(c => c.name.toLowerCase() === nameStr);
    if (exactMatch) return exactMatch;

    const partialMatch = commodities.find(c => c.name.toLowerCase().includes(nameStr));
    if (partialMatch) return partialMatch;

    return { id: 1, name: 'Wheat' };
  }

  /**
   * Main method to fetch live daily market prices and arrivals from Agmarknet 2.0.
   */
  async getDailyMarketPrices(params = {}) {
    const commodity = await this.resolveCommodity(params.commodity || 'Wheat');
    const stateId = params.state ? parseInt(params.state, 10) : null;
    const districtId = params.district ? parseInt(params.district, 10) : null;
    const marketId = params.market ? parseInt(params.market, 10) : null;

    // Default to today in YYYY-MM-DD
    const today = new Date();
    const formatYMD = d => d.toISOString().split('T')[0];
    const targetDate = params.date ? params.date : formatYMD(today);

    const cacheKey = `prices_${commodity.id}_${stateId || 'all'}_${districtId || 'all'}_${marketId || 'all'}_${targetDate}`;

    // Check fresh cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
      return { ...cached.data, from_cache: true, is_stale: false };
    }

    // Check if duplicate request is currently in-flight
    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey);
    }

    const fetchPromise = (async () => {
      try {
        let result = await this.fetchFromAgmarknet({
          date: targetDate,
          commodityId: commodity.id,
          commodityName: commodity.name,
          stateId,
          districtId,
          marketId
        });

        // If today has 0 reporting mandis (e.g. early morning before mandis report),
        // seamlessly fall back to yesterday's complete verified government report
        if ((!result.records || result.records.length === 0) && !params.date) {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yDate = formatYMD(yesterday);
          
          const yResult = await this.fetchFromAgmarknet({
            date: yDate,
            commodityId: commodity.id,
            commodityName: commodity.name,
            stateId,
            districtId,
            marketId
          });

          if (yResult.records && yResult.records.length > 0) {
            yResult.date_fallback_note = `Mandis have not yet submitted reports for ${targetDate}; displaying the latest verified government report from ${yDate}.`;
            result = yResult;
          }
        }

        // Cache successful response
        this.cache.set(cacheKey, { timestamp: Date.now(), data: result });
        this.staleCache.set(cacheKey, { timestamp: Date.now(), data: result });

        return { ...result, from_cache: false, is_stale: false };
      } catch (err) {
        console.error('Error fetching from Agmarknet 2.0:', err.message);

        // Try data.gov.in alternative provider if configured
        if (this.dataGovInApiKey) {
          try {
            console.log('Attempting fallback to data.gov.in official dataset...');
            const altResult = await this.fetchFromDataGovIn({
              commodityName: commodity.name,
              stateId,
              targetDate
            });
            if (altResult && altResult.records && altResult.records.length > 0) {
              return { ...altResult, from_cache: false, is_stale: false, provider: 'data.gov.in' };
            }
          } catch (altErr) {
            console.warn('data.gov.in fallback also failed:', altErr.message);
          }
        }

        // Check stale cache fallback to ensure reliability
        if (this.staleCache.has(cacheKey)) {
          const stale = this.staleCache.get(cacheKey);
          return {
            ...stale.data,
            from_cache: true,
            is_stale: true,
            warning: 'Government API is currently busy or rate-limited. Displaying last verified cached report.'
          };
        }

        throw new Error(`Government Agmarknet 2.0 API is temporarily unavailable: ${err.message}`);
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  /**
   * Fetch from official Agmarknet 2.0 /prices-and-arrivals/commodity-market/daily-report-weighted
   */
  async fetchFromAgmarknet({ date, commodityId, commodityName, stateId, districtId, marketId }) {
    const { captcha, captcha_key } = await this.solveCaptcha();

    const payload = {
      date,
      commodityIds: [commodityId],
      stateIds: stateId ? [stateId] : [],
      marketIds: marketId ? [marketId] : [],
      captcha,
      captcha_key
    };

    const res = await axios.post(
      `${this.agmarknetBaseUrl}/prices-and-arrivals/commodity-market/daily-report-weighted`,
      payload,
      {
        headers: this.getHeaders(),
        timeout: 12000
      }
    );

    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Agmarknet 2.0 responded with unsuccessful status');
    }

    return this.normalizeAgmarknetData(res.data, commodityName, date);
  }

  /**
   * Normalizes Agmarknet 2.0 hierarchical JSON response into standard internal flat records + analytics.
   */
  normalizeAgmarknetData(govResponse, defaultCommodityName, reportDate) {
    const records = [];
    const commodityGroups = govResponse.commodities || [];

    for (const group of commodityGroups) {
      const items = group.items || [];
      for (const item of items) {
        const commName = item.commodity_name || defaultCommodityName;
        const states = item.states || [];

        for (const st of states) {
          const stateName = st.state;
          const markets = st.markets || [];

          for (const mkt of markets) {
            const marketName = mkt.market_name;
            const varieties = mkt.data || [];

            for (const v of varieties) {
              records.push({
                commodity: commName,
                state: stateName,
                market: marketName,
                variety: v.variety || 'Standard / Local',
                grade: v.grade || 'FAQ',
                min_price: Number(v.minPrice) || 0,
                max_price: Number(v.maxPrice) || 0,
                modal_price: Number(v.modalPrice) || 0,
                price_unit: v.unitOfPrice || 'Rs./Quintal',
                arrivals: Number(v.arrivals) || 0,
                arrivals_unit: v.unitOfArrivals || 'Metric Tonnes',
                below_msp: Boolean(v.belowMSP),
                reporting_date: reportDate,
                source: 'Agmarknet 2.0 - Ministry of Agriculture & Farmers Welfare, GoI',
                fetched_at: new Date().toISOString()
              });
            }
          }
        }
      }
    }

    // Compute Actionable Intelligence Analytics
    const analytics = this.calculateAnalytics(records, defaultCommodityName);

    return {
      success: true,
      source: 'Agmarknet 2.0 (Official Government of India Agricultural Marketing System)',
      reporting_date: reportDate,
      fetched_at: new Date().toISOString(),
      title: govResponse.title || `Commodity-wise, Market-wise Daily Report for ${defaultCommodityName}`,
      records_count: records.length,
      analytics,
      records
    };
  }

  /**
   * Compute comprehensive analytics over verified government records.
   */
  calculateAnalytics(records, commodityName) {
    if (!records || records.length === 0) {
      return {
        total_records: 0,
        reporting_mandis_count: 0,
        reporting_states_count: 0,
        total_arrivals: 0,
        arrivals_unit: 'Metric Tonnes',
        national_modal_avg: 0,
        highest_price: null,
        lowest_price: null,
        price_spread: 0,
        spread_percentage: 0,
        market_comparisons: []
      };
    }

    let minRecord = records[0];
    let maxRecord = records[0];
    let totalModal = 0;
    let totalArrivals = 0;
    const distinctMandis = new Set();
    const distinctStates = new Set();

    records.forEach(r => {
      distinctMandis.add(`${r.state} - ${r.market}`);
      distinctStates.add(r.state);
      totalModal += r.modal_price;
      totalArrivals += r.arrivals;

      if (r.modal_price > maxRecord.modal_price) {
        maxRecord = r;
      }
      if (r.modal_price < minRecord.modal_price && r.modal_price > 0) {
        minRecord = r;
      }
    });

    const avgModal = Math.round(totalModal / records.length);
    const spread = maxRecord.modal_price - minRecord.modal_price;
    const spreadPct = minRecord.modal_price > 0 
      ? Number(((spread / minRecord.modal_price) * 100).toFixed(1))
      : 0;

    // Market comparisons vs average
    const marketComparisons = records.map(r => {
      const diffFromAvg = r.modal_price - avgModal;
      const pctFromAvg = avgModal > 0 ? Number(((diffFromAvg / avgModal) * 100).toFixed(1)) : 0;
      return {
        market: r.market,
        state: r.state,
        variety: r.variety,
        modal_price: r.modal_price,
        min_price: r.min_price,
        max_price: r.max_price,
        arrivals: r.arrivals,
        diff_from_avg: diffFromAvg,
        pct_from_avg: pctFromAvg,
        position: diffFromAvg > 0 ? 'premium' : (diffFromAvg < 0 ? 'discount' : 'average')
      };
    }).sort((a, b) => b.modal_price - a.modal_price);

    return {
      commodity: commodityName,
      total_records: records.length,
      reporting_mandis_count: distinctMandis.size,
      reporting_states_count: distinctStates.size,
      total_arrivals: Number(totalArrivals.toFixed(2)),
      arrivals_unit: records[0]?.arrivals_unit || 'Metric Tonnes',
      price_unit: records[0]?.price_unit || 'Rs./Quintal',
      national_modal_avg: avgModal,
      highest_price: {
        price: maxRecord.modal_price,
        market: maxRecord.market,
        state: maxRecord.state,
        variety: maxRecord.variety
      },
      lowest_price: {
        price: minRecord.modal_price,
        market: minRecord.market,
        state: minRecord.state,
        variety: minRecord.variety
      },
      price_spread: spread,
      spread_percentage: spreadPct,
      market_comparisons: marketComparisons
    };
  }

  /**
   * Actionable Selling Location & Transportation Cost Optimizer.
   * Calculates net realization per quintal considering distance and transportation rate.
   */
  calculateNetRealization(records, transportParams = {}) {
    const defaultCostPerKmPerQtl = Number(transportParams.costPerKmPerQtl) || 2.5; // default ₹2.5 / km / quintal
    const farmState = transportParams.farmState || '';
    const farmDistrict = transportParams.farmDistrict || '';

    if (!records || records.length === 0) return [];

    const insights = records.map(r => {
      // If user provided a specific distance for this mandi, use it; otherwise estimate or leave 0
      const distanceKm = transportParams.distances && transportParams.distances[r.market] 
        ? Number(transportParams.distances[r.market]) 
        : (transportParams.distanceKm || 0);

      const estimatedTransportCost = Math.round(distanceKm * defaultCostPerKmPerQtl);
      const netRealization = r.modal_price - estimatedTransportCost;

      return {
        market: r.market,
        state: r.state,
        variety: r.variety,
        modal_price: r.modal_price,
        distance_km: distanceKm,
        transport_rate_per_km_qtl: defaultCostPerKmPerQtl,
        estimated_transport_cost: estimatedTransportCost,
        net_realization: netRealization,
        is_same_state: farmState ? r.state.toLowerCase() === farmState.toLowerCase() : true
      };
    });

    // Sort by highest net realization
    insights.sort((a, b) => b.net_realization - a.net_realization);

    return {
      disclaimer: 'Calculated mathematical estimate based on farmer inputs. Does not guarantee future prices or travel conditions.',
      cost_rate_applied: defaultCostPerKmPerQtl,
      best_mandi: insights[0] || null,
      insights
    };
  }

  /**
   * Fetches actual multi-day historical price trends from official Agmarknet 2.0.
   */
  async getHistoricalTrend(cropName, marketName, days = 5) {
    const commodity = await this.resolveCommodity(cropName);
    const history = [];
    const today = new Date();
    const formatYMD = d => d.toISOString().split('T')[0];

    // Check recent days
    for (let i = 0; i < days + 3 && history.length < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatYMD(d);

      try {
        const pricesData = await this.getDailyMarketPrices({
          commodity: commodity.name,
          date: dateStr
        });

        if (pricesData && pricesData.records && pricesData.records.length > 0) {
          // Look for matching market
          let match = null;
          if (marketName) {
            const cleanMarket = marketName.toLowerCase().replace(/apmc/g, '').trim();
            match = pricesData.records.find(r => r.market.toLowerCase().includes(cleanMarket));
          }

          // If no specific market match, use the state/national average or first record
          if (!match) {
            match = pricesData.records[0];
          }

          if (match) {
            history.push({
              date: dateStr,
              display_date: new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
              market: match.market,
              state: match.state,
              price: match.modal_price,
              min: match.min_price,
              max: match.max_price,
              arrivals: match.arrivals,
              variety: match.variety
            });
          }
        }
      } catch (e) {
        // Skip unavailable date
      }
    }

    // Determine real trends
    for (let i = 0; i < history.length; i++) {
      if (i < history.length - 1) {
        const current = history[i].price;
        const prev = history[i + 1].price;
        const diff = current - prev;
        history[i].trend = diff > 0 ? 'up' : (diff < 0 ? 'down' : 'stable');
        history[i].change = diff;
        history[i].change_pct = prev > 0 ? Number(((diff / prev) * 100).toFixed(1)) : 0;
      } else {
        history[i].trend = 'stable';
        history[i].change = 0;
        history[i].change_pct = 0;
      }
    }

    return {
      success: true,
      crop: commodity.name,
      market: marketName || (history[0]?.market || 'National Mandis'),
      source: 'Agmarknet 2.0 Historical Daily Records (GoI)',
      history
    };
  }

  /**
   * Optional Fallback: Fetch from Government of India's Open Government Data (data.gov.in)
   */
  async fetchFromDataGovIn({ commodityName, stateId, targetDate }) {
    if (!this.dataGovInApiKey) {
      throw new Error('DATA_GOV_IN_API_KEY is not configured in backend environment.');
    }

    const params = {
      'api-key': this.dataGovInApiKey,
      'format': 'json',
      'limit': 100,
      'filters[commodity]': commodityName
    };

    const res = await axios.get(this.dataGovInBaseUrl, { params, timeout: 10000 });
    if (!res.data || !Array.isArray(res.data.records)) {
      throw new Error('data.gov.in returned invalid structure or rate limited');
    }

    const records = res.data.records.map(r => ({
      commodity: r.commodity || commodityName,
      state: r.state || '',
      market: r.market || '',
      district: r.district || '',
      variety: r.variety || 'Standard',
      grade: r.grade || 'FAQ',
      min_price: Number(r.min_price) || 0,
      max_price: Number(r.max_price) || 0,
      modal_price: Number(r.modal_price) || 0,
      price_unit: 'Rs./Quintal',
      arrivals: Number(r.arrivals) || 0,
      arrivals_unit: 'Metric Tonnes',
      below_msp: false,
      reporting_date: r.arrival_date || targetDate,
      source: 'data.gov.in (Open Government Data Platform India)',
      fetched_at: new Date().toISOString()
    }));

    const analytics = this.calculateAnalytics(records, commodityName);

    return {
      success: true,
      source: 'data.gov.in - OGD Platform India (Ministry of Agriculture)',
      reporting_date: targetDate,
      fetched_at: new Date().toISOString(),
      records_count: records.length,
      analytics,
      records
    };
  }
}

module.exports = new MarketIntelligenceService();

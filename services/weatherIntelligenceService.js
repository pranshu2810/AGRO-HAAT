/**
 * AgroHaat Agricultural Weather & Intelligence Service
 * 
 * Provides:
 * 1. Location detection and reverse geocoding (GPS coordinates -> Village/District/State).
 * 2. High-resolution Agricultural Weather Integration (Open-Meteo & IMD API support).
 *    - Observed & Forecast: Temp, Apparent Temp, RH, Precip, Wind, Gusts, Cloud Cover.
 *    - Agricultural Variables: Soil Temperature (0cm, 6cm), Volumetric Soil Moisture (0-1cm, 1-3cm, 3-9cm),
 *      FAO-56 Penman-Monteith Reference Evapotranspiration (ET0), Shortwave Solar Radiation (W/m²), Dew Point.
 * 3. Agricultural Intelligence Engine:
 *    - Crop-specific water requirement (ETc = ET0 * Kc) based on crop and growth stage.
 *    - Scientific irrigation guidance (soil moisture depletion vs 48h rain forecast).
 *    - Spraying window advisory, rain risk alerts, heat stress, lodging, and fungal disease micro-climate warnings.
 * 4. Market Intelligence Bridge:
 *    - Integrates with AGMARKNET 2.0 to compare local vs regional mandi modal prices and net transport realization.
 */

const axios = require('axios');
const marketService = require('./marketIntelligenceService');

class WeatherIntelligenceService {
  constructor() {
    this.imdBaseUrl = 'https://api.imd.gov.in/api/v1';
    this.imdApiKey = process.env.IMD_API_KEY || '';
    this.openMeteoForecastUrl = 'https://api.open-meteo.com/v1/forecast';
    this.openMeteoGeocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';
    
    // In-memory weather cache (20 minutes TTL)
    this.cache = new Map();
    this.staleCache = new Map();
    this.cacheTTL = (parseInt(process.env.WEATHER_CACHE_TTL_MINUTES, 10) || 20) * 60 * 1000;

    // Standard FAO-56 Crop Coefficients (Kc) and critical thresholds by crop & growth stage
    this.cropDatabase = {
      wheat: {
        name: 'Wheat (गेहूं)',
        family: 'Cereal / Rabi',
        stages: {
          sowing: { label: 'Sowing & Germination (0-20 DAS)', kc: 0.40, desc: 'Initial seedling emergence; shallow root system requiring light topsoil moisture.' },
          crown_root: { label: 'Crown Root Initiation & Tillering (21-45 DAS)', kc: 1.15, desc: 'Most critical irrigation window in wheat; water deficit now causes severe tillering loss.' },
          heading: { label: 'Flowering & Heading (60-85 DAS)', kc: 1.20, desc: 'Peak water transpiration stage; highly sensitive to heat stress above 32°C.' },
          milking: { label: 'Milking & Grain Filling (86-105 DAS)', kc: 0.85, desc: 'Starch deposition in grains; moderate moisture needed, avoid over-irrigation to prevent lodging.' },
          maturity: { label: 'Ripening & Harvest (106-125 DAS)', kc: 0.40, desc: 'Dry down phase; stop irrigation 12-15 days before harvest.' }
        },
        heatStressThreshold: 34.0,
        lodgingWindThreshold: 28.0,
        frostThreshold: 4.0
      },
      paddy: {
        name: 'Paddy / Rice (धान)',
        family: 'Cereal / Kharif',
        stages: {
          nursery: { label: 'Nursery & Transplanting (0-25 DAS)', kc: 1.10, desc: 'Puddled conditions; standing water of 2-3 cm required for seedling establishment.' },
          tillering: { label: 'Active Tillering & Panicle Initiation (26-60 DAS)', kc: 1.20, desc: 'Vegetative expansion; continuous soil saturation or shallow submergence needed.' },
          flowering: { label: 'Flowering & Anthesis (61-85 DAS)', kc: 1.25, desc: 'Peak sensitivity; temperatures >35°C or water stress induce spikelet sterility.' },
          grain_fill: { label: 'Dough & Grain Filling (86-105 DAS)', kc: 0.95, desc: 'Gradual water draw-down while keeping root-zone moist.' },
          harvest: { label: 'Maturity & Pre-Harvest (106-120 DAS)', kc: 0.50, desc: 'Drain field completely 10-12 days before combine harvesting.' }
        },
        heatStressThreshold: 36.0,
        lodgingWindThreshold: 30.0,
        frostThreshold: 6.0
      },
      tomato: {
        name: 'Tomato (टमाटर)',
        family: 'Horticulture / Solanaceae',
        stages: {
          seedling: { label: 'Seedling & Early Vegetative (0-25 DAT)', kc: 0.60, desc: 'Root development; uniform moisture without waterlogging to prevent damping-off.' },
          flowering: { label: 'Flowering & Fruit Setting (26-50 DAT)', kc: 1.15, desc: 'Critical period; moisture fluctuation causes flower drop and blossom end rot.' },
          fruit_dev: { label: 'Fruit Development & Sizing (51-80 DAT)', kc: 1.20, desc: 'Peak water demand; regular drip cycles prevent fruit cracking.' },
          harvest: { label: 'Harvesting & Ripening (81-120 DAT)', kc: 0.80, desc: 'Frequent pickings; avoid overhead sprinkler watering to reduce blight.' }
        },
        heatStressThreshold: 35.0,
        lodgingWindThreshold: 22.0,
        frostThreshold: 3.5
      },
      cotton: {
        name: 'Cotton (कपास)',
        family: 'Cash Crop / Malvaceae',
        stages: {
          emergence: { label: 'Emergence & Early Branching (0-35 DAS)', kc: 0.45, desc: 'Deep taproot exploration; drought-tolerant initial stage.' },
          squaring: { label: 'Square Formation & Flowering (36-70 DAS)', kc: 1.05, desc: 'Flower bud development; moderate moisture required.' },
          boll_dev: { label: 'Peak Boll Formation (71-110 DAS)', kc: 1.20, desc: 'Critical yield phase; moisture stress causes shedding of young bolls.' },
          boll_open: { label: 'Boll Opening & Harvesting (111-160 DAS)', kc: 0.65, desc: 'Dry weather essential; rainfall during boll opening discolors and damages lint.' }
        },
        heatStressThreshold: 40.0,
        lodgingWindThreshold: 32.0,
        frostThreshold: 5.0
      },
      potato: {
        name: 'Potato (आलू)',
        family: 'Horticulture / Tuber',
        stages: {
          sprouting: { label: 'Sprouting & Emergence (0-20 DAP)', kc: 0.50, desc: 'Tuber sprout emergence; light moisture in ridges.' },
          tuber_init: { label: 'Stolon & Tuber Initiation (21-45 DAP)', kc: 0.90, desc: 'Tuber count fixed; consistent moisture prevents common scab infection.' },
          bulking: { label: 'Tuber Bulking & Enlargement (46-80 DAP)', kc: 1.15, desc: 'Maximum dry matter accumulation; water stress limits tuber size.' },
          maturity: { label: 'Skin Set & Pre-Harvest (81-100 DAP)', kc: 0.70, desc: 'Dehaulming stage; stop watering to harden tuber skin.' }
        },
        heatStressThreshold: 30.0,
        lodgingWindThreshold: 25.0,
        frostThreshold: 2.5
      },
      maize: {
        name: 'Maize / Corn (मक्का)',
        family: 'Cereal / Kharif & Rabi',
        stages: {
          vegetative: { label: 'Early Vegetative (V1-V8)', kc: 0.45, desc: 'Knee-high stage; well-drained fertile soil required.' },
          tasseling: { label: 'Tasseling & Silking (VT-R1)', kc: 1.20, desc: 'Most moisture-critical phase; stress during pollination causes unfilled cobs.' },
          grain_fill: { label: 'Dough & Dent Stage (R2-R5)', kc: 1.10, desc: 'Kernel dry weight accumulation.' },
          maturity: { label: 'Black Layer & Harvest (R6)', kc: 0.50, desc: 'Physiological maturity; grain dry down.' }
        },
        heatStressThreshold: 38.0,
        lodgingWindThreshold: 30.0,
        frostThreshold: 4.0
      },
      mustard: {
        name: 'Mustard / Rapeseed (सरसों)',
        family: 'Oilseed / Rabi',
        stages: {
          germination: { label: 'Germination & Rosette (0-30 DAS)', kc: 0.35, desc: 'Initial foliage formation.' },
          flowering: { label: 'Flowering & Branching (31-60 DAS)', kc: 1.10, desc: 'Full bloom; critical for pod setting, very sensitive to frost and cloudy weather.' },
          pod_fill: { label: 'Siliqua / Pod Formation (61-90 DAS)', kc: 0.85, desc: 'Seed oil filling in pods.' },
          maturity: { label: 'Ripening & Harvest (91-115 DAS)', kc: 0.35, desc: 'Siliquae turn golden yellow; avoid moisture.' }
        },
        heatStressThreshold: 32.0,
        lodgingWindThreshold: 24.0,
        frostThreshold: 3.0
      },
      soybean: {
        name: 'Soybean (सोयाबीन)',
        family: 'Legume / Oilseed',
        stages: {
          vegetative: { label: 'Emergence & Vegetative (VE-V4)', kc: 0.40, desc: 'Root nodulation and nitrogen fixation active.' },
          flowering: { label: 'Flowering & Pod Initiation (R1-R3)', kc: 1.15, desc: 'Critical water requirement; drought causes flower abortion.' },
          pod_fill: { label: 'Full Pod & Seed Filling (R4-R6)', kc: 1.15, desc: 'Seed size and protein development.' },
          maturity: { label: 'Leaf Drop & Harvest (R7-R8)', kc: 0.50, desc: 'Leaves yellow and drop; dry field conditions.' }
        },
        heatStressThreshold: 36.0,
        lodgingWindThreshold: 26.0,
        frostThreshold: 4.0
      }
    };

    // Curated Indian Agricultural District Coordinates Directory
    this.districtDirectory = [
      { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882, crops: ['cotton', 'soybean', 'paddy', 'wheat'] },
      { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898, crops: ['tomato', 'wheat', 'maize', 'soybean'] },
      { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, crops: ['tomato', 'wheat', 'maize', 'soybean'] },
      { name: 'Amravati', state: 'Maharashtra', lat: 20.9320, lon: 77.7523, crops: ['cotton', 'soybean', 'wheat'] },
      { name: 'Aurangabad (Chhatrapati Sambhajinagar)', state: 'Maharashtra', lat: 19.8762, lon: 75.3433, crops: ['cotton', 'maize', 'wheat'] },
      { name: 'Karnal', state: 'Haryana', lat: 29.6857, lon: 76.9905, crops: ['wheat', 'paddy', 'mustard'] },
      { name: 'Hisar', state: 'Haryana', lat: 29.1492, lon: 75.7217, crops: ['cotton', 'mustard', 'wheat'] },
      { name: 'Sirsa', state: 'Haryana', lat: 29.5349, lon: 75.0298, crops: ['cotton', 'wheat', 'mustard'] },
      { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573, crops: ['wheat', 'paddy', 'potato'] },
      { name: 'Bhatinda', state: 'Punjab', lat: 30.2110, lon: 74.9455, crops: ['cotton', 'wheat', 'mustard'] },
      { name: 'Jalandhar', state: 'Punjab', lat: 31.3260, lon: 75.5762, crops: ['potato', 'wheat', 'paddy'] },
      { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, crops: ['soybean', 'wheat', 'potato'] },
      { name: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1765, lon: 75.7885, crops: ['soybean', 'wheat', 'mustard'] },
      { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, crops: ['wheat', 'soybean'] },
      { name: 'Hoshangabad (Narmadapuram)', state: 'Madhya Pradesh', lat: 22.7519, lon: 77.7289, crops: ['wheat', 'paddy', 'soybean'] },
      { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739, crops: ['paddy', 'wheat', 'mustard', 'tomato'] },
      { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081, crops: ['potato', 'mustard', 'wheat'] },
      { name: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lon: 77.7064, crops: ['wheat', 'mustard', 'potato'] },
      { name: 'Aligarh', state: 'Uttar Pradesh', lat: 27.8974, lon: 78.0880, crops: ['wheat', 'mustard', 'potato'] },
      { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, crops: ['mustard', 'wheat', 'tomato'] },
      { name: 'Kota', state: 'Rajasthan', lat: 25.2138, lon: 75.8648, crops: ['soybean', 'mustard', 'wheat'] },
      { name: 'Sri Ganganagar', state: 'Rajasthan', lat: 29.9038, lon: 73.8772, crops: ['cotton', 'wheat', 'mustard'] },
      { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, crops: ['cotton', 'wheat', 'potato'] },
      { name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022, crops: ['cotton', 'wheat'] },
      { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365, crops: ['cotton', 'paddy', 'tomato'] },
      { name: 'Krishna (Vijayawada)', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480, crops: ['paddy', 'cotton', 'maize'] },
      { name: 'Warangal', state: 'Telangana', lat: 17.9689, lon: 79.5941, crops: ['cotton', 'paddy', 'maize'] },
      { name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376, crops: ['paddy', 'wheat', 'maize'] },
      { name: 'Muzaffarpur', state: 'Bihar', lat: 26.1209, lon: 85.3647, crops: ['paddy', 'wheat', 'maize'] },
      { name: 'Burdwan (Purba Bardhaman)', state: 'West Bengal', lat: 23.2324, lon: 87.8615, crops: ['paddy', 'potato', 'mustard'] },
      { name: 'Nadia', state: 'West Bengal', lat: 23.4710, lon: 88.5565, crops: ['paddy', 'mustard', 'tomato'] }
    ];
  }

  /**
   * Reverse-geocodes latitude and longitude into State, District, and Village/Town.
   * Uses OpenStreetMap Nominatim with fallback to nearest Indian district centroid.
   */
  async reverseGeocode(lat, lon) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid latitude or longitude provided.');
    }

    try {
      const geoRes = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=14&addressdetails=1`,
        {
          headers: { 'User-Agent': 'AgroHaat-WeatherIntelligence/2.0 (contact@agrohaat.org)' },
          timeout: 4500
        }
      );

      if (geoRes.data && geoRes.data.address) {
        const addr = geoRes.data.address;
        const village = addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || '';
        const town = addr.town || addr.city || addr.municipality || village || 'Local Farm';
        const district = (addr.state_district || addr.county || addr.district || town).replace(' District', '').trim();
        const state = addr.state || 'India';

        return {
          success: true,
          source: 'OpenStreetMap Reverse Geocoding',
          latitude,
          longitude,
          village: village || town,
          town,
          district,
          state,
          country: addr.country || 'India',
          formatted_address: `${village ? village + ', ' : ''}${district}, ${state}`,
          is_fallback: false
        };
      }
    } catch (err) {
      console.warn('Nominatim reverse geocoding notice:', err.message);
    }

    // Fallback: Haversine distance search in curated Indian district directory
    let bestMatch = this.districtDirectory[0];
    let minDistance = Infinity;

    for (const dist of this.districtDirectory) {
      const dLat = (dist.lat - latitude) * Math.PI / 180;
      const dLon = (dist.lon - longitude) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(latitude * Math.PI / 180) * Math.cos(dist.lat * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = 6371 * c; // Earth radius in km

      if (d < minDistance) {
        minDistance = d;
        bestMatch = dist;
      }
    }

    return {
      success: true,
      source: 'AgroHaat Indian District Geospatial Fallback',
      latitude,
      longitude,
      village: `Near ${bestMatch.name}`,
      town: bestMatch.name,
      district: bestMatch.name,
      state: bestMatch.state,
      country: 'India',
      formatted_address: `${bestMatch.name}, ${bestMatch.state}`,
      distance_km: Math.round(minDistance),
      is_fallback: true
    };
  }

  /**
   * Search for locations across India by name (returns suggestions with lat, lon, state, district).
   */
  async searchLocation(query) {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return this.districtDirectory.slice(0, 10);
    }

    const cleanQuery = query.trim().toLowerCase();

    // 1. Check local directory first (instantaneous match)
    const localMatches = this.districtDirectory.filter(d =>
      d.name.toLowerCase().includes(cleanQuery) || d.state.toLowerCase().includes(cleanQuery)
    );

    // 2. Query Open-Meteo Geocoding API for granular villages/tehsils
    try {
      const searchRes = await axios.get(
        `${this.openMeteoGeocodingUrl}?name=${encodeURIComponent(cleanQuery)}&count=8&language=en&format=json&country=IN`,
        { timeout: 4000 }
      );

      if (searchRes.data && Array.isArray(searchRes.data.results)) {
        const remoteResults = searchRes.data.results.map(r => ({
          name: r.name,
          district: r.admin2 || r.name,
          state: r.admin1 || 'India',
          lat: r.latitude,
          lon: r.longitude,
          crops: this.inferDistrictCrops(r.admin2 || r.name, r.admin1 || '')
        }));

        // Merge without duplicates
        const combined = [...localMatches];
        for (const rem of remoteResults) {
          if (!combined.some(c => Math.abs(c.lat - rem.lat) < 0.05 && Math.abs(c.lon - rem.lon) < 0.05)) {
            combined.push(rem);
          }
        }
        return combined.slice(0, 10);
      }
    } catch (e) {
      console.warn('Geocoding search notice:', e.message);
    }

    return localMatches.length > 0 ? localMatches : this.districtDirectory.slice(0, 8);
  }

  inferDistrictCrops(district, state) {
    const match = this.districtDirectory.find(d => 
      d.name.toLowerCase().includes(district.toLowerCase()) ||
      district.toLowerCase().includes(d.name.toLowerCase())
    );
    if (match) return match.crops;
    
    // State general heuristic
    const st = state.toLowerCase();
    if (st.includes('punjab') || st.includes('haryana')) return ['wheat', 'paddy', 'mustard', 'cotton'];
    if (st.includes('maharashtra') || st.includes('gujarat')) return ['cotton', 'soybean', 'wheat', 'tomato'];
    if (st.includes('madhya')) return ['soybean', 'wheat', 'mustard'];
    if (st.includes('uttar') || st.includes('bihar')) return ['wheat', 'paddy', 'potato', 'mustard'];
    return ['wheat', 'paddy', 'tomato'];
  }

  /**
   * Main weather retrieval engine.
   * Handles caching, timeout, provider fallback, and agricultural parameter parsing.
   */
  async getWeatherData({ lat, lon, state, district, town }) {
    let latitude = parseFloat(lat);
    let longitude = parseFloat(lon);

    // If coordinates missing, resolve from district name or default to Nagpur
    if (isNaN(latitude) || isNaN(longitude)) {
      const match = this.districtDirectory.find(d => 
        (district && d.name.toLowerCase().includes(district.toLowerCase())) ||
        (town && d.name.toLowerCase().includes(town.toLowerCase()))
      ) || this.districtDirectory[0];

      latitude = match.lat;
      longitude = match.lon;
    }

    const cacheKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
    const now = Date.now();

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (now - cached.timestamp < this.cacheTTL) {
        return { ...cached.data, is_cached: true, cached_at: new Date(cached.timestamp).toISOString() };
      }
    }

    let weatherResult = null;

    // 1. Optional IMD API Integration if user provided IMD_API_KEY
    if (this.imdApiKey) {
      try {
        const imdRes = await axios.get(
          `${this.imdBaseUrl}/cityforecastloc?lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              'Authorization': `Bearer ${this.imdApiKey}`,
              'Accept': 'application/json'
            },
            timeout: 5000
          }
        );
        if (imdRes.data && !imdRes.data.error) {
          weatherResult = this.parseImdResponse(imdRes.data, latitude, longitude);
        }
      } catch (imdErr) {
        console.warn('IMD API request notice (falling back to Open-Meteo Agricultural NWP):', imdErr.message);
      }
    }

    // 2. High-Resolution Open-Meteo Agricultural Weather Engine (ECMWF IFS / GFS Blend)
    if (!weatherResult) {
      try {
        const params = [
          `latitude=${latitude}`,
          `longitude=${longitude}`,
          `current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure`,
          `hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,soil_temperature_0cm,soil_temperature_6cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,et0_fao_evapotranspiration,shortwave_radiation,surface_pressure`,
          `daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,et0_fao_evapotranspiration`,
          `timezone=Asia%2FKolkata`,
          `forecast_days=7`
        ].join('&');

        const omRes = await axios.get(`${this.openMeteoForecastUrl}?${params}`, { timeout: 8000 });

        if (omRes.data && omRes.data.current) {
          weatherResult = this.parseOpenMeteoResponse(omRes.data, latitude, longitude);
        }
      } catch (omErr) {
        console.error('Open-Meteo API Error:', omErr.message);
      }
    }

    // 3. Stale cache fallback if live API failed
    if (!weatherResult && this.staleCache.has(cacheKey)) {
      const stale = this.staleCache.get(cacheKey);
      return {
        ...stale.data,
        is_stale: true,
        stale_warning: 'Live weather service momentarily unreachable; displaying cached sensor records.',
        last_updated: new Date(stale.timestamp).toISOString()
      };
    }

    if (!weatherResult) {
      throw new Error('Unable to retrieve weather data from live providers at this time.');
    }

    // Store in cache
    this.cache.set(cacheKey, { timestamp: now, data: weatherResult });
    this.staleCache.set(cacheKey, { timestamp: now, data: weatherResult });

    return { ...weatherResult, is_cached: false };
  }

  /**
   * Parse Open-Meteo response into normalized agricultural structure.
   */
  parseOpenMeteoResponse(data, latitude, longitude) {
    const cur = data.current || {};
    const daily = data.daily || {};
    const hourly = data.hourly || {};

    const weatherCode = cur.weather_code || 0;
    const weatherCondition = this.wmoCodeToCondition(weatherCode);

    // Current soil and ET0 estimates from current hour or index 0
    const currentSoilTemp0 = (hourly.soil_temperature_0cm && hourly.soil_temperature_0cm[0] !== undefined)
      ? hourly.soil_temperature_0cm[0] : (cur.temperature_2m - 1.5);
    const currentSoilTemp6 = (hourly.soil_temperature_6cm && hourly.soil_temperature_6cm[0] !== undefined)
      ? hourly.soil_temperature_6cm[0] : (cur.temperature_2m - 2.0);

    const sm0_1 = (hourly.soil_moisture_0_to_1cm && hourly.soil_moisture_0_to_1cm[0] !== undefined) ? hourly.soil_moisture_0_to_1cm[0] : 0.18;
    const sm1_3 = (hourly.soil_moisture_1_to_3cm && hourly.soil_moisture_1_to_3cm[0] !== undefined) ? hourly.soil_moisture_1_to_3cm[0] : 0.19;
    const sm3_9 = (hourly.soil_moisture_3_to_9cm && hourly.soil_moisture_3_to_9cm[0] !== undefined) ? hourly.soil_moisture_3_to_9cm[0] : 0.20;
    const rootZoneMoisture = parseFloat(((sm0_1 + sm1_3 + sm3_9) / 3).toFixed(3)); // m³/m³

    const todayEt0 = (daily.et0_fao_evapotranspiration && daily.et0_fao_evapotranspiration[0]) || 4.2;
    const todayRainSum = (daily.rain_sum && daily.rain_sum[0] !== undefined) ? daily.rain_sum[0] : 0;
    const todayRainProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[0] !== undefined) ? daily.precipitation_probability_max[0] : 0;

    // 24-hour next forecast points
    const hourlyForecast = [];
    const maxHourlyPoints = Math.min(24, hourly.time ? hourly.time.length : 0);
    for (let i = 0; i < maxHourlyPoints; i++) {
      hourlyForecast.push({
        time: hourly.time[i],
        hour_display: new Date(hourly.time[i]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        temperature: Math.round(hourly.temperature_2m[i]),
        humidity: hourly.relative_humidity_2m[i],
        dew_point: hourly.dew_point_2m ? hourly.dew_point_2m[i] : null,
        rain_probability: hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0,
        rain_mm: hourly.precipitation ? hourly.precipitation[i] : 0,
        wind_speed: Math.round(hourly.wind_speed_10m[i]),
        wind_direction: hourly.wind_direction_10m[i],
        soil_moisture: hourly.soil_moisture_3_to_9cm ? hourly.soil_moisture_3_to_9cm[i] : sm3_9,
        et0: hourly.et0_fao_evapotranspiration ? hourly.et0_fao_evapotranspiration[i] : 0,
        solar_radiation: hourly.shortwave_radiation ? Math.round(hourly.shortwave_radiation[i]) : 0,
        weather_code: hourly.weather_code[i],
        condition: this.wmoCodeToCondition(hourly.weather_code[i]).text,
        icon: this.wmoCodeToCondition(hourly.weather_code[i]).icon
      });
    }

    // 7-day multi-day forecast
    const dailyForecast = [];
    const numDays = daily.time ? daily.time.length : 0;
    for (let d = 0; d < numDays; d++) {
      const cond = this.wmoCodeToCondition(daily.weather_code[d]);
      const dateObj = new Date(daily.time[d]);
      dailyForecast.push({
        date: daily.time[d],
        day_name: d === 0 ? 'Today' : (d === 1 ? 'Tomorrow' : dateObj.toLocaleDateString('en-IN', { weekday: 'short' })),
        date_display: dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        max_temp: Math.round(daily.temperature_2m_max[d]),
        min_temp: Math.round(daily.temperature_2m_min[d]),
        apparent_max: daily.apparent_temperature_max ? Math.round(daily.apparent_temperature_max[d]) : Math.round(daily.temperature_2m_max[d]),
        apparent_min: daily.apparent_temperature_min ? Math.round(daily.apparent_temperature_min[d]) : Math.round(daily.temperature_2m_min[d]),
        rain_sum: daily.rain_sum ? daily.rain_sum[d] : (daily.precipitation_sum ? daily.precipitation_sum[d] : 0),
        rain_probability: daily.precipitation_probability_max ? daily.precipitation_probability_max[d] : 0,
        max_wind: Math.round(daily.wind_speed_10m_max[d]),
        max_gust: daily.wind_gusts_10m_max ? Math.round(daily.wind_gusts_10m_max[d]) : Math.round(daily.wind_speed_10m_max[d] * 1.4),
        et0_mm: daily.et0_fao_evapotranspiration ? daily.et0_fao_evapotranspiration[d] : 4.0,
        uv_max: daily.uv_index_max ? daily.uv_index_max[d] : 5.0,
        sunrise: daily.sunrise ? daily.sunrise[d].split('T')[1] : '06:15',
        sunset: daily.sunset ? daily.sunset[d].split('T')[1] : '17:45',
        weather_code: daily.weather_code[d],
        condition: cond.text,
        icon: cond.icon
      });
    }

    // 48h and 72h accumulated rainfall calculation
    let rain48h = 0;
    let rain72h = 0;
    dailyForecast.forEach((day, idx) => {
      if (idx < 2) rain48h += (day.rain_sum || 0);
      if (idx < 3) rain72h += (day.rain_sum || 0);
    });

    return {
      provider: 'Open-Meteo High-Resolution Agricultural NWP (ECMWF/GFS)',
      provider_badge: 'Global ECMWF IFS & GFS Agricultural Model',
      provider_official_status: 'International Authorized Open Data (ECMWF/WMO Standard)',
      data_mode: 'Model-Assimilated Observational Blend & Numerical Prediction',
      last_updated: cur.time || new Date().toISOString(),
      location: {
        latitude,
        longitude,
        elevation_meters: data.elevation || 310
      },
      current: {
        temperature: Math.round(cur.temperature_2m),
        apparent_temperature: Math.round(cur.apparent_temperature),
        humidity: cur.relative_humidity_2m,
        precipitation: cur.precipitation || 0,
        rain: cur.rain || 0,
        weather_code: weatherCode,
        condition: weatherCondition.text,
        icon: weatherCondition.icon,
        cloud_cover: cur.cloud_cover,
        wind_speed: Math.round(cur.wind_speed_10m),
        wind_direction: cur.wind_direction_10m,
        wind_direction_cardinal: this.degToCompass(cur.wind_direction_10m),
        wind_gusts: Math.round(cur.wind_gusts_10m || (cur.wind_speed_10m * 1.3)),
        surface_pressure: cur.surface_pressure || 1012,
        is_day: cur.is_day === 1
      },
      agricultural_variables: {
        soil_temperature_0cm: currentSoilTemp0,
        soil_temperature_6cm: currentSoilTemp6,
        soil_moisture_0_to_1cm: sm0_1,
        soil_moisture_1_to_3cm: sm1_3,
        soil_moisture_3_to_9cm: sm3_9,
        root_zone_moisture_m3m3: rootZoneMoisture,
        root_zone_moisture_percentage: Math.round(rootZoneMoisture * 100),
        et0_fao_evapotranspiration_daily: todayEt0,
        today_rain_sum: todayRainSum,
        today_rain_probability: todayRainProb,
        accumulated_rain_48h: parseFloat(rain48h.toFixed(1)),
        accumulated_rain_72h: parseFloat(rain72h.toFixed(1)),
        uv_index: (daily.uv_index_max && daily.uv_index_max[0]) || 5.5,
        data_type: 'FAO-56 Penman-Monteith & Multi-Layer Soil Hydraulic Model Estimates'
      },
      hourly: hourlyForecast,
      daily: dailyForecast
    };
  }

  /**
   * Helper to convert WMO Weather Codes (0-99) into text descriptions & icons.
   */
  wmoCodeToCondition(code) {
    const table = {
      0: { text: 'Clear Sky (साफ आसमान)', icon: 'sun', category: 'Clear' },
      1: { text: 'Mainly Clear (मुख्यतः साफ)', icon: 'cloud-sun', category: 'Clear' },
      2: { text: 'Partly Cloudy (आंशिक बादल)', icon: 'cloud-sun', category: 'Cloudy' },
      3: { text: 'Overcast (घने बादल)', icon: 'cloud', category: 'Cloudy' },
      45: { text: 'Foggy (कोहरा)', icon: 'smog', category: 'Fog' },
      48: { text: 'Depositing Rime Fog', icon: 'smog', category: 'Fog' },
      51: { text: 'Light Drizzle (हल्की बूंदाबांदी)', icon: 'cloud-rain', category: 'Rain' },
      53: { text: 'Moderate Drizzle (मध्यम बूंदाबांदी)', icon: 'cloud-rain', category: 'Rain' },
      55: { text: 'Dense Drizzle (तेज बूंदाबांदी)', icon: 'cloud-rain', category: 'Rain' },
      61: { text: 'Slight Rain (हल्की बारिश)', icon: 'cloud-rain', category: 'Rain' },
      63: { text: 'Moderate Rain (मध्यम बारिश)', icon: 'cloud-showers-heavy', category: 'Rain' },
      65: { text: 'Heavy Rain (भारी बारिश)', icon: 'cloud-showers-heavy', category: 'Rain' },
      80: { text: 'Slight Rain Showers', icon: 'cloud-sun-rain', category: 'Rain' },
      81: { text: 'Moderate Showers', icon: 'cloud-showers-heavy', category: 'Rain' },
      82: { text: 'Violent Showers (तेज बौछारें)', icon: 'cloud-showers-heavy', category: 'Rain' },
      95: { text: 'Thunderstorm (गरज के साथ बारिश)', icon: 'bolt', category: 'Storm' },
      96: { text: 'Thunderstorm with Slight Hail (ओलावृष्टि)', icon: 'cloud-bolt', category: 'Storm' },
      99: { text: 'Thunderstorm with Heavy Hail (भारी ओलावृष्टि)', icon: 'cloud-bolt', category: 'Storm' }
    };
    return table[code] || { text: 'Moderate Weather', icon: 'cloud-sun', category: 'Moderate' };
  }

  degToCompass(num) {
    const val = Math.floor((num / 22.5) + 0.5);
    const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return arr[(val % 16)];
  }

  /**
   * Generates Explainable Agricultural Intelligence and Actionable Recommendations.
   * Uses real Penman-Monteith ET0, crop-stage Kc, soil moisture, and rain forecasts.
   */
  generateAgriculturalIntelligence(weatherData, cropKey = 'wheat', stageKey = null) {
    const crop = this.cropDatabase[cropKey.toLowerCase()] || this.cropDatabase.wheat;
    const stages = crop.stages;
    const activeStageKey = stageKey && stages[stageKey] ? stageKey : Object.keys(stages)[1] || Object.keys(stages)[0];
    const stage = stages[activeStageKey];

    const cur = weatherData.current;
    const ag = weatherData.agricultural_variables;
    const hourly = weatherData.hourly || [];

    const et0 = ag.et0_fao_evapotranspiration_daily; // mm/day
    const kc = stage.kc;
    const etc = parseFloat((et0 * kc).toFixed(2)); // Daily crop evapotranspiration (mm/day)

    const soilMoistureVol = ag.root_zone_moisture_m3m3; // m³/m³
    const rain48h = ag.accumulated_rain_48h; // mm
    const rain72h = ag.accumulated_rain_72h; // mm

    // 1. Irrigation Decision Matrix
    // Thresholds: Saturation > 0.32, Field Capacity ~0.24-0.30, Depletion Point ~0.18, Severe Stress < 0.15
    let irrigationStatus = 'ADEQUATE';
    let irrigationAction = 'No Irrigation Needed';
    let irrigationActionHi = 'सिंचाई की आवश्यकता नहीं है';
    let irrigationDepthMm = 0;
    let irrigationPriority = 'success';
    let irrigationExplanation = '';

    if (rain48h >= 12.0) {
      irrigationStatus = 'DELAY_FOR_RAIN';
      irrigationAction = 'Postpone Irrigation (Rain Imminent)';
      irrigationActionHi = 'सिंचाई स्थगित करें (बारिश का अनुमान)';
      irrigationDepthMm = 0;
      irrigationPriority = 'info';
      irrigationExplanation = `Significant precipitation of ~${rain48h} mm is forecast in the next 48 hours. Postpone scheduled irrigation to prevent root hypoxia, waterlogging, and fertilizer nitrogen leaching.`;
    } else if (soilMoistureVol < 0.17) {
      irrigationStatus = 'IRRIGATE_URGENT';
      irrigationAction = 'Irrigate Immediately (Moisture Stress)';
      irrigationActionHi = 'तत्काल सिंचाई करें (नमी की भारी कमी)';
      irrigationDepthMm = Math.round(Math.max(25, etc * 5)); // 5 days depletion replenishment
      irrigationPriority = 'danger';
      irrigationExplanation = `Root-zone volumetric soil moisture is currently ${ag.root_zone_moisture_percentage}% (0.17 m³/m³ threshold breached). With active crop evapotranspiration at ${etc} mm/day and only ${rain48h} mm rain expected, apply approximately ${irrigationDepthMm} mm (~300 m³/ha) irrigation water now.`;
    } else if (soilMoistureVol < 0.22 && rain72h < 5.0) {
      irrigationStatus = 'LIGHT_IRRIGATION';
      irrigationAction = 'Plan Light / Deficit Irrigation';
      irrigationActionHi = 'हल्की सिंचाई की योजना बनाएं';
      irrigationDepthMm = Math.round(etc * 3.5);
      irrigationPriority = 'warning';
      irrigationExplanation = `Soil moisture is at moderate reserve (${ag.root_zone_moisture_percentage}%). Crop transpiration requirement is ${etc} mm/day. Apply light irrigation of ${irrigationDepthMm} mm within the next 48 hours to maintain continuous vegetative growth.`;
    } else {
      irrigationStatus = 'ADEQUATE_MOISTURE';
      irrigationAction = 'Soil Moisture Adequate (Hold Irrigation)';
      irrigationActionHi = 'मिट्टी में पर्याप्त नमी है';
      irrigationDepthMm = 0;
      irrigationPriority = 'success';
      irrigationExplanation = `Current soil moisture (${ag.root_zone_moisture_percentage}%) is in the optimal root-aeration zone (0.22 - 0.32 m³/m³). Transpiration rate is manageable at ${etc} mm/day. Next review recommended in 72 hours.`;
    }

    // 2. Chemical & Pesticide Spraying Window Analysis (Next 24h)
    let bestSprayWindow = null;
    let spraySafeHours = 0;
    const sprayWindows = [];

    hourly.slice(0, 24).forEach(h => {
      const isDaytime = new Date(h.time).getHours() >= 6 && new Date(h.time).getHours() <= 18;
      const windSafe = h.wind_speed <= 15;
      const rainSafe = h.rain_probability <= 20 && h.rain_mm < 0.1;
      const humiditySafe = h.humidity >= 45 && h.humidity <= 80;

      if (isDaytime && windSafe && rainSafe && humiditySafe) {
        spraySafeHours++;
        sprayWindows.push(h.hour_display);
      }
    });

    let sprayStatus = 'UNFAVORABLE';
    let sprayRecommendation = 'Avoid chemical spraying today due to high wind drift or rain probability.';
    let sprayRecommendationHi = 'हवा या बारिश की संभावना के कारण आज कीटनाशक छिड़काव से बचें।';

    if (spraySafeHours >= 4) {
      sprayStatus = 'FAVORABLE';
      const startSlot = sprayWindows[0];
      const endSlot = sprayWindows[Math.min(sprayWindows.length - 1, 4)];
      sprayRecommendation = `Safe spraying window identified between ${startSlot} and ${endSlot}. Wind speed is calm (<15 km/h) and rain probability is low (<20%).`;
      sprayRecommendationHi = `छिड़काव के लिए अनुकूल समय: ${startSlot} से ${endSlot}। हवा शांत है और बारिश का जोखिम कम है।`;
      bestSprayWindow = `${startSlot} - ${endSlot}`;
    } else if (cur.wind_speed > 18) {
      sprayRecommendation = `High wind speeds (${cur.wind_speed} km/h) will cause severe droplet drift away from target foliage. Postpone spraying.`;
      sprayRecommendationHi = `तेज हवा (${cur.wind_speed} km/h) से दवा बह जाएगी। छिड़काव स्थगित करें।`;
    }

    // 3. Weather Risk & Agronomic Alerts
    const alerts = [];

    // Heat stress
    if (cur.temperature >= crop.heatStressThreshold) {
      alerts.push({
        id: 'heat_stress',
        type: 'danger',
        icon: 'temperature-high',
        title: `Heat Stress Warning for ${crop.name}`,
        title_hi: 'अत्यधिक तापमान चेतावनी',
        message: `Current temperature (${cur.temperature}°C) exceeds the ${crop.name} stress threshold (${crop.heatStressThreshold}°C). Risk of pollen desiccation and flower abortion during ${stage.label}. Keep micro-irrigation active or spray light water canopy mist.`,
        scientific_basis: `Thermal threshold for ${crop.name} is ${crop.heatStressThreshold}°C. High vapor pressure deficits cause stomatal closure and yield penalty.`
      });
    }

    // High Wind / Lodging Hazard
    if (cur.wind_gusts >= crop.lodgingWindThreshold) {
      alerts.push({
        id: 'lodging_hazard',
        type: 'warning',
        icon: 'wind',
        title: 'High Wind Gusts & Lodging Hazard',
        title_hi: 'तेज हवा और फसल गिरने का खतरा',
        message: `Wind gusts reached ${cur.wind_gusts} km/h (threshold: ${crop.lodgingWindThreshold} km/h). Tall canopy crops are at severe risk of stem lodging. Avoid irrigating fields before windstorms as wet soil loosens root anchorage.`,
        scientific_basis: 'Saturated soil decreases soil shear strength, increasing root lodging under dynamic aerodynamic wind load.'
      });
    }

    // Fungal Disease Micro-Climate Warning
    if (cur.humidity >= 78 && cur.temperature >= 20 && cur.temperature <= 29) {
      alerts.push({
        id: 'fungal_disease_risk',
        type: 'warning',
        icon: 'virus',
        title: 'Fungal Pathogen Sporulation Risk',
        title_hi: 'फफूंद रोग फैलने की अनुकूल परिस्थितियां',
        message: `Sustained high relative humidity (${cur.humidity}%) combined with mild temperatures (${cur.temperature}°C) creates optimum conditions for fungal spore germination (e.g. Blight in Tomato/Potato, Rust in Wheat). Inspect lower leaf surfaces.`,
        scientific_basis: 'Leaf wetness duration >6 hours at 20-28°C triggers conidial germination in Alternaria and Phytophthora pathogens.'
      });
    }

    // Heavy Rainfall Hazard
    if (rain48h >= 35.0) {
      alerts.push({
        id: 'heavy_rain',
        type: 'danger',
        icon: 'cloud-showers-heavy',
        title: 'Heavy Rainfall & Waterlogging Alert',
        title_hi: 'भारी बारिश और जलभराव चेतावनी',
        message: `Cumulative rainfall of ${rain48h} mm forecast over next 48 hours. Clear drainage channels, open plot bund outlets, and suspend all fertilizer application to avoid nutrient runoff.`,
        scientific_basis: 'Soil infiltration capacity will be exceeded, causing surface ponding and anaerobic root conditions.'
      });
    }

    // Sowing & Field Readiness
    let sowingReadiness = 'OPTIMAL';
    let sowingMsg = 'Soil temperature and moisture are supportive for field operations and seedbed preparation.';
    let sowingMsgHi = 'बुवाई और खेत की तैयारी के लिए मौसम और मिट्टी अनुकूल है।';

    if (rain48h > 20) {
      sowingReadiness = 'UNSUITABLE_WET';
      sowingMsg = 'Heavy rains will create muddy soil conditions. Delay tractor operations and direct drilling.';
      sowingMsgHi = 'बारिश के कारण खेत में कीचड़ हो सकता है। जुताई व बुवाई टालें।';
    } else if (ag.soil_temperature_0cm < 12) {
      sowingReadiness = 'COLD_SOIL';
      sowingMsg = 'Topsoil temperature (<12°C) is too cold; seed germination will be delayed. Wait for warmer afternoon soil.';
      sowingMsgHi = 'मिट्टी का तापमान कम है। बीज अंकुरण में देरी हो सकती है।';
    }

    return {
      disclaimer: 'Decision Support: Generated using FAO-56 Penman-Monteith crop coefficients and numerical weather predictions. Use alongside field observations and local KVK bulletins.',
      selected_crop: {
        key: cropKey.toLowerCase(),
        name: crop.name,
        family: crop.family,
        active_stage_key: activeStageKey,
        stage_label: stage.label,
        stage_description: stage.desc,
        crop_coefficient_kc: kc
      },
      crop_water_balance: {
        et0_reference_mm: et0,
        kc_coefficient: kc,
        etc_crop_water_need_mm_day: etc,
        root_zone_moisture_m3m3: soilMoistureVol,
        root_zone_moisture_pct: ag.root_zone_moisture_percentage,
        rainfall_next_48h_mm: rain48h,
        rainfall_next_72h_mm: rain72h
      },
      irrigation_guidance: {
        status: irrigationStatus,
        priority: irrigationPriority,
        action: irrigationAction,
        action_hi: irrigationActionHi,
        recommended_depth_mm: irrigationDepthMm,
        explanation: irrigationExplanation,
        metric_summary: `ETc: ${etc} mm/d | Soil: ${ag.root_zone_moisture_percentage}% | Rain 48h: ${rain48h} mm`
      },
      spray_window_advisory: {
        status: sprayStatus,
        best_window: bestSprayWindow,
        recommendation: sprayRecommendation,
        recommendation_hi: sprayRecommendationHi,
        safe_hours_count: spraySafeHours
      },
      sowing_field_readiness: {
        status: sowingReadiness,
        guidance: sowingMsg,
        guidance_hi: sowingMsgHi
      },
      active_alerts: alerts
    };
  }

  /**
   * Connects Weather Intelligence with official AGMARKNET 2.0 Market Prices.
   * Compares local vs nearby regional mandi modal rates and net transport profit.
   */
  async getMarketPriceComparison(cropName, state = 'Maharashtra', district = 'Nagpur') {
    try {
      const commodityName = this.normalizeCropToCommodity(cropName);
      const mandiData = await marketService.getDailyMarketPrices({ commodity: commodityName });
      
      let records = mandiData && Array.isArray(mandiData.records) ? mandiData.records : [];
      
      // If we have records, filter to state/district if matching records exist
      if (records.length > 0) {
        const stateFiltered = records.filter(r => r.state && r.state.toLowerCase().includes(state.toLowerCase()));
        if (stateFiltered.length > 0) {
          const distFiltered = stateFiltered.filter(r => r.district && r.district.toLowerCase().includes(district.toLowerCase()));
          records = distFiltered.length > 0 ? distFiltered : stateFiltered;
        }
      }
      
      if (records.length === 0) {
        return {
          available: false,
          source: 'AGMARKNET 2.0 / GoI Official Mandi Platform',
          commodity: commodityName,
          state,
          district,
          message: `No active auction price reported today for ${commodityName} in ${district}. Checking regional records.`,
          nearby_mandis: []
        };
      }

      // Compute indicative transport cost (assumes average lead 30-65 km, diesel freight ₹40-60/quintal)
      const nearbyMandis = records.slice(0, 4).map((rec, idx) => {
        const modalPrice = parseFloat(rec.modal_price) || 0;
        const estDistanceKm = idx === 0 ? 15 : (25 + idx * 18);
        const transportCostPerQtl = Math.round(estDistanceKm * 1.1 + 25); // ₹/quintal
        const netRealization = modalPrice > 0 ? (modalPrice - transportCostPerQtl) : 0;

        return {
          market_name: rec.market || `${district} Mandi`,
          district: rec.district || district,
          state: rec.state || state,
          modal_price: modalPrice,
          min_price: parseFloat(rec.min_price) || modalPrice,
          max_price: parseFloat(rec.max_price) || modalPrice,
          arrival_date: rec.arrival_date || new Date().toISOString().split('T')[0],
          estimated_distance_km: estDistanceKm,
          estimated_freight_per_qtl: transportCostPerQtl,
          net_realization_per_qtl: netRealization,
          is_highest_net: false
        };
      });

      // Highlight best net realization market
      let highestNet = 0;
      let highestIdx = 0;
      nearbyMandis.forEach((m, i) => {
        if (m.net_realization_per_qtl > highestNet) {
          highestNet = m.net_realization_per_qtl;
          highestIdx = i;
        }
      });
      if (nearbyMandis[highestIdx]) {
        nearbyMandis[highestIdx].is_highest_net = true;
      }

      return {
        available: true,
        source: 'Official AGMARKNET 2.0 (Ministry of Agriculture & Farmers Welfare, GoI)',
        update_frequency: 'Daily post-auction closing (not real-time continuous)',
        commodity: commodityName,
        state,
        district,
        best_market: nearbyMandis[highestIdx] ? nearbyMandis[highestIdx].market_name : district,
        best_net_price: highestNet,
        nearby_mandis: nearbyMandis
      };
    } catch (err) {
      console.warn('Market price integration notice:', err.message);
      return {
        available: false,
        source: 'AGMARKNET 2.0',
        commodity: cropName,
        message: 'Mandi price service momentarily busy.',
        nearby_mandis: []
      };
    }
  }

  normalizeCropToCommodity(cropKey) {
    const map = {
      wheat: 'Wheat',
      paddy: 'Rice',
      rice: 'Rice',
      tomato: 'Tomato',
      cotton: 'Cotton',
      potato: 'Potato',
      maize: 'Maize',
      mustard: 'Mustard',
      soybean: 'Soyabean'
    };
    return map[cropKey.toLowerCase()] || 'Wheat';
  }
}

module.exports = new WeatherIntelligenceService();

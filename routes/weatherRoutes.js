const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherIntelligenceService');

/**
 * Main Agricultural Weather & Intelligence Dashboard Route
 */
router.get(['/farmer/weather', '/weather', '/farmer/weather.php'], async (req, res) => {
  // Allow viewing for authenticated farmers, guests, and customers
  const user = req.session || {};
  
  const queryLat = req.query.lat ? parseFloat(req.query.lat) : null;
  const queryLon = req.query.lon ? parseFloat(req.query.lon) : null;
  const queryCity = req.query.city ? req.query.city.trim() : null;
  const selectedCrop = (req.query.crop || 'wheat').toLowerCase();
  const selectedStage = req.query.stage || null;

  let initialLocation = {
    village: 'Nagpur Central Farm',
    town: 'Nagpur',
    district: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
    latitude: 21.1458,
    longitude: 79.0882,
    formatted_address: 'Nagpur, Maharashtra, India',
    is_gps: false
  };

  try {
    if (queryLat && queryLon && !isNaN(queryLat) && !isNaN(queryLon)) {
      const geo = await weatherService.reverseGeocode(queryLat, queryLon);
      initialLocation = { ...geo, is_gps: true };
    } else if (queryCity) {
      const searchResults = await weatherService.searchLocation(queryCity);
      if (searchResults && searchResults.length > 0) {
        const top = searchResults[0];
        initialLocation = {
          village: top.name,
          town: top.name,
          district: top.district || top.name,
          state: top.state || 'India',
          country: 'India',
          latitude: top.lat,
          longitude: top.lon,
          formatted_address: `${top.name}, ${top.state}`,
          is_gps: false
        };
      }
    }

    // Retrieve weather data
    const weatherData = await weatherService.getWeatherData({
      lat: initialLocation.latitude,
      lon: initialLocation.longitude,
      state: initialLocation.state,
      district: initialLocation.district,
      town: initialLocation.town
    });

    // Generate agricultural intelligence
    const intelligence = weatherService.generateAgriculturalIntelligence(
      weatherData,
      selectedCrop,
      selectedStage
    );

    // Fetch market price comparisons
    const market = await weatherService.getMarketPriceComparison(
      selectedCrop,
      initialLocation.state,
      initialLocation.district
    );

    res.render('farmer/weather', {
      page_title: 'Agricultural Weather & Intelligence',
      user,
      initialLocation,
      weather: weatherData,
      intelligence,
      market,
      cropDatabase: weatherService.cropDatabase,
      districtDirectory: weatherService.districtDirectory,
      selectedCrop,
      selectedStage: intelligence.selected_crop.active_stage_key
    });
  } catch (err) {
    console.error('Error rendering weather dashboard:', err.message);
    res.status(500).render('error', {
      message: 'Agricultural Weather service is momentarily busy. Please try again shortly.',
      user
    });
  }
});

/**
 * Dynamic JSON API for Weather & Agricultural Intelligence
 */
router.get('/api/weather/intelligence', async (req, res) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat) : null;
    const lon = req.query.lon ? parseFloat(req.query.lon) : null;
    const city = req.query.city ? req.query.city.trim() : null;
    const crop = (req.query.crop || 'wheat').toLowerCase();
    const stage = req.query.stage || null;

    let targetLocation = {
      latitude: lat || 21.1458,
      longitude: lon || 79.0882,
      state: req.query.state || 'Maharashtra',
      district: req.query.district || 'Nagpur',
      town: req.query.town || 'Nagpur'
    };

    if (lat && lon && (!req.query.district || !req.query.state)) {
      const geo = await weatherService.reverseGeocode(lat, lon);
      targetLocation = { ...targetLocation, ...geo };
    } else if (city && (!lat || !lon)) {
      const results = await weatherService.searchLocation(city);
      if (results && results.length > 0) {
        const top = results[0];
        targetLocation = {
          latitude: top.lat,
          longitude: top.lon,
          state: top.state,
          district: top.district,
          town: top.name,
          formatted_address: `${top.name}, ${top.state}`
        };
      }
    }

    const weatherData = await weatherService.getWeatherData({
      lat: targetLocation.latitude,
      lon: targetLocation.longitude,
      state: targetLocation.state,
      district: targetLocation.district,
      town: targetLocation.town
    });

    const intelligence = weatherService.generateAgriculturalIntelligence(weatherData, crop, stage);

    const market = await weatherService.getMarketPriceComparison(
      crop,
      targetLocation.state,
      targetLocation.district
    );

    res.json({
      success: true,
      location: targetLocation,
      weather: weatherData,
      intelligence,
      market
    });
  } catch (err) {
    console.error('API /api/weather/intelligence error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve agricultural weather intelligence'
    });
  }
});

/**
 * Reverse Geocoding API: GPS Lat/Lon -> Indian Address Details
 */
router.get('/api/weather/geocode', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ success: false, message: 'Valid lat and lon are required' });
    }

    const result = await weatherService.reverseGeocode(lat, lon);
    res.json({ success: true, location: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * City / District Search Suggestions API
 */
router.get('/api/weather/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const results = await weatherService.searchLocation(query);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, results: [] });
  }
});

/**
 * Crop Catalogs and Stages API
 */
router.get('/api/weather/crops', (req, res) => {
  res.json({
    success: true,
    crops: weatherService.cropDatabase
  });
});

module.exports = router;

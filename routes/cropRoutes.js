/**
 * AgroHaat Hybrid AI Crop Recommendation Routes
 * Implements the 5-layer Hybrid Multi-Criteria Decision Model from the research paper:
 * "Hybrid AI-Driven Crop Recommendation Model Based on Soil Nutrient Analysis 
 *  and Weather-Driven Environmental Factors"
 */

const express = require('express');
const router = express.Router();
const cropService = require('../services/cropRecommendationService');
const soilService = require('../services/soilIntelligenceService');

// Middleware to ensure farmer authentication
function requireFarmer(req, res, next) {
  if (!req.session || !req.session.user_id || req.session.role !== 'Farmer') {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please login as a farmer.' });
    }
    return res.redirect('/login');
  }
  next();
}

/**
 * Render Hybrid Crop Recommendation Dashboard
 */
router.get(['/farmer/crop_recommendation', '/farmer/crop_recommendation.php'], requireFarmer, async (req, res) => {
  const farmerId = req.session.user_id;

  try {
    const [history, savedPlots] = await Promise.all([
      cropService.getFarmerRecommendationHistory(farmerId, 6).catch(() => []),
      soilService.getFarmerPlots(farmerId).catch(() => [])
    ]);

    const regionHierarchy = soilService.getRegionHierarchy();
    const cropDatabase = cropService.getCropDatabase();

    res.render('farmer/crop_recommendation', {
      user: req.session,
      history,
      savedPlots,
      regionHierarchy,
      cropDatabase
    });
  } catch (err) {
    console.error('Error rendering crop_recommendation:', err);
    res.render('farmer/crop_recommendation', {
      user: req.session,
      history: [],
      savedPlots: [],
      regionHierarchy: soilService.getRegionHierarchy(),
      cropDatabase: cropService.getCropDatabase(),
      errorMessage: 'System delay loading saved profiles.'
    });
  }
});

/**
 * API: Run 5-Layer Hybrid Crop Recommendation
 */
router.post('/api/crop/recommend', requireFarmer, async (req, res) => {
  const farmerId = req.session.user_id;
  const {
    n_value,
    p_value,
    k_value,
    ph_value,
    nitrogen,
    phosphorus,
    potassium,
    ph: input_ph,
    soil_type,
    season,
    state,
    district,
    village,
    latitude,
    longitude,
    lat,
    lon,
    irrigation_type
  } = req.body;

  // Validation
  const n = parseFloat(n_value !== undefined ? n_value : nitrogen);
  const p = parseFloat(p_value !== undefined ? p_value : phosphorus);
  const k = parseFloat(k_value !== undefined ? k_value : potassium);
  const ph = parseFloat(ph_value !== undefined ? ph_value : input_ph);
  const finalLat = parseFloat(latitude !== undefined ? latitude : lat);
  const finalLon = parseFloat(longitude !== undefined ? longitude : lon);

  if (isNaN(n) || isNaN(p) || isNaN(k) || isNaN(ph)) {
    return res.status(400).json({
      success: false,
      error: 'Please enter valid numerical values for Nitrogen (N), Phosphorus (P), Potassium (K), and Soil pH.'
    });
  }

  if (ph < 3.0 || ph > 11.0) {
    return res.status(400).json({
      success: false,
      error: `Soil pH (${ph}) must be within the realistic agricultural range of 3.0 to 11.0.`
    });
  }

  try {
    const recommendation = await cropService.recommendCrops({
      n_value: n,
      p_value: p,
      k_value: k,
      ph_value: ph,
      soil_type: soil_type || 'Loamy Soil',
      season: season || 'Rabi',
      state: state || 'Uttar Pradesh',
      district: district || 'Lucknow',
      village: village || 'Village',
      latitude: !isNaN(finalLat) ? finalLat : 26.8467,
      longitude: !isNaN(finalLon) ? finalLon : 80.9462,
      irrigation_type: irrigation_type || 'Canal / Irrigated'
    });

    // Persist recommendation in DB
    let recordId = null;
    try {
      recordId = await cropService.saveRecommendationRecord(farmerId, req.body, recommendation);
    } catch (saveErr) {
      console.warn('Could not persist crop recommendation record:', saveErr.message);
    }

    res.json({
      success: true,
      record_id: recordId,
      ...recommendation
    });
  } catch (err) {
    console.error('Crop recommendation engine error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'An error occurred during multi-criteria crop evaluation.'
    });
  }
});

/**
 * Backward compatibility with legacy /actions/log_ai_action.php
 */
router.post('/actions/log_ai_action.php', async (req, res) => {
  const farmerId = req.session?.user_id || 0;
  const soil = req.body.soil || 'Alluvial Soil';
  const season = req.body.season || 'Rabi';
  const location = req.body.location || 'Nagpur, Maharashtra';

  // Normalize soil
  let soilNorm = 'Loamy Soil';
  if (soil.toLowerCase().includes('black')) soilNorm = 'Black Cotton Soil';
  else if (soil.toLowerCase().includes('alluvial')) soilNorm = 'Alluvial Soil';
  else if (soil.toLowerCase().includes('sandy')) soilNorm = 'Sandy Loam';
  else if (soil.toLowerCase().includes('clay')) soilNorm = 'Clay Loam';
  else if (soil.toLowerCase().includes('red') || soil.toLowerCase().includes('laterite')) soilNorm = 'Red / Laterite';

  // Parse location
  let state = 'Maharashtra';
  let district = 'Nagpur';
  if (location.includes(',')) {
    const parts = location.split(',');
    district = parts[0].trim();
    state = parts[1].trim();
  }

  try {
    const recommendation = await cropService.recommendCrops({
      n_value: 220,
      p_value: 18,
      k_value: 190,
      ph_value: 6.8,
      soil_type: soilNorm,
      season: season,
      state: state,
      district: district,
      village: 'Local Area'
    });

    const primary = recommendation.primary_recommendation;
    res.json({
      success: true,
      crop: `${primary.name_en} (${primary.name_hi})`,
      why: primary.reasons_en[0] || 'Optimal soil, weather and regional conditions.',
      severity: `Suitability Score: ${primary.composite_score}/100`,
      treatment: primary.warnings_en.length > 0 ? primary.warnings_en[0] : 'Follow standard fertilizer schedule.',
      quantity: 'Refer to soil test fertilizer schedule',
      how: primary.agronomic_advice.en,
      when: `Ideal for ${season} season cultivation`,
      prevention: 'Apply recommended bio-fertilizers and preventive pest controls.',
      full_report: recommendation
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;

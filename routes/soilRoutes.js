/**
 * AgroHaat Soil Health Routes
 * Handles farm location, plots, soil test input validation,
 * ICAR-STCR rule-based assessment, Groq AI explanation, and bilingual reporting.
 */

const express = require('express');
const router = express.Router();
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
 * Render Main Upgraded Soil Health Analysis & Reporting Dashboard
 */
router.get(['/farmer/soil_analysis', '/farmer/soil_analysis.php'], requireFarmer, async (req, res) => {
  const farmerId = req.session.user_id;

  try {
    const [savedPlots, history] = await Promise.all([
      soilService.getFarmerPlots(farmerId).catch(() => []),
      soilService.getFarmerSoilHistory(farmerId, 10).catch(() => [])
    ]);

    const cropCatalog = soilService.getCropCatalog();
    const regionHierarchy = soilService.getRegionHierarchy();
    const shcStatus = soilService.getShcApiStatus();

    res.render('farmer/soil_analysis', {
      user: req.session,
      savedPlots,
      history,
      cropCatalog,
      regionHierarchy,
      shcStatus
    });
  } catch (err) {
    console.error('Error rendering soil_analysis view:', err);
    res.render('farmer/soil_analysis', {
      user: req.session,
      savedPlots: [],
      history: [],
      cropCatalog: soilService.getCropCatalog(),
      regionHierarchy: soilService.getRegionHierarchy(),
      shcStatus: soilService.getShcApiStatus(),
      errorMessage: 'Database connection delay. Some historical records may be temporarily unavailable.'
    });
  }
});

/**
 * Reverse Geocode GPS Coordinates to State, District, Block, Village
 */
router.post('/api/soil/reverse-geocode', async (req, res) => {
  const { latitude, longitude } = req.body;
  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, error: 'Latitude and longitude are required.' });
  }

  try {
    const locationData = await soilService.reverseGeocode(latitude, longitude);
    res.json(locationData);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to reverse geocode coordinates.' });
  }
});

/**
 * Save New Farm Plot
 */
router.post('/api/soil/plots', requireFarmer, async (req, res) => {
  const farmerId = req.session.user_id;
  const { plot_name, survey_number, area_acres, state, district, block_tehsil, village, latitude, longitude, soil_type } = req.body;

  if (!plot_name || !state || !district) {
    return res.status(400).json({ success: false, error: 'Plot name, State, and District are required.' });
  }

  try {
    const saved = await soilService.savePlot(farmerId, {
      plot_name,
      survey_number,
      area_acres,
      state,
      district,
      block_tehsil,
      village,
      latitude,
      longitude,
      soil_type
    });
    res.json({ success: true, plot: saved });
  } catch (err) {
    console.error('Error saving plot:', err);
    res.status(500).json({ success: false, error: 'Could not save plot profile to database.' });
  }
});

/**
 * Get Saved Farm Plots
 */
router.get('/api/soil/plots', requireFarmer, async (req, res) => {
  const farmerId = req.session.user_id;
  try {
    const plots = await soilService.getFarmerPlots(farmerId);
    res.json({ success: true, plots });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch saved plots.' });
  }
});

/**
 * Run Comprehensive Soil Analysis, Fertilizer Calculation & AI Explanation
 */
router.post('/api/soil/analyze', requireFarmer, async (req, res) => {
  const farmerId = req.session.user_id;

  // 1. Validate inputs strictly
  const validation = soilService.validateInputs(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors
    });
  }

  try {
    // 2. Run deterministic ICAR-STCR assessment
    const assessment = soilService.assessSoil(validation.normalized);

    // 3. Generate AI narrative explanation (Groq LLM)
    const aiExplanation = await soilService.generateAiExplanation(assessment);

    // 4. Persist to database
    let recordId = null;
    try {
      recordId = await soilService.saveSoilRecord(farmerId, validation.normalized, assessment, aiExplanation);
    } catch (dbErr) {
      console.warn('Could not persist soil record to DB:', dbErr.message);
    }

    res.json({
      success: true,
      record_id: recordId,
      assessment,
      ai_explanation: aiExplanation
    });
  } catch (err) {
    console.error('Error in /api/soil/analyze:', err);
    res.status(500).json({ success: false, error: 'Internal soil assessment engine error: ' + err.message });
  }
});

/**
 * Retrieve Full Saved Soil Report by Record ID
 */
router.get('/api/soil/record/:id', requireFarmer, async (req, res) => {
  const farmerId = req.session.user_id;
  const recordId = parseInt(req.params.id, 10);

  if (isNaN(recordId)) {
    return res.status(400).json({ success: false, error: 'Invalid record ID.' });
  }

  try {
    const record = await soilService.getSoilRecordById(recordId, farmerId);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Soil report not found.' });
    }
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve soil report.' });
  }
});

/**
 * Official Soil Health Card (SHC) API Integration Status & Disclosure
 */
router.get('/api/soil/shc-status', (req, res) => {
  res.json({
    success: true,
    shc_status: soilService.getShcApiStatus()
  });
});

/**
 * Backward compatibility with legacy /actions/soil_ai_action.php
 */
router.post('/actions/soil_ai_action.php', async (req, res) => {
  const farmerId = req.session?.user_id || 1;
  const raw = {
    n_value: req.body.n,
    n_unit: 'kg/ha',
    p_value: req.body.p,
    p_unit: 'kg/ha',
    k_value: req.body.k,
    k_unit: 'kg/ha',
    ph_value: req.body.ph,
    crop_name: req.body.crop || 'Wheat',
    data_source: 'Manual Test Entry'
  };

  const validation = soilService.validateInputs(raw);
  if (!validation.isValid) {
    return res.json({ success: false, error: validation.errors.join(', ') });
  }

  try {
    const assessment = soilService.assessSoil(validation.normalized);
    const aiExplanation = await soilService.generateAiExplanation(assessment);
    
    // Legacy format compatibility
    res.json({
      success: true,
      status: assessment.fertility_index.rating_en,
      why: aiExplanation.summary_en || assessment.nutrients.n.reason_en,
      severity: assessment.nutrients.n.classification === 'Low' ? 'High N Deficiency' : 'Low Deficiency Risk',
      fertilizer: assessment.fertilizer_recommendations.commercial_products_per_acre.map(p => p.product_en).join(' + '),
      quantity: assessment.fertilizer_recommendations.commercial_products_per_acre.map(p => `${p.product_en}: ${p.quantity_kg} kg/acre`).join(', '),
      how: assessment.fertilizer_recommendations.commercial_products_per_acre[0].stage_en,
      when: '15-20 days before and at sowing',
      prevention: 'Apply green manure or vermicompost regularly',
      n: assessment.nutrients.n.value_kg_ha,
      p: assessment.nutrients.p.value_kg_ha,
      k: assessment.nutrients.k.value_kg_ha,
      full_report: assessment,
      ai_explanation: aiExplanation
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;

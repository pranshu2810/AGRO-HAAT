/**
 * AgroHaat Hybrid AI-Driven Crop Recommendation Service
 * 
 * Based on the Research Paper Methodology:
 * "Hybrid AI-Driven Crop Recommendation Model Based on Soil Nutrient Analysis 
 *  and Weather-Driven Environmental Factors"
 * 
 * 5-Layer Hybrid Decision-Support Pipeline (Deterministic, Non-ML):
 * Layer 1: Soil Nutrient Analysis (N, P, K, pH against configurable crop reference ranges)
 * Layer 2: Contextual Filtering (Season, Soil Texture, Regional Compatibility)
 * Layer 3: Weather Integration (Live Temperature, Humidity, Rainfall from Open-Meteo & IMD)
 * Layer 4: Regional Profitability (Agmarknet 2.0 GoI Mandi Prices; strictly non-fabricated)
 * Layer 5: Composite Multi-Criteria Ranking (Transparent weighted scoring & primary crop selection)
 * 
 * Completely Bilingual (English & Hindi) output.
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const weatherService = require('./weatherIntelligenceService');
const marketService = require('./marketIntelligenceService');

// Load configurable crop reference database
let CROP_DATABASE = {};
try {
  const dbPath = path.join(__dirname, '../data/crop_reference_database.json');
  CROP_DATABASE = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
} catch (err) {
  console.error('Error loading crop_reference_database.json:', err.message);
}

class CropRecommendationService {
  constructor() {
    this.cropDatabase = CROP_DATABASE;
  }

  getCropDatabase() {
    return this.cropDatabase;
  }

  /**
   * Helper: Bounded trapezoidal / linear membership function
   * Evaluates suitability of measured value against [min, opt_min, opt_max, max]
   */
  calculateSuitability(val, range) {
    const { min, opt_min, opt_max, max } = range;
    if (val === undefined || val === null || isNaN(val)) return 0.5;

    // Ideal range
    if (val >= opt_min && val <= opt_max) {
      return 1.0;
    }

    // Between min and opt_min
    if (val >= min && val < opt_min) {
      if (opt_min === min) return 1.0;
      return 0.5 + 0.5 * ((val - min) / (opt_min - min));
    }

    // Between opt_max and max
    if (val > opt_max && val <= max) {
      if (max === opt_max) return 1.0;
      return 1.0 - 0.5 * ((val - opt_max) / (max - opt_max));
    }

    // Below minimum permissible
    if (val < min) {
      const deficit = min - val;
      return Math.max(0.1, 0.5 - (deficit / (min || 1)) * 0.4);
    }

    // Above maximum permissible
    if (val > max) {
      const excess = val - max;
      return Math.max(0.1, 0.5 - (excess / (max || 1)) * 0.4);
    }

    return 0.5;
  }

  /**
   * Layer 1: Soil Nutrient Suitability Analysis
   */
  evaluateSoilNutrients(crop, soilData) {
    const { n, p, k, ph } = soilData;
    const ref = crop.soil_nutrients;

    const muN = this.calculateSuitability(n, ref.n_range);
    const muP = this.calculateSuitability(p, ref.p_range);
    const muK = this.calculateSuitability(k, ref.k_range);
    const muPh = this.calculateSuitability(ph, ref.ph_range);

    // Weighted soil nutrient score: pH(30%), N(25%), P(25%), K(20%)
    const soilScore = Math.round((0.25 * muN + 0.25 * muP + 0.20 * muK + 0.30 * muPh) * 100);

    const reasons_en = [];
    const reasons_hi = [];
    const warnings_en = [];
    const warnings_hi = [];

    // N check
    if (n < ref.n_range.min) {
      warnings_en.push(`Nitrogen (${n} kg/ha) is deficient for ${crop.name_en} (optimal: ${ref.n_range.opt_min}-${ref.n_range.opt_max} kg/ha). Supplementary basal Urea or compost required.`);
      warnings_hi.push(`नत्रजन (${n} किग्रा/हे.) ${crop.name_hi} के लिए कम है (अनुकूल: ${ref.n_range.opt_min}-${ref.n_range.opt_max})। अतिरिक्त यूरिया या कम्पोस्ट की आवश्यकता होगी।`);
    } else if (n >= ref.n_range.opt_min && n <= ref.n_range.opt_max) {
      reasons_en.push(`Soil available Nitrogen (${n} kg/ha) is in the optimal range (${ref.n_range.opt_min}-${ref.n_range.opt_max} kg/ha).`);
      reasons_hi.push(`मिट्टी में उपलब्ध नत्रजन (${n} किग्रा/हे.) अनुकूल श्रेणी में है।`);
    }

    // P check
    if (p < ref.p_range.min) {
      warnings_en.push(`Phosphorus (${p} kg/ha) is low; seed placement of DAP/SSP will be necessary.`);
      warnings_hi.push(`फास्फोरस (${p} किग्रा/हे.) कम है; बुवाई के समय डीएपी/एसएसपी देना अनिवार्य होगा।`);
    } else if (p >= ref.p_range.opt_min && p <= ref.p_range.opt_max) {
      reasons_en.push(`Soil available Phosphorus (${p} kg/ha) promotes strong root growth.`);
      reasons_hi.push(`उपलब्ध फास्फोरस (${p} किग्रा/हे.) जड़ों के मजबूत विकास हेतु उत्तम है।`);
    }

    // K check
    if (k < ref.k_range.min) {
      warnings_en.push(`Potassium (${k} kg/ha) is low; apply MOP to protect stalk strength and disease resistance.`);
      warnings_hi.push(`पोटाश (${k} किग्रा/हे.) कम है; तने की मजबूती व रोग प्रतिरोधक क्षमता हेतु म्यूरेट ऑफ पोटाश डालें।`);
    }

    // pH check
    if (ph < ref.ph_range.min) {
      warnings_en.push(`Soil pH (${ph}) is too acidic for ${crop.name_en} (tolerable: ${ref.ph_range.min}-${ref.ph_range.max}). Apply Agricultural Lime (CaCO3) prior to sowing.`);
      warnings_hi.push(`मृदा पीएच (${ph}) इस फसल के लिए अधिक अम्लीय है। बुवाई से पहले कृषि चूने का उपचार करें।`);
    } else if (ph > ref.ph_range.max) {
      warnings_en.push(`Soil pH (${ph}) is too alkaline/calcareous for ${crop.name_en}. Gypsum application or foliar zinc sprays recommended.`);
      warnings_hi.push(`मृदा पीएच (${ph}) अधिक क्षारीय है। जिप्सम उपचार या जिंक का पर्णीय छिड़काव करें।`);
    } else {
      reasons_en.push(`Soil pH (${ph}) is favorable for nutrient uptake in ${crop.name_en}.`);
      reasons_hi.push(`मृदा पीएच (${ph}) पोषक तत्वों के अवशोषण के लिए अनुकूल है।`);
    }

    return {
      score: soilScore,
      memberships: {
        n: Math.round(muN * 100) / 100,
        p: Math.round(muP * 100) / 100,
        k: Math.round(muK * 100) / 100,
        ph: Math.round(muPh * 100) / 100
      },
      reasons_en,
      reasons_hi,
      warnings_en,
      warnings_hi
    };
  }

  /**
   * Layer 2: Contextual Filtering (Season, Soil Texture, Regional Compatibility)
   */
  evaluateContext(crop, contextData) {
    const { season, soil_type, state } = contextData;
    let seasonScore = 0;
    let soilScore = 0;
    let eligible = true;
    let disqualification_reason = null;

    // 1. Season constraint
    if (crop.primary_season.includes(season)) {
      seasonScore = 100;
    } else {
      // Crop is not grown in this season
      seasonScore = 0;
      eligible = false;
      disqualification_reason = `Out of season (Primary season: ${crop.primary_season.join(', ')})`;
    }

    // 2. Soil texture compatibility
    if (crop.compatible_soils.includes(soil_type)) {
      soilScore = 100;
    } else {
      // Partial compatibility for versatile loams
      if (soil_type.includes('Loam') || soil_type === 'Alluvial Soil') {
        soilScore = 65;
      } else {
        soilScore = 35;
      }
    }

    const contextScore = eligible ? Math.round(0.60 * seasonScore + 0.40 * soilScore) : 0;

    return {
      eligible,
      score: contextScore,
      season_match: seasonScore === 100,
      soil_match: soilScore === 100,
      soil_score: soilScore,
      disqualification_reason
    };
  }

  /**
   * Layer 3: Weather Integration
   */
  evaluateWeather(crop, weatherData, irrigationType) {
    if (!weatherData || !weatherData.observed) {
      return {
        score: 70, // Default neutral baseline if weather API completely unavailable
        isAvailable: false,
        source: 'Weather Service Offline (Regional Normals)',
        timestamp: new Date().toLocaleString('en-IN'),
        temperature_c: 24,
        humidity_pct: 60,
        weather_description: 'Regional Average Norms',
        reasons_en: ['Weather service unavailable; scored against historical regional normals.'],
        reasons_hi: ['मौसम सेवा अनुपलब्ध; क्षेत्रीय औसत मानकों के आधार पर गणना की गई।'],
        warnings_en: [],
        warnings_hi: []
      };
    }

    const obs = weatherData.observed;
    const temp = obs.temperature !== undefined ? obs.temperature : (obs.temp !== undefined ? obs.temp : 25);
    const rh = obs.relativeHumidity !== undefined ? obs.relativeHumidity : (obs.humidity !== undefined ? obs.humidity : 60);
    const precip = obs.precipitation !== undefined ? obs.precipitation : (obs.precip_rate !== undefined ? obs.precip_rate : 0);
    const ref = crop.weather_tolerance;

    const muTemp = this.calculateSuitability(temp, ref.temp_range);
    const muRh = this.calculateSuitability(rh, ref.humidity_range);

    // Rainfall / Moisture feasibility
    let muRain = 1.0;
    const isIrrigated = irrigationType && !irrigationType.toLowerCase().includes('rainfed');

    if (!isIrrigated) {
      // In rainfed, rainfall is crucial
      if (precip < 2 && ref.seasonal_rainfall.min > 100) {
        muRain = 0.50; // Rainfed with low moisture
      } else {
        muRain = 0.80;
      }
    } else {
      // Irrigation compensates for rainfall deficits
      muRain = 0.95;
    }

    const weatherScore = Math.round((0.45 * muTemp + 0.25 * muRh + 0.30 * muRain) * 100);

    const reasons_en = [];
    const reasons_hi = [];
    const warnings_en = [];
    const warnings_hi = [];

    if (temp >= ref.temp_range.opt_min && temp <= ref.temp_range.opt_max) {
      reasons_en.push(`Observed ambient temperature (${temp}°C) is ideal for ${crop.name_en} growth (${ref.temp_range.opt_min}-${ref.temp_range.opt_max}°C).`);
      reasons_hi.push(`वर्तमान तापमान (${temp}°C) ${crop.name_hi} की वृद्धि के लिए अनुकूल है।`);
    } else if (temp > ref.temp_range.max) {
      warnings_en.push(`High temperature (${temp}°C) exceeds optimal threshold (${ref.temp_range.max}°C). Monitor heat stress and schedule frequent irrigations.`);
      warnings_hi.push(`तापमान (${temp}°C) अधिक है। गर्मी के तनाव से बचाव हेतु हल्की सिंचाई करें।`);
    } else if (temp < ref.temp_range.min) {
      warnings_en.push(`Low ambient temperature (${temp}°C) may slow germination.`);
      warnings_hi.push(`कम तापमान (${temp}°C) से अंकुरण धीमा हो सकता है।`);
    }

    if (rh > ref.humidity_range.max) {
      warnings_en.push(`High relative humidity (${rh}%) elevates risk of fungal pathogens and foliar blights.`);
      warnings_hi.push(`अधिक नमी (${rh}%) से फफूंद व झुलसा रोग का खतरा बढ़ सकता है।`);
    }

    return {
      score: weatherScore,
      isAvailable: true,
      source: weatherData.source || weatherData.provider || 'Open-Meteo & IMD Agricultural API',
      timestamp: obs.observedAt || obs.observed_time || weatherData.observed_time_display || new Date().toLocaleString('en-IN'),
      temperature_c: temp,
      humidity_pct: rh,
      weather_description: obs.weatherDescription || obs.condition || 'Fair',
      reasons_en,
      reasons_hi,
      warnings_en,
      warnings_hi
    };
  }

  /**
   * Layer 4: Regional Profitability (Market Intelligence)
   * Strictly non-fabricated. Marks as unavailable if no verified live mandi data exists.
   */
  async evaluateMarket(crop, state, district) {
    const commodityName = crop.market_commodity_name;
    
    try {
      // Attempt to fetch live/cached mandi prices from Agmarknet
      const trendData = await marketService.getCommodityTrend(commodityName, state).catch(() => null);

      if (trendData && trendData.success && trendData.trend && trendData.trend.length > 0) {
        const latestPoint = trendData.trend[trendData.trend.length - 1];
        const modalPrice = latestPoint.modal_price || latestPoint.price || 0;

        if (modalPrice > 0) {
          const expectedGrossRev = (modalPrice * crop.typical_yield_q_ha);
          const estNetMargin = expectedGrossRev - crop.cost_of_cultivation_inr_ha;
          
          // Normalized market score between 40 and 100 based on net margin
          let marketScore = 70;
          if (estNetMargin > 60000) marketScore = 95;
          else if (estNetMargin > 40000) marketScore = 85;
          else if (estNetMargin > 20000) marketScore = 75;
          else if (estNetMargin > 0) marketScore = 60;
          else marketScore = 45;

          return {
            isAvailable: true,
            score: marketScore,
            modal_price_q: modalPrice,
            mandi_name: latestPoint.market || `${state} Mandi`,
            price_date: latestPoint.date || new Date().toISOString().split('T')[0],
            data_source: 'Agmarknet 2.0 (Directorate of Marketing & Inspection, GoI)',
            estimated_gross_revenue_ha: expectedGrossRev,
            estimated_net_margin_ha: estNetMargin,
            reasons_en: [`Verified Agmarknet mandi modal price: ₹${modalPrice}/quintal at ${latestPoint.market || state}. Projected gross return: ₹${expectedGrossRev.toLocaleString('en-IN')}/ha.`],
            reasons_hi: [`सत्यापित एगमार्कनेट मंडी भाव: ₹${modalPrice}/क्विंटल। अनुमानित कुल आय: ₹${expectedGrossRev.toLocaleString('en-IN')}/हेक्टेयर।`]
          };
        }
      }
    } catch (err) {
      // Graceful fallback to unavailable
    }

    // Market data unavailable: clearly disclose without fabrication
    return {
      isAvailable: false,
      score: null,
      modal_price_q: null,
      mandi_name: null,
      price_date: null,
      data_source: 'Agmarknet 2.0 Mandi Feed Unavailable for selected commodity/region',
      reasons_en: ['Verified live mandi price currently unavailable. Profitability score omitted to prevent data fabrication.'],
      reasons_hi: ['मंडी भाव डेटा वर्तमान में उपलब्ध नहीं है। पारदर्शिता बनाए रखने हेतु बाजार स्कोर को गणना से अलग रखा गया है।']
    };
  }

  /**
   * Layer 5: Composite Multi-Criteria Ranking Engine
   */
  async recommendCrops(inputData) {
    const {
      n_value,
      p_value,
      k_value,
      ph_value,
      soil_type,
      season,
      state,
      district,
      village,
      latitude,
      longitude,
      irrigation_type
    } = inputData;

    // Validate inputs
    const n = parseFloat(n_value);
    const p = parseFloat(p_value);
    const k = parseFloat(k_value);
    const ph = parseFloat(ph_value);

    if (isNaN(n) || isNaN(p) || isNaN(k) || isNaN(ph)) {
      throw new Error('Valid numeric values are required for N, P, K, and pH.');
    }

    const soilData = { n, p, k, ph };
    const contextData = {
      season: season || 'Rabi',
      soil_type: soil_type || 'Loamy Soil',
      state: state || 'Uttar Pradesh',
      district: district || 'Lucknow',
      village: village || 'Village'
    };

    // 1. Fetch live agricultural weather
    let weatherData = null;
    const lat = latitude ? parseFloat(latitude) : 26.8467;
    const lon = longitude ? parseFloat(longitude) : 80.9462;
    try {
      const wRes = await weatherService.getWeatherData({
        lat,
        lon,
        state: contextData.state,
        district: contextData.district,
        town: contextData.village
      });
      if (wRes && (wRes.current || wRes.observed)) {
        const cur = wRes.current || wRes.observed;
        weatherData = {
          source: wRes.provider || 'Open-Meteo & IMD Agricultural API',
          observed: {
            temperature: cur.temperature !== undefined ? cur.temperature : cur.temp,
            relativeHumidity: cur.humidity !== undefined ? cur.humidity : cur.relativeHumidity,
            precipitation: cur.precipitation !== undefined ? cur.precipitation : (cur.precip_rate || 0),
            weatherDescription: cur.condition || cur.weatherDescription || 'Fair',
            observedAt: wRes.last_updated || wRes.observed_time_display || new Date().toISOString()
          }
        };
      }
    } catch (wErr) {
      console.warn('Weather fetch warning in crop recommendation:', wErr.message);
    }

    // 2. Evaluate each candidate crop across all 5 layers
    const candidates = [];

    for (const [cropKey, crop] of Object.entries(this.cropDatabase)) {
      // Layer 2: Contextual filter
      const contextEval = this.evaluateContext(crop, contextData);
      if (!contextEval.eligible) {
        continue; // Discard out-of-season crops early
      }

      // Layer 1: Soil Nutrient Suitability
      const soilEval = this.evaluateSoilNutrients(crop, soilData);

      // Layer 3: Weather Integration
      const weatherEval = this.evaluateWeather(crop, weatherData, irrigation_type);

      // Layer 4: Regional Profitability
      const marketEval = await this.evaluateMarket(crop, contextData.state, contextData.district);

      // Layer 5: Composite Score Calculation
      let compositeScore = 0;
      let weights = {};

      if (marketEval.isAvailable && marketEval.score !== null) {
        // Full 5-layer weighting
        weights = { soil: 0.35, weather: 0.25, context: 0.20, market: 0.20 };
        compositeScore = Math.round(
          weights.soil * soilEval.score +
          weights.weather * weatherEval.score +
          weights.context * contextEval.score +
          weights.market * marketEval.score
        );
      } else {
        // Redistribute weights proportionally when market data is unavailable
        weights = { soil: 0.45, weather: 0.30, context: 0.25, market: 0.0 };
        compositeScore = Math.round(
          weights.soil * soilEval.score +
          weights.weather * weatherEval.score +
          weights.context * contextEval.score
        );
      }

      candidates.push({
        crop_key: cropKey,
        name_en: crop.name_en,
        name_hi: crop.name_hi,
        scientific_name: crop.scientific_name,
        crop_type: crop.crop_type,
        composite_score: compositeScore,
        weights,
        layers: {
          soil: soilEval,
          context: contextEval,
          weather: weatherEval,
          market: marketEval
        },
        agronomic_advice: {
          en: crop.advice_en,
          hi: crop.advice_hi
        }
      });
    }

    // 3. Sort candidates by composite score descending
    candidates.sort((a, b) => b.composite_score - a.composite_score);

    // 4. Select Top 2 to 3 crops
    const topRecommendations = candidates.slice(0, 3);

    if (topRecommendations.length === 0) {
      throw new Error(`No suitable crops found for season "${contextData.season}" and soil "${contextData.soil_type}". Try adjusting the season or soil parameters.`);
    }

    // 5. Identify Primary Recommendation
    const primaryCrop = topRecommendations[0];
    const scoreMargin = topRecommendations.length > 1 
      ? primaryCrop.composite_score - topRecommendations[1].composite_score 
      : 15;

    let primaryConfidence_en = 'High Confidence Recommendation';
    let primaryConfidence_hi = 'उच्च विश्वसनीयता अनुशंसा';

    if (scoreMargin >= 8) {
      primaryConfidence_en = `Clear primary match (leads by ${scoreMargin} points across soil, weather & context layers)`;
      primaryConfidence_hi = `स्पष्ट प्रथम वरीयता (मृदा, मौसम व क्षेत्रीय मानकों में ${scoreMargin} अंकों की बढ़त)`;
    } else {
      primaryConfidence_en = `Competitive match (closely followed by ${topRecommendations[1].name_en}; suitable for intercropping/crop rotation)`;
      primaryConfidence_hi = `समान रूप से उपयुक्त (दूसरी पसंद ${topRecommendations[1].name_hi} के साथ मिश्रित खेती या फसल चक्र के लिए उपयुक्त)`;
    }

    const response = {
      evaluated_at: new Date().toISOString(),
      model_metadata: {
        architecture: '5-Layer Hybrid Multi-Criteria Decision Model (Non-ML)',
        paper_citation: 'Hybrid AI-Driven Crop Recommendation Model Based on Soil Nutrient Analysis and Weather-Driven Environmental Factors',
        scoring_weights_mode: primaryCrop.layers.market.isAvailable ? '4-Component Full Evaluation' : '3-Component Market-Excluded Normalization'
      },
      farm_context: {
        location: `${contextData.village}, ${contextData.district}, ${contextData.state}`,
        coordinates: `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`,
        soil_type: contextData.soil_type,
        season: contextData.season,
        irrigation: irrigation_type || 'Canal / Irrigated',
        measured_nutrients: {
          n: `${n} kg/ha`,
          p: `${p} kg/ha`,
          k: `${k} kg/ha`,
          ph: ph
        }
      },
      weather_context: {
        is_available: primaryCrop.layers.weather.isAvailable,
        data_source: primaryCrop.layers.weather.source,
        timestamp: primaryCrop.layers.weather.timestamp,
        temperature: `${primaryCrop.layers.weather.temperature_c} °C`,
        relative_humidity: `${primaryCrop.layers.weather.humidity_pct} %`,
        conditions: primaryCrop.layers.weather.weather_description
      },
      market_context: {
        is_available: primaryCrop.layers.market.isAvailable,
        data_source: primaryCrop.layers.market.data_source,
        disclosure_en: primaryCrop.layers.market.isAvailable ? 'Live verified government market prices applied.' : 'Market feed unavailable; layer omitted transparently without fabricating prices.',
        disclosure_hi: primaryCrop.layers.market.isAvailable ? 'सरकारी मंडियों के लाइव भाव शामिल किए गए।' : 'मंडी भाव अनुपलब्ध; बिना किसी काल्पनिक आंकड़े के इस घटक को अलग रखा गया।'
      },
      primary_recommendation: {
        crop_key: primaryCrop.crop_key,
        name_en: primaryCrop.name_en,
        name_hi: primaryCrop.name_hi,
        scientific_name: primaryCrop.scientific_name,
        composite_score: primaryCrop.composite_score,
        confidence_en: primaryConfidence_en,
        confidence_hi: primaryConfidence_hi,
        score_breakdown: {
          soil_score: primaryCrop.layers.soil.score,
          weather_score: primaryCrop.layers.weather.score,
          context_score: primaryCrop.layers.context.score,
          market_score: primaryCrop.layers.market.score
        },
        reasons_en: [...primaryCrop.layers.soil.reasons_en, ...primaryCrop.layers.weather.reasons_en],
        reasons_hi: [...primaryCrop.layers.soil.reasons_hi, ...primaryCrop.layers.weather.reasons_hi],
        warnings_en: [...primaryCrop.layers.soil.warnings_en, ...primaryCrop.layers.weather.warnings_en],
        warnings_hi: [...primaryCrop.layers.soil.warnings_hi, ...primaryCrop.layers.weather.warnings_hi],
        agronomic_advice: primaryCrop.agronomic_advice
      },
      ranked_crops: topRecommendations
    };

    return response;
  }

  /**
   * Persist crop recommendation in database
   */
  async saveRecommendationRecord(farmerId, inputData, recommendationResult) {
    if (!farmerId) return null;

    const inputSummary = `Soil: ${inputData.soil_type}, Season: ${inputData.season}, N:${inputData.n_value}, P:${inputData.p_value}, K:${inputData.k_value}, pH:${inputData.ph_value}`;
    const recSummary = JSON.stringify({
      primary_crop: recommendationResult.primary_recommendation.name_en,
      score: recommendationResult.primary_recommendation.composite_score,
      ranked: recommendationResult.ranked_crops.map(c => ({ name: c.name_en, score: c.composite_score }))
    });

    try {
      const [result] = await db.query(
        `INSERT INTO ai_recommendations (farmer_id, recommendation_type, input_data, recommendation_text)
         VALUES (?, 'Crop', ?, ?)`,
        [farmerId, inputSummary, recSummary]
      );
      return result.insertId;
    } catch (err) {
      console.warn('Could not save to ai_recommendations:', err.message);
      return null;
    }
  }

  /**
   * Fetch recent crop recommendation history for farmer
   */
  async getFarmerRecommendationHistory(farmerId, limit = 6) {
    if (!farmerId) return [];
    try {
      const [rows] = await db.query(
        `SELECT id, recommendation_type, input_data, recommendation_text, created_at
         FROM ai_recommendations
         WHERE farmer_id = ? AND recommendation_type = 'Crop'
         ORDER BY id DESC
         LIMIT ?`,
        [farmerId, limit]
      );

      return rows.map(r => {
        let parsed = null;
        try {
          parsed = JSON.parse(r.recommendation_text);
        } catch (e) {
          parsed = { primary_crop: r.recommendation_text, score: 90 };
        }
        return {
          id: r.id,
          input_summary: r.input_data,
          primary_crop: parsed?.primary_crop || r.recommendation_text,
          score: parsed?.score || null,
          created_at: r.created_at
        };
      });
    } catch (err) {
      console.warn('Error fetching crop recommendation history:', err.message);
      return [];
    }
  }
}

module.exports = new CropRecommendationService();

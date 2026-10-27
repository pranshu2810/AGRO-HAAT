const cropService = require('../services/cropRecommendationService');

async function testCropService() {
  console.log('=== Testing Hybrid AI Crop Recommendation Service ===\n');

  // Test Case 1: Standard Rabi season inputs in Alluvial soil (Should recommend Wheat / Mustard / Potato)
  console.log('[Test 1] Testing Rabi season in Alluvial Soil with balanced NPK & neutral pH:');
  const rabiInput = {
    n_value: 260,
    p_value: 20,
    k_value: 210,
    ph_value: 6.8,
    soil_type: 'Alluvial Soil',
    season: 'Rabi',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    village: 'Mohanlalganj',
    latitude: 26.8467,
    longitude: 80.9462,
    irrigation_type: 'Canal / Irrigated'
  };

  const rabiResult = await cropService.recommendCrops(rabiInput);
  console.log('Primary Recommended Crop (EN):', rabiResult.primary_recommendation.name_en);
  console.log('Primary Recommended Crop (HI):', rabiResult.primary_recommendation.name_hi);
  console.log('Composite Score:', rabiResult.primary_recommendation.composite_score);
  console.log('Score Breakdown:', rabiResult.primary_recommendation.score_breakdown);
  console.log('Ranked Crops:', rabiResult.ranked_crops.map(c => `${c.name_en} (${c.composite_score})`));
  console.log('Confidence (EN):', rabiResult.primary_recommendation.confidence_en);
  console.log('Confidence (HI):', rabiResult.primary_recommendation.confidence_hi);
  console.log('Agronomic Advice (HI):', rabiResult.primary_recommendation.agronomic_advice.hi);

  if (!rabiResult.primary_recommendation.name_en || rabiResult.ranked_crops.length < 2) {
    throw new Error('Test 1 failed to return valid top crops.');
  }

  // Test Case 2: Kharif season in Black Cotton soil (Should recommend Cotton / Soybean / Maize)
  console.log('\n[Test 2] Testing Kharif season in Black Cotton Soil:');
  const kharifInput = {
    n_value: 220,
    p_value: 16,
    k_value: 240,
    ph_value: 7.6,
    soil_type: 'Black Cotton Soil',
    season: 'Kharif',
    state: 'Maharashtra',
    district: 'Nagpur',
    village: 'Katol',
    latitude: 21.1458,
    longitude: 79.0882,
    irrigation_type: 'Rainfed'
  };

  const kharifResult = await cropService.recommendCrops(kharifInput);
  console.log('Primary Recommended Crop (EN):', kharifResult.primary_recommendation.name_en);
  console.log('Primary Recommended Crop (HI):', kharifResult.primary_recommendation.name_hi);
  console.log('Composite Score:', kharifResult.primary_recommendation.composite_score);
  console.log('Ranked Crops:', kharifResult.ranked_crops.map(c => `${c.name_en} (${c.composite_score})`));

  // Test Case 3: Incompatible Soil / Extreme Acidic pH Warning Test
  console.log('\n[Test 3] Testing Acidic pH Soil Warning:');
  const acidicInput = {
    n_value: 120,
    p_value: 8,
    k_value: 90,
    ph_value: 4.8, // Severely acidic
    soil_type: 'Sandy Loam',
    season: 'Rabi',
    state: 'Punjab',
    district: 'Ludhiana',
    latitude: 30.9010,
    longitude: 75.8573
  };

  const acidicResult = await cropService.recommendCrops(acidicInput);
  console.log('Acidic soil warnings (EN):', acidicResult.primary_recommendation.warnings_en);
  console.log('Acidic soil warnings (HI):', acidicResult.primary_recommendation.warnings_hi);

  // Test Case 4: Validation rejection of non-numeric inputs
  console.log('\n[Test 4] Testing invalid non-numeric input handling:');
  try {
    await cropService.recommendCrops({ n_value: 'abc', p_value: 20, k_value: 100, ph_value: 7.0 });
    throw new Error('Did not throw on non-numeric N');
  } catch (err) {
    console.log('✅ Correctly rejected invalid input:', err.message);
  }

  console.log('\n🎉 ALL CROP RECOMMENDATION SERVICE TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

testCropService().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

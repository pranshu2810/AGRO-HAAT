const soilService = require('../services/soilIntelligenceService');

async function testSoilService() {
  console.log('--- 1. Testing Input Validation ---');
  
  // Test invalid input (missing N and out of range pH)
  const invalidResult = soilService.validateInputs({
    n_value: '',
    p_value: '20',
    k_value: '150',
    ph_value: '14.0'
  });
  console.log('Invalid input correctly flagged:', !invalidResult.isValid);
  console.log('Errors caught:', invalidResult.errors);

  // Test valid input with ppm units and optional fields
  const validRaw = {
    plot_name: 'Plot A - North Field',
    survey_number: '142/2',
    area_acres: '2.5',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    block_tehsil: 'Bakshi Ka Talab',
    village: 'Kathwara',
    latitude: '26.9850',
    longitude: '80.9200',
    soil_type: 'Clay Loam',
    n_value: '95',
    n_unit: 'ppm', // 95 * 2.24 = 212.8 kg/ha (Low)
    p_value: '8.5',
    p_unit: 'ppm', // 8.5 * 2.24 = 19.04 kg/ha (Medium)
    k_value: '120',
    k_unit: 'ppm', // 120 * 2.24 = 268.8 kg/ha (Medium)
    ph_value: '5.2', // Strongly Acidic -> triggers Lime
    ec_value: '0.45',
    oc_value: '0.38', // Low OC -> triggers FYM
    s_value: '7.5', // Deficient S (<10) -> triggers Sulphur
    zn_value: '0.45', // Deficient Zn (<0.60) -> triggers Zinc Sulphate
    fe_value: '5.2', // Sufficient
    b_value: '0.35', // Deficient B (<0.50) -> triggers Borax
    crop_name: 'Wheat',
    season: 'Rabi',
    growth_stage: 'Pre-sowing',
    irrigation_type: 'Canal',
    target_yield: '50',
    data_source: 'Soil Health Card (SHC)',
    shc_sample_number: 'SHC-UP-LKO-2026-9812'
  };

  const validResult = soilService.validateInputs(validRaw);
  console.log('\nValid input passed:', validResult.isValid);
  if (!validResult.isValid) {
    console.error('Validation unexpected errors:', validResult.errors);
    process.exit(1);
  }

  console.log('\n--- 2. Testing Rule-Based Assessment ---');
  const assessment = soilService.assessSoil(validResult.normalized);
  
  console.log('Overall Fertility Rating:', assessment.fertility_index.rating_en, `(${assessment.fertility_index.score}/100)`);
  console.log('N Status:', assessment.nutrients.n.classification, `(${assessment.nutrients.n.value_kg_ha} kg/ha)`);
  console.log('P Status:', assessment.nutrients.p.classification, `(${assessment.nutrients.p.value_kg_ha} kg/ha)`);
  console.log('K Status:', assessment.nutrients.k.classification, `(${assessment.nutrients.k.value_kg_ha} kg/ha)`);
  console.log('pH Status:', assessment.soil_reaction.classification, `(${assessment.soil_reaction.ph_value})`);
  console.log('Soil Amendments Triggered:', assessment.soil_amendments.length);
  assessment.soil_amendments.forEach((a, i) => {
    console.log(`  [${i+1}] EN: ${a.amendment_en} (${a.dosage_acre}) | HI: ${a.amendment_hi}`);
  });

  console.log('\nFertilizer Schedule (per acre):');
  assessment.fertilizer_recommendations.commercial_products_per_acre.forEach(p => {
    console.log(`  * ${p.product_en} -> ${p.quantity_kg} kg/acre (${p.bags})`);
  });

  console.log('\n--- 3. Testing Bilingual Terminology Check ---');
  console.log('Crop EN:', assessment.crop_context.crop_name_en);
  console.log('Crop HI:', assessment.crop_context.crop_name_hi);
  console.log('Practical Next Steps (Hindi sample):', assessment.practical_next_steps.hi[0]);

  console.log('\n--- 4. Testing AI Narrative Explanation ---');
  const aiExplanation = await soilService.generateAiExplanation(assessment);
  console.log('AI success:', aiExplanation.success);
  console.log('Summary (EN):', aiExplanation.summary_en);
  console.log('Summary (HI):', aiExplanation.summary_hi);
  console.log('Sample FAQ:', aiExplanation.faqs ? aiExplanation.faqs[0].q_hi : 'None');

  console.log('\n✅ All soil intelligence tests passed successfully!');
  process.exit(0);
}

testSoilService().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

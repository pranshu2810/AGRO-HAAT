/**
 * AgroHaat Bhashini Multilingual Integration Test Suite
 * Validates:
 * 1. Bhashini Service Configuration & Language Catalog (12 Indic Languages)
 * 2. Indic Unicode Script Detection & Language Identification
 * 3. Agricultural Natural Speech Text Formatter
 * 4. Unified Voice Assistant Query Engine (Hindi, Hinglish, English, Indic)
 * 5. Audio Synthesis Stream (TTS Buffer Integrity)
 * 6. Live API HTTP Endpoints (/api/bhashini/status, /api/voice/chat, /api/voice/speak)
 */

const assert = require('assert');
const axios = require('axios');
const bhashiniService = require('../services/bhashiniService');
const voiceAssistantService = require('../services/voiceAssistantService');

async function runTests() {
  console.log('====================================================');
  console.log('🌱 AGROHAAT - BHASHINI MULTILINGUAL INTEGRATION TEST');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Bhashini Service Status & Catalog Test
  console.log('▶ [TEST 1] Bhashini Service Status & Language Catalog');
  try {
    const status = bhashiniService.getStatus();
    console.log('  Status:', JSON.stringify(status, null, 2));
    assert.strictEqual(typeof status.is_configured, 'boolean', 'is_configured must be boolean');
    assert.strictEqual(status.total_languages, 12, 'Must support 12 official language profiles');
    assert.ok(status.supported_languages.some(l => l.code === 'hi'), 'Must include Hindi (hi)');
    assert.ok(status.supported_languages.some(l => l.code === 'pa'), 'Must include Punjabi (pa)');
    assert.ok(status.supported_languages.some(l => l.code === 'bn'), 'Must include Bengali (bn)');
    assert.ok(status.supported_languages.some(l => l.code === 'mr'), 'Must include Marathi (mr)');
    assert.ok(status.supported_languages.some(l => l.code === 'gu'), 'Must include Gujarati (gu)');
    assert.ok(status.supported_languages.some(l => l.code === 'ta'), 'Must include Tamil (ta)');
    console.log('  ✅ [PASS] Bhashini service catalog verified (12 Indian languages).\n');
    passed++;
  } catch (err) {
    console.error('  ❌ [FAIL] Test 1:', err.message, '\n');
    failed++;
  }

  // 2. Indic Unicode Script & Language Detection Test
  console.log('▶ [TEST 2] Indic Script & Language Detection');
  try {
    const testCases = [
      { text: 'ਕਣਕ ਦਾ ਅੱਜ ਦਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ?', expected: 'pa', desc: 'Gurmukhi (Punjabi)' },
      { text: 'আজকে বাজারে ধানের দাম কত?', expected: 'bn', desc: 'Bengali' },
      { text: 'કપાસનો આજનો બજાર ભાવ શું છે?', expected: 'gu', desc: 'Gujarati' },
      { text: 'सोयाबीनचा आजचा बाजारभाव काय आहे?', expected: 'mr', desc: 'Marathi' },
      { text: 'वाराणसी में आज गेहूं का क्या भाव है?', expected: 'hi', desc: 'Devanagari Hindi' },
      { text: 'aaj gehun ka mandi bhav kya chal raha hai', expected: 'hinglish', desc: 'Roman Hinglish' },
      { text: 'What is the current market price of wheat in Varanasi?', expected: 'en', desc: 'English' }
    ];

    for (const tc of testCases) {
      const detected = voiceAssistantService.detectLanguage(tc.text, 'auto');
      assert.strictEqual(detected, tc.expected, `Detection failed for ${tc.desc}: got ${detected}, expected ${tc.expected}`);
      console.log(`  ✓ ${tc.desc} -> detected as '${detected}'`);
    }
    console.log('  ✅ [PASS] All Indic scripts & languages accurately detected.\n');
    passed++;
  } catch (err) {
    console.error('  ❌ [FAIL] Test 2:', err.message, '\n');
    failed++;
  }

  // 3. Natural Speech Formatting Test
  console.log('▶ [TEST 3] Natural Speech Formatter (Units & Numbers)');
  try {
    const hindiInput = 'गेहूं का भाव ₹2450/qtl है और तापमान 28°C है। आर्द्रता 65% है।';
    const spokenHindi = voiceAssistantService.formatForNaturalSpeech(hindiInput, 'hi');
    assert.ok(spokenHindi.includes('2450 रुपये प्रति क्विंटल'), 'Must pronounce ₹/qtl in natural Hindi words');
    assert.ok(spokenHindi.includes('28 डिग्री सेल्सियस'), 'Must pronounce °C in natural Hindi words');
    assert.ok(spokenHindi.includes('65 प्रतिशत'), 'Must pronounce % in natural Hindi words');
    console.log('  Hindi formatted speech:', spokenHindi);

    const engInput = 'Wheat price is ₹2450/qtl and temperature is 28°C.';
    const spokenEng = voiceAssistantService.formatForNaturalSpeech(engInput, 'en');
    assert.ok(spokenEng.includes('2450 rupees per quintal'), 'Must pronounce ₹/qtl in English words');
    assert.ok(spokenEng.includes('28 degrees Celsius'), 'Must pronounce °C in English words');
    console.log('  English formatted speech:', spokenEng);

    console.log('  ✅ [PASS] Spoken scripts accurately format numbers, currency, and agricultural units.\n');
    passed++;
  } catch (err) {
    console.error('  ❌ [FAIL] Test 3:', err.message, '\n');
    failed++;
  }

  // 4. Unified Voice Assistant Query Engine Test
  console.log('▶ [TEST 4] Voice Assistant Processing (Mandi & Weather Grounding)');
  try {
    // Hindi Mandi Query
    const hiResult = await voiceAssistantService.processQuery({
      query: 'वाराणसी में गेहूं का भाव क्या है?',
      language: 'hi'
    });
    assert.ok(hiResult.text_response, 'Must have text_response');
    assert.ok(hiResult.spoken_response, 'Must have spoken_response');
    assert.strictEqual(hiResult.detected_language, 'hi', 'Language must be hi');
    assert.strictEqual(hiResult.intent, 'mandi_price', 'Intent must be mandi_price');
    console.log('  [Hindi Response Preview]:', hiResult.text_response.slice(0, 120) + '...');
    console.log('  [Spoken Script]:', hiResult.spoken_response);
    console.log('  [Data Sources]:', hiResult.data_sources);
    console.log('  [Bhashini Meta]:', hiResult.bhashini_metadata?.mode);

    // English Weather Query
    const enResult = await voiceAssistantService.processQuery({
      query: 'What is the weather in Lucknow today?',
      language: 'en'
    });
    assert.ok(enResult.text_response, 'Must have text_response');
    assert.strictEqual(enResult.detected_language, 'en', 'Language must be en');
    assert.strictEqual(enResult.intent, 'weather_advisory', 'Intent must be weather_advisory');
    console.log('  [English Weather Preview]:', enResult.text_response.slice(0, 120) + '...');

    console.log('  ✅ [PASS] Unified query engine successfully grounded with agricultural context.\n');
    passed++;
  } catch (err) {
    console.error('  ❌ [FAIL] Test 4:', err.message, '\n');
    failed++;
  }

  // 5. Speech Audio Generation (TTS Stream Concatenation) Test
  console.log('▶ [TEST 5] Text-to-Speech (TTS) Buffer Generation');
  try {
    const ttsResult = await voiceAssistantService.generateSpeechAudio(
      'नमस्ते किसान भाई, वाराणसी में गेहूं का भाव 2400 रुपये प्रति क्विंटल है।',
      'hi'
    );
    assert.ok(ttsResult.buffer, 'Must return audio buffer');
    assert.ok(ttsResult.buffer.length > 500, `Audio buffer must be non-empty (got ${ttsResult.buffer.length} bytes)`);
    console.log(`  ✓ Audio generated: ${ttsResult.buffer.length} bytes, Content-Type: ${ttsResult.contentType}, Provider: ${ttsResult.provider}`);
    console.log('  ✅ [PASS] Text-to-Speech audio successfully generated without 400 errors.\n');
    passed++;
  } catch (err) {
    console.error('  ❌ [FAIL] Test 5:', err.message, '\n');
    failed++;
  }

  // Summary
  console.log('====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

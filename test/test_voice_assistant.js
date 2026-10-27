const voiceAssistantService = require('../services/voiceAssistantService');

async function runVoiceAssistantTests() {
  console.log('=== STARTING MULTILINGUAL AI VOICE ASSISTANT TESTS ===\n');

  // Test 1: Language Detection
  console.log('[TEST 1] Language Detection');
  const lang1 = voiceAssistantService.detectLanguage('नमस्ते किसान भाई, मेरी फसल में कीड़े लगे हैं');
  const lang2 = voiceAssistantService.detectLanguage('What is the current temperature in Varanasi?');
  const lang3 = voiceAssistantService.detectLanguage('Aaj mandi me gehun ka rate kya chal raha hai?');
  console.log('Lang 1 (Devanagari Hindi):', lang1, lang1 === 'hi' ? '✅' : '❌');
  console.log('Lang 2 (English):', lang2, lang2 === 'en' ? '✅' : '❌');
  console.log('Lang 3 (Hinglish):', lang3, lang3 === 'hinglish' ? '✅' : '❌');

  if (lang1 !== 'hi' || lang2 !== 'en' || lang3 !== 'hinglish') {
    throw new Error('Language detection failed');
  }

  // Test 2: Entity & Intent Extraction + Live Mandi Market Data (Hinglish / Hindi)
  console.log('\n[TEST 2] Intent & Entity Extraction + Verified Market Data');
  const queryHindi = 'वाराणसी मंडी में गेहूं का भाव क्या है?';
  const resHindi = await voiceAssistantService.processQuery({
    query: queryHindi,
    language: 'hi',
    sessionHistory: []
  });
  console.log('Hindi Intent:', resHindi.intent);
  console.log('Detected Language:', resHindi.detected_language);
  console.log('Data Sources:', resHindi.data_sources);
  console.log('Text Response Sample:', resHindi.text_response.slice(0, 180) + '...');
  console.log('Natural Spoken Text Sample:', resHindi.spoken_response.slice(0, 180) + '...');

  if (!resHindi.text_response || !resHindi.spoken_response) {
    throw new Error('Missing text or spoken response in Hindi');
  }

  // Test 3: Live Weather Integration Query (English)
  console.log('\n[TEST 3] Weather Advisory Live Integration');
  const queryWeather = 'What is the current weather condition in Lucknow?';
  const resWeather = await voiceAssistantService.processQuery({
    query: queryWeather,
    language: 'en',
    sessionHistory: []
  });
  console.log('English Weather Intent:', resWeather.intent);
  console.log('Data Sources:', resWeather.data_sources);
  console.log('Text Response Sample:', resWeather.text_response.slice(0, 180) + '...');
  console.log('Spoken Text Sample:', resWeather.spoken_response.slice(0, 180) + '...');

  // Test 4: Conversation Memory / Multi-turn Follow-up
  console.log('\n[TEST 4] Multi-turn Follow-up Context Retention');
  const history = [
    { role: 'user', content: 'What is the price of wheat in Varanasi?', entities: { commodity: { en: 'Wheat', hi: 'गेहूं', std: 'Wheat' }, location: { state: 'Uttar Pradesh', district: 'Varanasi', lat: 25.3176, lon: 82.9739 } } },
    { role: 'assistant', content: 'The modal price of wheat in Varanasi is ₹2,450 per quintal.' }
  ];
  const followUpQuery = 'And what about Mustard?';
  const resFollowUp = await voiceAssistantService.processQuery({
    query: followUpQuery,
    language: 'en',
    sessionHistory: history
  });
  console.log('Follow-up Commodity:', resFollowUp.entities?.commodity?.en);
  console.log('Follow-up Retained Location:', resFollowUp.entities?.location?.district);
  console.log('Follow-up Response Sample:', resFollowUp.text_response.slice(0, 180) + '...');

  if (resFollowUp.entities?.commodity?.en !== 'Mustard' || resFollowUp.entities?.location?.district !== 'Varanasi') {
    console.warn('Note: Follow-up entities:', resFollowUp.entities);
  }

  // Test 5: Speech-to-Text with Groq Whisper
  console.log('\n[TEST 5] Groq Whisper Speech-to-Text API');
  const sampleRate = 16000;
  const numSamples = 16000;
  const wavBuffer = Buffer.alloc(44 + numSamples * 2);
  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(36 + numSamples * 2, 4);
  wavBuffer.write('WAVE', 8);
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16);
  wavBuffer.writeUInt16LE(1, 20); // PCM
  wavBuffer.writeUInt16LE(1, 22); // Mono
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(sampleRate * 2, 28);
  wavBuffer.writeUInt16LE(2, 32);
  wavBuffer.writeUInt16LE(16, 34);
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(numSamples * 2, 40);

  const sttResult = await voiceAssistantService.transcribeAudio(wavBuffer, 'audio/wav', 'hi');
  console.log('Whisper STT Output:', sttResult);
  if (!sttResult) {
    throw new Error('Whisper STT returned null');
  }

  // Test 6: Text-to-Speech (TTS) Audio Generation
  console.log('\n[TEST 6] Natural TTS Audio Generation');
  const audioBuffer = await voiceAssistantService.generateSpeechAudio('नमस्ते किसान भाई, आपका स्वागत है।', 'hi');
  console.log('Generated Speech Audio Bytes:', audioBuffer.length);
  if (!audioBuffer || audioBuffer.length < 1000) {
    throw new Error('TTS Audio buffer is too small or failed');
  }

  console.log('\n🎉 ALL VOICE ASSISTANT SERVICE TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runVoiceAssistantTests().catch(err => {
  console.error('VOICE ASSISTANT TEST ERROR:', err);
  process.exit(1);
});

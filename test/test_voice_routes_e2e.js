const http = require('http');

function request(options, data = null, isBinary = false) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: isBinary ? buffer : buffer.toString('utf8')
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function runVoiceRoutesE2ETests() {
  console.log('--- STARTING VOICE ASSISTANT HTTP E2E INTEGRATION TESTS ---');

  // Test 1: GET /api/voice/speak (TTS MP3 Audio Stream)
  console.log('\n[TEST 1] GET /api/voice/speak - Text-to-Speech MP3 Stream');
  const ttsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/voice/speak?lang=hi&text=${encodeURIComponent('नमस्ते किसान भाई')}`,
    method: 'GET'
  }, null, true);

  console.log('TTS Status:', ttsRes.statusCode);
  console.log('Content-Type:', ttsRes.headers['content-type']);
  console.log('Audio Bytes:', ttsRes.body.length);

  if (ttsRes.statusCode !== 200 || !ttsRes.headers['content-type'].includes('audio/mpeg') || ttsRes.body.length < 1000) {
    throw new Error('TTS MP3 stream test failed');
  }

  // Test 2: POST /api/voice/chat (Hindi Query with Verified Agmarknet Mandi Integration)
  console.log('\n[TEST 2] POST /api/voice/chat - Hindi Mandi Query');
  const hindiPayload = JSON.stringify({
    message: 'वाराणसी में गेहूं का भाव क्या है?',
    language: 'hi'
  });
  const hindiChatRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/voice/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(hindiPayload)
    }
  }, hindiPayload);

  console.log('Hindi Chat Status:', hindiChatRes.statusCode);
  const hindiData = JSON.parse(hindiChatRes.body);
  console.log('Hindi Chat Success:', hindiData.success);
  console.log('Detected Language:', hindiData.detected_language);
  console.log('Intent:', hindiData.intent);
  console.log('Audio URL:', hindiData.audio_url);
  console.log('Text Snippet:', hindiData.text_response.slice(0, 150) + '...');
  console.log('Spoken Snippet:', hindiData.spoken_response.slice(0, 150) + '...');

  if (!hindiData.success || !hindiData.text_response || !hindiData.spoken_response) {
    throw new Error('Hindi chat failed');
  }

  // Test 3: POST /api/voice/chat (English Weather Query)
  console.log('\n[TEST 3] POST /api/voice/chat - English Weather Advisory Query');
  const enPayload = JSON.stringify({
    message: 'What is the current temperature and weather condition in Lucknow?',
    language: 'en'
  });
  const enChatRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/voice/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(enPayload)
    }
  }, enPayload);

  console.log('English Chat Status:', enChatRes.statusCode);
  const enData = JSON.parse(enChatRes.body);
  console.log('English Chat Success:', enData.success);
  console.log('Detected Language:', enData.detected_language);
  console.log('Intent:', enData.intent);
  console.log('Data Sources:', enData.data_sources);
  console.log('Text Snippet:', enData.text_response.slice(0, 150) + '...');
  console.log('Spoken Snippet:', enData.spoken_response.slice(0, 150) + '...');

  if (!enData.success || !enData.text_response) {
    throw new Error('English weather chat failed');
  }

  // Test 4: POST /api/voice/chat (Hinglish Query)
  console.log('\n[TEST 4] POST /api/voice/chat - Hinglish Mixed Speech Query');
  const hinglishPayload = JSON.stringify({
    message: 'Aaj mandi me gehun aur sarson ka kya rate chal raha hai?',
    language: 'hinglish'
  });
  const hinglishRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/voice/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(hinglishPayload)
    }
  }, hinglishPayload);

  console.log('Hinglish Status:', hinglishRes.statusCode);
  const hinglishData = JSON.parse(hinglishRes.body);
  console.log('Hinglish Success:', hinglishData.success);
  console.log('Hinglish Detected Lang:', hinglishData.detected_language);
  console.log('Hinglish Snippet:', hinglishData.text_response.slice(0, 150) + '...');

  if (!hinglishData.success) {
    throw new Error('Hinglish chat failed');
  }

  // Test 5: POST /api/voice/transcribe (Whisper STT Multipart Upload)
  console.log('\n[TEST 5] POST /api/voice/transcribe - Groq Whisper STT Upload');
  const sampleRate = 16000;
  const numSamples = 16000;
  const pcmWav = Buffer.alloc(44 + numSamples * 2);
  pcmWav.write('RIFF', 0);
  pcmWav.writeUInt32LE(36 + numSamples * 2, 4);
  pcmWav.write('WAVE', 8);
  pcmWav.write('fmt ', 12);
  pcmWav.writeUInt32LE(16, 16);
  pcmWav.writeUInt16LE(1, 20); // PCM
  pcmWav.writeUInt16LE(1, 22); // Mono
  pcmWav.writeUInt32LE(sampleRate, 24);
  pcmWav.writeUInt32LE(sampleRate * 2, 28);
  pcmWav.writeUInt16LE(2, 32);
  pcmWav.writeUInt16LE(16, 34);
  pcmWav.write('data', 36);
  pcmWav.writeUInt32LE(numSamples * 2, 40);

  const boundary = '----WebKitFormBoundaryVoiceTest123';
  let multipartBody = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="language"\r\n\r\nhi\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="audio"; filename="speech.wav"\r\nContent-Type: audio/wav\r\n\r\n`),
    pcmWav,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const sttRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/voice/transcribe',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': multipartBody.length
    }
  }, multipartBody);

  console.log('STT Upload Status:', sttRes.statusCode);
  const sttData = JSON.parse(sttRes.body);
  console.log('STT Success Flag:', sttData.success);
  console.log('STT Transcript Output:', sttData.transcript);

  if (sttRes.statusCode !== 200 || !sttData.success) {
    throw new Error('STT upload route failed');
  }

  // Test 6: Legacy Chatbot Endpoint Backward Compatibility
  console.log('\n[TEST 6] POST /actions/chatbot_response.php - Legacy Chatbot Endpoint');
  const legacyPayload = 'message=' + encodeURIComponent('टमाटर में इल्ली का इलाज क्या है?');
  const legacyRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/actions/chatbot_response.php',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(legacyPayload)
    }
  }, legacyPayload);

  console.log('Legacy Chatbot Status:', legacyRes.statusCode);
  console.log('Legacy Reply Sample:', legacyRes.body.slice(0, 150) + '...');
  if (legacyRes.statusCode !== 200 || !legacyRes.body.length) {
    throw new Error('Legacy chatbot endpoint failed');
  }

  console.log('\n=== ALL VOICE ASSISTANT E2E HTTP INTEGRATION TESTS PASSED! ===\n');
}

runVoiceRoutesE2ETests().catch(err => {
  console.error('E2E FAILURE:', err);
  process.exit(1);
});

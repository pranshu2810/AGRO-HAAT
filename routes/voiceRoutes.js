const express = require('express');
const router = express.Router();
const multer = require('multer');
const voiceAssistantService = require('../services/voiceAssistantService');
const bhashiniService = require('../services/bhashiniService');

// In-memory multer storage for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

/**
 * Digital India Bhashini System Status Endpoint
 */
router.get('/api/bhashini/status', (req, res) => {
  res.json({
    success: true,
    ...bhashiniService.getStatus()
  });
});

/**
 * Digital India Bhashini Machine Translation Endpoint (IndicTrans-v2)
 */
router.post('/api/bhashini/translate', async (req, res) => {
  const { text, sourceLang, targetLang } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Text is required for translation.' });
  }

  try {
    const result = await bhashiniService.translateText({
      text: text.trim(),
      sourceLang: sourceLang || 'en',
      targetLang: targetLang || 'hi'
    });
    res.json(result);
  } catch (err) {
    console.error('Bhashini translate route error:', err.message);
    res.status(500).json({ success: false, error: 'Translation service error.' });
  }
});

/**
 * Speech-to-Text (STT) Audio Transcription Endpoint (Bhashini IndicWav2Vec + Groq Whisper)
 */
router.post('/api/voice/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        error: 'No audio recording file was received.'
      });
    }

    const mimeType = req.file.mimetype || 'audio/webm';
    const languageHint = req.body.language || 'auto';

    const result = await voiceAssistantService.transcribeAudio(
      req.file.buffer,
      mimeType,
      languageHint
    );

    res.json({
      success: true,
      transcript: result.text,
      language: result.language,
      provider: result.provider || 'AI ASR'
    });
  } catch (err) {
    console.error('STT Transcription error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to transcribe audio recording. Please try speaking again or use text.'
    });
  }
});

/**
 * Unified Voice and Text Chat Intelligence Endpoint
 */
router.post('/api/voice/chat', async (req, res) => {
  const { message, language } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Message text is required.'
    });
  }

  try {
    // Session-based conversational memory
    if (!req.session.voiceHistory) {
      req.session.voiceHistory = [];
    }

    const assistantOutput = await voiceAssistantService.processQuery({
      query: message.trim(),
      language: language || 'auto',
      sessionHistory: req.session.voiceHistory
    });

    // Update session conversation memory (keep last 6 turns)
    req.session.voiceHistory.push(
      { role: 'user', content: message.trim(), entities: assistantOutput.entities },
      { role: 'assistant', content: assistantOutput.text_response, entities: assistantOutput.entities }
    );
    if (req.session.voiceHistory.length > 8) {
      req.session.voiceHistory = req.session.voiceHistory.slice(-8);
    }

    // Audio stream URL for natural speech response
    const audioUrl = `/api/voice/speak?lang=${assistantOutput.detected_language}&text=${encodeURIComponent(assistantOutput.spoken_response.slice(0, 300))}`;

    res.json({
      success: true,
      text_response: assistantOutput.text_response,
      spoken_response: assistantOutput.spoken_response,
      detected_language: assistantOutput.detected_language,
      language_info: assistantOutput.language_info,
      bhashini_metadata: assistantOutput.bhashini_metadata,
      intent: assistantOutput.intent,
      entities: assistantOutput.entities,
      data_sources: assistantOutput.data_sources,
      audio_url: audioUrl
    });
  } catch (err) {
    console.error('Voice Assistant Query Error:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred while processing your agricultural query.'
    });
  }
});

/**
 * Text-to-Speech (TTS) Audio Stream Endpoint (Bhashini IndicTTS + Multi-Chunk Stream)
 */
router.get('/api/voice/speak', async (req, res) => {
  const text = req.query.text;
  const lang = req.query.lang || 'hi';

  if (!text || !text.trim()) {
    return res.status(400).send('No text provided for speech generation.');
  }

  try {
    const audioResult = await voiceAssistantService.generateSpeechAudio(text, lang);
    const buffer = audioResult.buffer || audioResult;
    const contentType = audioResult.contentType || 'audio/mpeg';

    res.set({
      'Content-Type': contentType,
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=3600'
    });

    res.send(buffer);
  } catch (err) {
    console.error('TTS Audio Stream Error:', err.message);
    res.status(500).send('Failed to synthesize speech audio.');
  }
});

/**
 * Clear Session Conversation Memory
 */
router.post('/api/voice/clear_session', (req, res) => {
  req.session.voiceHistory = [];
  res.json({ success: true, message: 'Conversation memory reset.' });
});

module.exports = router;

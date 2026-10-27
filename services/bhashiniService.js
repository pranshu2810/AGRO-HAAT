const axios = require('axios');
require('dotenv').config();

/**
 * Official Digital India Bhashini (NLTM / MeitY) Language Service
 * Connects AgroHaat to Government of India's AI language platform for:
 * 1. Machine Translation (NMT - IndicTrans-v2)
 * 2. Speech-to-Text (ASR - IndicWav2Vec)
 * 3. Text-to-Speech (TTS - IndicTTS)
 */
class BhashiniService {
  constructor() {
    this.userId = process.env.BHASHINI_USER_ID || '';
    this.apiKey = process.env.BHASHINI_API_KEY || '';
    this.inferenceKey = process.env.BHASHINI_INFERENCE_KEY || '';
    this.pipelineEndpoint = process.env.BHASHINI_PIPELINE_ENDPOINT || 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';
    this.authEndpoint = process.env.BHASHINI_AUTH_ENDPOINT || 'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline';

    // Cached pipeline configurations
    this.pipelineConfigCache = null;
    this.cacheTimestamp = null;
    this.CACHE_TTL = 30 * 60 * 1000; // 30 minutes

    // Supported Indian languages with ISO-639-1 / Bhashini language codes
    this.languageCatalog = {
      'hi': { name: 'Hindi', native: 'हिन्दी', code: 'hi', ttsGender: 'female', hasVoice: true },
      'en': { name: 'English', native: 'English', code: 'en', ttsGender: 'female', hasVoice: true },
      'hinglish': { name: 'Hinglish', native: 'हिंग्लिश', code: 'hinglish', baseLang: 'hi', hasVoice: true },
      'pa': { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', code: 'pa', ttsGender: 'female', hasVoice: true },
      'bn': { name: 'Bengali', native: 'বাংলা', code: 'bn', ttsGender: 'female', hasVoice: true },
      'mr': { name: 'Marathi', native: 'मराठी', code: 'mr', ttsGender: 'female', hasVoice: true },
      'gu': { name: 'Gujarati', native: 'ગુજરાતી', code: 'gu', ttsGender: 'female', hasVoice: true },
      'ta': { name: 'Tamil', native: 'தமிழ்', code: 'ta', ttsGender: 'female', hasVoice: true },
      'te': { name: 'Telugu', native: 'తెలుగు', code: 'te', ttsGender: 'female', hasVoice: true },
      'kn': { name: 'Kannada', native: 'ಕನ್ನಡ', code: 'kn', ttsGender: 'female', hasVoice: true },
      'ml': { name: 'Malayalam', native: 'മലയാളം', code: 'ml', ttsGender: 'female', hasVoice: true },
      'or': { name: 'Odia', native: 'ଓଡ଼ିଆ', code: 'or', ttsGender: 'female', hasVoice: true }
    };
  }

  /**
   * Check if Bhashini API credentials are fully configured
   */
  isConfigured() {
    return Boolean(this.inferenceKey || (this.userId && this.apiKey));
  }

  /**
   * Return service status and engine metadata
   */
  getStatus() {
    const configured = this.isConfigured();
    return {
      name: 'Digital India Bhashini (National Language Translation Mission)',
      is_configured: configured,
      mode: configured ? 'Bhashini Cloud (Dhruva/ULCA)' : 'Hybrid Fallback Active (Groq AI4Bharat + Web Speech)',
      pipeline_endpoint: this.pipelineEndpoint,
      supported_languages: Object.values(this.languageCatalog),
      total_languages: Object.keys(this.languageCatalog).length
    };
  }

  /**
   * Retrieve pipeline service IDs for task (translation, asr, tts)
   */
  async getPipelineConfig(taskType, sourceLang = 'en', targetLang = 'hi') {
    if (!this.userId || !this.apiKey) {
      return null;
    }

    // Return cached if fresh
    const now = Date.now();
    if (this.pipelineConfigCache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      return this.pipelineConfigCache;
    }

    try {
      const payload = {
        pipelineTasks: [
          {
            taskType: 'translation',
            config: {
              language: {
                sourceLanguage: sourceLang,
                targetLanguage: targetLang
              }
            }
          },
          {
            taskType: 'asr',
            config: {
              language: {
                sourceLanguage: targetLang
              }
            }
          },
          {
            taskType: 'tts',
            config: {
              language: {
                sourceLanguage: targetLang
              }
            }
          }
        ],
        pipelineRequestConfig: {
          pipelineId: '64392f96daac500b55c543d6'
        }
      };

      const res = await axios.post(this.authEndpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'userID': this.userId,
          'ulcaApiKey': this.apiKey
        },
        timeout: 10000
      });

      if (res.data) {
        this.pipelineConfigCache = res.data;
        this.cacheTimestamp = now;
        return res.data;
      }
    } catch (err) {
      console.warn('Bhashini getModelsPipeline warning:', err.response?.data?.message || err.message);
    }

    return null;
  }

  /**
   * Translate text using Bhashini IndicTrans-v2 NMT
   * Preserves exact prices, currency, units, and dates
   */
  async translateText({ text, sourceLang = 'en', targetLang = 'hi' }) {
    if (!text || !text.trim() || sourceLang === targetLang) {
      return { success: true, translatedText: text, provider: 'Direct' };
    }

    const normSource = sourceLang === 'hinglish' ? 'hi' : sourceLang;
    const normTarget = targetLang === 'hinglish' ? 'hi' : targetLang;

    // If Bhashini credentials configured, query Dhruva pipeline
    if (this.isConfigured()) {
      try {
        const payload = {
          pipelineTasks: [
            {
              taskType: 'translation',
              config: {
                language: {
                  sourceLanguage: normSource,
                  targetLanguage: normTarget
                }
              }
            }
          ],
          inputData: {
            input: [
              { source: text }
            ]
          }
        };

        const headers = {
          'Content-Type': 'application/json'
        };
        if (this.inferenceKey) {
          headers['Authorization'] = this.inferenceKey;
        }

        const res = await axios.post(this.pipelineEndpoint, payload, {
          headers,
          timeout: 12000
        });

        const outputList = res.data?.pipelineResponse?.[0]?.output;
        if (outputList && outputList.length > 0 && outputList[0].target) {
          return {
            success: true,
            translatedText: outputList[0].target.trim(),
            provider: 'Bhashini NMT (IndicTrans-v2)'
          };
        }
      } catch (bErr) {
        console.warn('Bhashini translation API notice:', bErr.response?.data?.message || bErr.message);
      }
    }

    // Graceful fallback: return original text (or processed by voice assistant LLM)
    return {
      success: false,
      translatedText: text,
      provider: 'Local Engine'
    };
  }

  /**
   * Transcribe Indian speech audio using Bhashini IndicWav2Vec ASR
   */
  async transcribeAudio({ audioBase64, language = 'hi', audioFormat = 'wav' }) {
    if (!audioBase64) {
      throw new Error('No audio content provided for Bhashini transcription.');
    }

    const normLang = language === 'hinglish' ? 'hi' : language;

    if (this.isConfigured()) {
      try {
        const payload = {
          pipelineTasks: [
            {
              taskType: 'asr',
              config: {
                language: {
                  sourceLanguage: normLang
                },
                audioFormat: audioFormat
              }
            }
          ],
          inputData: {
            audio: [
              { audioContent: audioBase64 }
            ]
          }
        };

        const headers = { 'Content-Type': 'application/json' };
        if (this.inferenceKey) headers['Authorization'] = this.inferenceKey;

        const res = await axios.post(this.pipelineEndpoint, payload, {
          headers,
          timeout: 15000
        });

        const asrOut = res.data?.pipelineResponse?.[0]?.output?.[0];
        if (asrOut && asrOut.source) {
          return {
            success: true,
            transcript: asrOut.source.trim(),
            provider: 'Bhashini ASR (IndicWav2Vec)'
          };
        }
      } catch (bErr) {
        console.warn('Bhashini ASR notice:', bErr.response?.data?.message || bErr.message);
      }
    }

    return {
      success: false,
      transcript: '',
      provider: 'Fallback'
    };
  }

  /**
   * Synthesize natural speech audio using Bhashini IndicTTS
   */
  async synthesizeSpeech({ text, language = 'hi', gender = 'female' }) {
    if (!text || !text.trim()) {
      throw new Error('No text provided for speech synthesis.');
    }

    const normLang = language === 'hinglish' ? 'hi' : language;

    if (this.isConfigured()) {
      try {
        const payload = {
          pipelineTasks: [
            {
              taskType: 'tts',
              config: {
                language: {
                  sourceLanguage: normLang
                },
                gender: gender
              }
            }
          ],
          inputData: {
            input: [
              { source: text.slice(0, 450) }
            ]
          }
        };

        const headers = { 'Content-Type': 'application/json' };
        if (this.inferenceKey) headers['Authorization'] = this.inferenceKey;

        const res = await axios.post(this.pipelineEndpoint, payload, {
          headers,
          timeout: 15000
        });

        const audioOut = res.data?.pipelineResponse?.[0]?.audio?.[0];
        if (audioOut && audioOut.audioContent) {
          const buffer = Buffer.from(audioOut.audioContent, 'base64');
          return {
            success: true,
            audioBuffer: buffer,
            audioFormat: 'wav',
            provider: 'Bhashini TTS (IndicTTS)'
          };
        }
      } catch (bErr) {
        console.warn('Bhashini TTS notice:', bErr.response?.data?.message || bErr.message);
      }
    }

    return {
      success: false,
      audioBuffer: null,
      provider: 'Fallback'
    };
  }

  /**
   * Format language for prompt instruction
   */
  getLanguageInstruction(langCode) {
    const lang = this.languageCatalog[langCode] || this.languageCatalog['hi'];
    if (langCode === 'en') {
      return 'Respond in clear, professional English.';
    } else if (langCode === 'hinglish') {
      return 'Respond in conversational, friendly Hinglish (Hindi written in Roman English script, e.g. "Aaj ka gehun ka mandi bhav...").';
    } else if (langCode === 'hi') {
      return 'Respond in clean, respectful Hindi using Devanagari script (हिन्दी).';
    } else {
      return `Respond strictly in ${lang.name} (${lang.native}) script. Ensure all numerical prices (₹), weights (क्विंटल / किलोग्राम / kg), dates, and chemical names remain accurate and clear.`;
    }
  }
}

module.exports = new BhashiniService();

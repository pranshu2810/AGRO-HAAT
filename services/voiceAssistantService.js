const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const marketService = require('./marketIntelligenceService');
const weatherService = require('./weatherIntelligenceService');
const soilService = require('./soilIntelligenceService');
const cropService = require('./cropRecommendationService');
const bhashiniService = require('./bhashiniService');

class VoiceAssistantService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    // Priority order: ultra-fast 20B/27B models first for low-latency voice responses
    this.chatModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'allam-2-7b', 'openai/gpt-oss-120b'];
    this.whisperModel = 'whisper-large-v3';

    // Standard commodity mapping for Indian agriculture
    this.commodityKeywords = {
      'wheat': { en: 'Wheat', hi: 'गेहूं', std: 'Wheat' },
      'gehun': { en: 'Wheat', hi: 'गेहूं', std: 'Wheat' },
      'gehu': { en: 'Wheat', hi: 'गेहूं', std: 'Wheat' },
      'rice': { en: 'Paddy(Dhan)', hi: 'धान', std: 'Paddy(Dhan)' },
      'paddy': { en: 'Paddy(Dhan)', hi: 'धान', std: 'Paddy(Dhan)' },
      'dhan': { en: 'Paddy(Dhan)', hi: 'धान', std: 'Paddy(Dhan)' },
      'chawal': { en: 'Paddy(Dhan)', hi: 'धान', std: 'Paddy(Dhan)' },
      'mustard': { en: 'Mustard', hi: 'सरसों', std: 'Mustard' },
      'sarson': { en: 'Mustard', hi: 'सरसों', std: 'Mustard' },
      'cotton': { en: 'Cotton', hi: 'कपास', std: 'Cotton' },
      'kapas': { en: 'Cotton', hi: 'कपास', std: 'Cotton' },
      'soybean': { en: 'Soyabean', hi: 'सोयाबीन', std: 'Soyabean' },
      'chickpea': { en: 'Gram', hi: 'चना', std: 'Gram' },
      'chana': { en: 'Gram', hi: 'चना', std: 'Gram' },
      'gram': { en: 'Gram', hi: 'चना', std: 'Gram' },
      'potato': { en: 'Potato', hi: 'आलू', std: 'Potato' },
      'aalu': { en: 'Potato', hi: 'आलू', std: 'Potato' },
      'aloo': { en: 'Potato', hi: 'आलू', std: 'Potato' },
      'tomato': { en: 'Tomato', hi: 'टमाटर', std: 'Tomato' },
      'tamatar': { en: 'Tomato', hi: 'टमाटर', std: 'Tomato' },
      'onion': { en: 'Onion', hi: 'प्याज', std: 'Onion' },
      'pyaj': { en: 'Onion', hi: 'प्याज', std: 'Onion' },
      'pyaaz': { en: 'Onion', hi: 'प्याज', std: 'Onion' },
      'maize': { en: 'Maize', hi: 'मक्का', std: 'Maize' },
      'makka': { en: 'Maize', hi: 'मक्का', std: 'Maize' },
      'sugarcane': { en: 'Sugarcane', hi: 'गन्ना', std: 'Sugarcane' },
      'ganna': { en: 'Sugarcane', hi: 'गन्ना', std: 'Sugarcane' },
      'bajra': { en: 'Bajra(Pearl Millet)', hi: 'बाजरा', std: 'Bajra(Pearl Millet)' },
      'millet': { en: 'Bajra(Pearl Millet)', hi: 'बाजरा', std: 'Bajra(Pearl Millet)' }
    };

    // Major states & popular districts in India
    this.popularLocations = {
      'varanasi': { state: 'Uttar Pradesh', district: 'Varanasi', lat: 25.3176, lon: 82.9739 },
      'lucknow': { state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lon: 80.9462 },
      'kanpur': { state: 'Uttar Pradesh', district: 'Kanpur', lat: 26.4499, lon: 80.3319 },
      'agra': { state: 'Uttar Pradesh', district: 'Agra', lat: 27.1767, lon: 78.0081 },
      'indore': { state: 'Madhya Pradesh', district: 'Indore', lat: 22.7196, lon: 75.8577 },
      'bhopal': { state: 'Madhya Pradesh', district: 'Bhopal', lat: 23.2599, lon: 77.4126 },
      'nagpur': { state: 'Maharashtra', district: 'Nagpur', lat: 21.1458, lon: 79.0882 },
      'pune': { state: 'Maharashtra', district: 'Pune', lat: 18.5204, lon: 73.8567 },
      'nashik': { state: 'Maharashtra', district: 'Nashik', lat: 19.9975, lon: 73.7898 },
      'jaipur': { state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lon: 75.7873 },
      'kota': { state: 'Rajasthan', district: 'Kota', lat: 25.2138, lon: 75.8648 },
      'patna': { state: 'Bihar', district: 'Patna', lat: 25.5941, lon: 85.1376 },
      'ludhiana': { state: 'Punjab', district: 'Ludhiana', lat: 30.9010, lon: 75.8573 },
      'amritsar': { state: 'Punjab', district: 'Amritsar', lat: 31.6340, lon: 74.8723 },
      'karnal': { state: 'Haryana', district: 'Karnal', lat: 29.6857, lon: 76.9905 },
      'hisar': { state: 'Haryana', district: 'Hisar', lat: 29.1492, lon: 75.7217 },
      'ahmedabad': { state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
      'rajkot': { state: 'Gujarat', district: 'Rajkot', lat: 22.3039, lon: 70.8022 }
    };
  }

  /**
   * Detect language from input text or enforce user selection across Indian languages
   */
  detectLanguage(text, userPref = 'auto') {
    if (userPref && userPref !== 'auto') {
      return userPref.toLowerCase();
    }

    const trimmed = (text || '').trim();
    if (!trimmed) return 'hi';

    // 1. Check for specific Indic Unicode script ranges
    // Gurmukhi (Punjabi)
    if (/[\u0A00-\u0A7F]/.test(trimmed)) return 'pa';
    // Bengali & Assamese
    if (/[\u0980-\u09FF]/.test(trimmed)) return 'bn';
    // Gujarati
    if (/[\u0A80-\u0AFF]/.test(trimmed)) return 'gu';
    // Tamil
    if (/[\u0B80-\u0BFF]/.test(trimmed)) return 'ta';
    // Telugu
    if (/[\u0C00-\u0C7F]/.test(trimmed)) return 'te';
    // Kannada
    if (/[\u0C80-\u0CFF]/.test(trimmed)) return 'kn';
    // Malayalam
    if (/[\u0D00-\u0D7F]/.test(trimmed)) return 'ml';
    // Odia
    if (/[\u0B00-\u0B7F]/.test(trimmed)) return 'or';

    // Devanagari script (Hindi or Marathi)
    if (/[\u0900-\u097F]/.test(trimmed)) {
      // Check for distinct Marathi words
      const marathiMarkers = ['आहे', 'नाही', 'शेतकरी', 'बाजारभाव', 'पिक', 'दर', 'करावे', 'कसे', 'हवामान', 'ऊस', 'कांदा', 'सोयाबीन', 'पाहिजे'];
      const words = trimmed.split(/\s+/);
      if (words.some(w => marathiMarkers.includes(w))) {
        return 'mr';
      }
      return 'hi';
    }

    // 2. Check for common Hinglish keywords in Roman script
    const hinglishMarkers = [
      'kya', 'hai', 'kaise', 'bhav', 'mandi', 'aaj', 'kal', 'karein', 'kare',
      'kheti', 'fasal', 'barish', 'mausam', 'kitna', 'hoga', 'daalein', 'batao',
      'lagaye', 'gehun', 'chawal', 'sarson', 'tamatar', 'aalu', 'pyaj', 'kheto',
      'paani', 'rog', 'keeda', 'keede', 'dawai', 'spray', 'khad', 'bhaav', 'kisan'
    ];

    const lowerWords = trimmed.toLowerCase().split(/\s+/);
    const hinglishCount = lowerWords.filter(w => hinglishMarkers.includes(w)).length;

    if (hinglishCount >= 1) {
      return 'hinglish';
    }

    return 'en';
  }

  /**
   * Extract intent and entities from user query, taking conversation memory into account
   */
  extractEntitiesAndIntent(query, history = []) {
    const q = query.toLowerCase();

    // 1. Detect Intent (both Roman and Devanagari)
    let intent = 'general_agri';
    if (q.includes('mandi') || q.includes('मंडी') || q.includes('bhav') || q.includes('भाव') || q.includes('bhaav') || q.includes('price') || q.includes('rate') || q.includes('daam') || q.includes('दाम') || q.includes('कीमत') || q.includes('market')) {
      intent = 'mandi_price';
    } else if (q.includes('weather') || q.includes('mausam') || q.includes('मौसम') || q.includes('barish') || q.includes('बारिश') || q.includes('rain') || q.includes('tapman') || q.includes('तापमान') || q.includes('temperature') || q.includes('humidity') || q.includes('हवा')) {
      intent = 'weather_advisory';
    } else if (q.includes('soil') || q.includes('mitti') || q.includes('मिट्टी') || q.includes('npk') || q.includes('ph') || q.includes('खाद') || q.includes('यूरिया') || q.includes('nitrogen') || q.includes('phosphorus')) {
      intent = 'soil_analysis';
    } else if (q.includes('fasal') || q.includes('फसल') || q.includes('crop') || q.includes('konsi') || q.includes('कौन') || q.includes('which crop') || q.includes('boae') || q.includes('बुवाई') || q.includes('sowing') || q.includes('lagaye')) {
      intent = 'crop_recommendation';
    } else if (q.includes('keeda') || q.includes('कीड़ा') || q.includes('कीड़े') || q.includes('pest') || q.includes('insect') || q.includes('rog') || q.includes('रोग') || q.includes('disease') || q.includes('fungus') || q.includes('spray') || q.includes('स्प्रे') || q.includes('dawai') || q.includes('दवा') || q.includes('jhulsa') || q.includes('blight')) {
      intent = 'pest_disease';
    }

    // 2. Extract Commodity (supports both English, Hinglish and Hindi Devanagari)
    let detectedCommodity = null;
    for (const [key, mapping] of Object.entries(this.commodityKeywords)) {
      if (q.includes(key) || q.includes(mapping.hi) || q.includes(mapping.en.toLowerCase())) {
        detectedCommodity = mapping;
        break;
      }
    }

    // 3. Extract Location (supports English, Hinglish, and Hindi names)
    let detectedLocation = null;
    const hindiLocationMap = {
      'वाराणसी': 'varanasi',
      'बनारस': 'varanasi',
      'लखनऊ': 'lucknow',
      'कानपुर': 'kanpur',
      'आगरा': 'agra',
      'इंदौर': 'indore',
      'भोपाल': 'bhopal',
      'नागपुर': 'nagpur',
      'पुणे': 'pune',
      'नासिक': 'nashik',
      'जयपुर': 'jaipur',
      'कोटा': 'kota',
      'पटना': 'patna',
      'लुधियाना': 'ludhiana',
      'अमृतसर': 'amritsar',
      'करनाल': 'karnal',
      'हिसार': 'hisar'
    };

    for (const [hiName, locKey] of Object.entries(hindiLocationMap)) {
      if (q.includes(hiName)) {
        detectedLocation = this.popularLocations[locKey];
        break;
      }
    }

    if (!detectedLocation) {
      for (const [locKey, info] of Object.entries(this.popularLocations)) {
        if (q.includes(locKey)) {
          detectedLocation = info;
          break;
        }
      }
    }

    // Also check state mentions (English and Hindi)
    const indianStates = [
      { en: 'uttar pradesh', hi: 'उत्तर प्रदेश', state: 'Uttar Pradesh' },
      { en: 'madhya pradesh', hi: 'मध्य प्रदेश', state: 'Madhya Pradesh' },
      { en: 'rajasthan', hi: 'राजस्थान', state: 'Rajasthan' },
      { en: 'punjab', hi: 'पंजाब', state: 'Punjab' },
      { en: 'haryana', hi: 'हरियाणा', state: 'Haryana' },
      { en: 'maharashtra', hi: 'महाराष्ट्र', state: 'Maharashtra' },
      { en: 'gujarat', hi: 'गुजरात', state: 'Gujarat' },
      { en: 'bihar', hi: 'बिहार', state: 'Bihar' },
      { en: 'west bengal', hi: 'पश्चिम बंगाल', state: 'West Bengal' }
    ];

    if (!detectedLocation) {
      for (const st of indianStates) {
        if (q.includes(st.en) || q.includes(st.hi)) {
          detectedLocation = { state: st.state, district: '' };
          break;
        }
      }
    }

    // 4. Carry forward context from recent conversation history if not specified in current turn
    if ((!detectedCommodity || !detectedLocation) && history && history.length > 0) {
      for (let i = history.length - 1; i >= 0; i--) {
        const prev = history[i];
        if (!detectedCommodity && prev.entities?.commodity) {
          detectedCommodity = prev.entities.commodity;
        }
        if (!detectedLocation && prev.entities?.location) {
          detectedLocation = prev.entities.location;
        }
        if (detectedCommodity && detectedLocation) break;
      }
    }

    return {
      intent,
      commodity: detectedCommodity,
      location: detectedLocation
    };
  }

  /**
   * Fetch verified real-world agricultural data without fabrication
   */
  async fetchLiveAgriculturalContext(entities) {
    const context = {
      mandiData: null,
      weatherData: null,
      dataSource: null,
      dataTimestamp: null
    };

    try {
      // Mandi Prices
      if (entities.intent === 'mandi_price' && entities.commodity) {
        const stateName = entities.location?.state || 'Uttar Pradesh';
        const districtName = entities.location?.district || '';
        const commodityName = entities.commodity.std || entities.commodity.en;

        const prices = await marketService.getDailyMarketPrices({
          commodity: commodityName,
          state: stateName,
          district: districtName
        }).catch(() => null);

        if (prices && prices.success && prices.records && prices.records.length > 0) {
          const latest = prices.records[0];
          context.mandiData = {
            commodity: entities.commodity.en,
            commodity_hi: entities.commodity.hi,
            state: latest.state || stateName,
            mandi: latest.market || `${stateName} APMC Mandi`,
            modal_price: latest.modal_price || 0,
            min_price: latest.min_price || 0,
            max_price: latest.max_price || 0,
            date: latest.reporting_date || new Date().toISOString().split('T')[0],
            unit: 'Quintal (100 kg)',
            source: 'Agmarknet 2.0 (Official Government Mandi Network)'
          };
          context.dataSource = 'Agmarknet 2.0';
          context.dataTimestamp = context.mandiData.date;
        }
      }

      // Weather Data
      if (entities.intent === 'weather_advisory' || (entities.intent === 'crop_recommendation' && entities.location)) {
        const lat = entities.location?.lat || 26.8467;
        const lon = entities.location?.lon || 80.9462;
        const state = entities.location?.state || 'Uttar Pradesh';
        const district = entities.location?.district || 'Lucknow';

        const weather = await weatherService.getWeatherData({ lat, lon, state, district }).catch(() => null);
        if (weather && (weather.current || weather.observed)) {
          const cur = weather.current || weather.observed;
          context.weatherData = {
            location: `${district}, ${state}`,
            temperature: cur.temperature !== undefined ? cur.temperature : cur.temp,
            humidity: cur.humidity !== undefined ? cur.humidity : cur.relativeHumidity,
            condition: cur.condition || cur.weatherDescription || 'Clear',
            precipitation: cur.precipitation !== undefined ? cur.precipitation : (cur.precip_rate || 0),
            provider: weather.provider || 'Open-Meteo & IMD Agricultural API',
            last_updated: weather.last_updated || new Date().toISOString()
          };
          context.dataSource = context.weatherData.provider;
          context.dataTimestamp = context.weatherData.last_updated;
        }
      }
    } catch (err) {
      console.warn('Live agricultural context fetch warning:', err.message);
    }

    return context;
  }

  /**
   * Convert numbers and units to natural spoken words for smooth speech synthesis
   */
  formatForNaturalSpeech(text, lang = 'hi') {
    if (!text) return '';

    // Strip complex markdown artifacts, links, images, tables
    let spoken = text
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}.*?`{1,3}/g, '')
      .replace(/>\s?/g, '')
      .replace(/---+/g, '')
      .replace(/\|.*?\|/g, '')
      .trim();

    if (lang === 'en') {
      // Natural English speech substitutions
      spoken = spoken
        .replace(/₹\s?(\d+)\s?\/\s?qtl/gi, '$1 rupees per quintal')
        .replace(/(\d+)\s?\/\s?qtl/gi, '$1 rupees per quintal')
        .replace(/₹\s?(\d+)/g, '$1 rupees')
        .replace(/(\d+)\s?rs/gi, '$1 rupees')
        .replace(/(\d+)\s?qtl/gi, '$1 quintals')
        .replace(/(\d+)\s?kg/gi, '$1 kilograms')
        .replace(/(\d+)\s?°C/gi, '$1 degrees Celsius')
        .replace(/(\d+)\s?%/g, '$1 percent');
    } else {
      // Natural Indic speech substitutions (Hindi, Marathi, Punjabi, Gujarati, etc.)
      spoken = spoken
        .replace(/₹\s?(\d+)\s?\/\s?qtl/gi, '$1 रुपये प्रति क्विंटल')
        .replace(/(\d+)\s?\/\s?qtl/gi, '$1 रुपये प्रति क्विंटल')
        .replace(/₹\s?(\d+)/g, '$1 रुपये')
        .replace(/(\d+)\s?rs/gi, '$1 रुपये')
        .replace(/(\d+)\s?qtl/gi, '$1 क्विंटल')
        .replace(/(\d+)\s?kg/gi, '$1 किलो')
        .replace(/(\d+)\s?°C/gi, '$1 डिग्री सेल्सियस')
        .replace(/(\d+)\s?%/g, '$1 प्रतिशत');
    }

    // Keep spoken text natural and concise (max 3-4 sentences for voice output)
    const sentences = spoken.split(/(?<=[.!?।])\s+/);
    if (sentences.length > 4) {
      spoken = sentences.slice(0, 4).join(' ');
    }

    return spoken;
  }

  /**
   * Core unified query processor for text and voice
   */
  async processQuery({ query, language = 'auto', sessionHistory = [] }) {
    if (!query || !query.trim()) {
      return {
        text_response: 'कृपया अपना प्रश्न पूछें। (Please ask your question.)',
        spoken_response: 'कृपया अपना प्रश्न पूछें।',
        detected_language: 'hi',
        intent: 'empty',
        data_sources: [],
        bhashini_metadata: bhashiniService.getStatus(),
        language_info: bhashiniService.languageCatalog['hi']
      };
    }

    const detectedLang = this.detectLanguage(query, language);
    const entities = this.extractEntitiesAndIntent(query, sessionHistory);
    const liveContext = await this.fetchLiveAgriculturalContext(entities);

    const langInstruction = bhashiniService.getLanguageInstruction(detectedLang);

    // Build authoritative agronomist prompt with Bhashini Indic compliance
    let systemPrompt = `You are AgroHaat's AI Voice Assistant, an expert senior Indian agronomist and agricultural economist.
You serve farmers, traders, and agri-entrepreneurs with accurate, practical, and verified agricultural guidance.

CRITICAL INSTRUCTIONS:
1. LANGUAGE: ${langInstruction}
2. TRUTH & INTEGRITY: NEVER fabricate current mandi prices, weather forecasts, or economic data. Use the verified live data provided below.
3. PRESERVE ACCURACY: Retain all exact numbers, market prices (₹), quantities (quintals, kilograms), dates, and chemical names without alteration.
4. NATURAL SPOKEN CLARITY: In addition to the text response, you must provide a natural, concise spoken answer suitable for Text-to-Speech (TTS). Pronounce prices, units (quintals, kilograms, rupees), and dates clearly.
5. ACTIONABLE AGRO ADVICE: For crops or pest issues, provide exact chemical/biological doses (e.g. Neem Oil 5ml/L, Emamectin Benzoate 0.5g/L) and application timings (morning/evening).
6. CLARIFYING QUESTIONS: If a farmer asks for mandi price or weather but didn't specify the location or crop, politely ask for it rather than guessing.`;

    let dataContextMsg = '';
    const sources = [];

    if (liveContext.mandiData) {
      dataContextMsg += `\n[VERIFIED GOVERNMENT MANDI DATA (Agmarknet 2.0)]:
Commodity: ${liveContext.mandiData.commodity} (${liveContext.mandiData.commodity_hi})
Market: ${liveContext.mandiData.mandi}, ${liveContext.mandiData.state}
Modal Price: ₹${liveContext.mandiData.modal_price} / ${liveContext.mandiData.unit}
Min Price: ₹${liveContext.mandiData.min_price}, Max Price: ₹${liveContext.mandiData.max_price}
Reported Date: ${liveContext.mandiData.date}
Data Provider: ${liveContext.mandiData.source}\n`;
      sources.push('Agmarknet 2.0 (Official Government Mandi Network)');
    } else if (entities.intent === 'mandi_price' && entities.commodity && !entities.location) {
      dataContextMsg += `\n[MARKET NOTE]: User asked for ${entities.commodity.en} price but did not mention their district/mandi or state. Ask them which city or district mandi they want the price for.\n`;
    }

    if (liveContext.weatherData) {
      dataContextMsg += `\n[VERIFIED LIVE WEATHER OBSERVATION]:
Location: ${liveContext.weatherData.location}
Temperature: ${liveContext.weatherData.temperature}°C
Humidity: ${liveContext.weatherData.humidity}%
Precipitation Rate: ${liveContext.weatherData.precipitation} mm/h
Condition: ${liveContext.weatherData.condition}
Observation Source: ${liveContext.weatherData.provider} (${liveContext.weatherData.last_updated})\n`;
      sources.push(liveContext.weatherData.provider);
    }

    // Build chat messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...sessionHistory.slice(-4).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: `Farmer Query: "${query}"\n${dataContextMsg}\nProvide a helpful answer. End with a JSON block at the very end in format: {"spoken": "..."} containing the concise, natural spoken script for voice readout.` }
    ];

    let fullAnswer = null;
    let spokenScript = null;

    // Call Groq LLM
    if (this.apiKey) {
      for (const model of this.chatModels) {
        try {
          const res = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: model,
              messages: messages,
              temperature: 0.6,
              max_tokens: 1500
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`
              },
              timeout: 15000
            }
          );

          if (res.data?.choices?.[0]?.message?.content) {
            fullAnswer = res.data.choices[0].message.content.trim();
            break;
          }
        } catch (err) {
          console.warn(`Groq model ${model} failed in voice assistant:`, err.response?.data?.error?.message || err.message);
        }
      }
    }

    // Fallback if LLM unavailable
    if (!fullAnswer) {
      fullAnswer = this.getLocalFallbackResponse(query, entities, liveContext, detectedLang);
    }

    // Extract spoken script if embedded as JSON block at end
    const jsonMatch = fullAnswer.match(/\{[\s\S]*"spoken"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        spokenScript = parsed.spoken;
        fullAnswer = fullAnswer.replace(jsonMatch[0], '').trim();
      } catch (e) {}
    }

    if (!spokenScript) {
      spokenScript = this.formatForNaturalSpeech(fullAnswer, detectedLang);
    }

    return {
      text_response: fullAnswer,
      spoken_response: spokenScript,
      detected_language: detectedLang,
      intent: entities.intent,
      entities: {
        commodity: entities.commodity,
        location: entities.location
      },
      data_sources: sources,
      bhashini_metadata: bhashiniService.getStatus(),
      language_info: bhashiniService.languageCatalog[detectedLang] || { code: detectedLang, name: detectedLang }
    };
  }

  /**
   * Deterministic agricultural fallback engine when external LLM is unreachable
   */
  getLocalFallbackResponse(query, entities, liveContext, lang) {
    if (entities.intent === 'mandi_price') {
      if (liveContext.mandiData) {
        const m = liveContext.mandiData;
        if (lang === 'hi') {
          return `📊 **सत्यापित मंडी भाव (${m.commodity_hi}):**\n\n- **मंडी:** ${m.mandi} (${m.state})\n- **मॉडल भाव:** **₹${m.modal_price}** प्रति क्विंटल\n- **न्यूनतम / अधिकतम:** ₹${m.min_price} - ₹${m.max_price}\n- **दिनांक:** ${m.date}\n- **स्रोत:** ${m.source}\n\n*नोट: यह सरकारी एगमार्कनेट नेटवर्क से सत्यापित वास्तविक भाव है।*`;
        } else if (lang === 'hinglish') {
          return `📊 **Mandi Bhav Update (${m.commodity}):**\n\n- **Mandi:** ${m.mandi} (${m.state})\n- **Modal Rate:** **₹${m.modal_price}** per quintal\n- **Min - Max:** ₹${m.min_price} - ₹${m.max_price}\n- **Date:** ${m.date}\n- **Source:** ${m.source}`;
        } else {
          return `📊 **Verified Mandi Price (${m.commodity}):**\n\n- **Market:** ${m.mandi} (${m.state})\n- **Modal Price:** **₹${m.modal_price}** per quintal\n- **Range:** ₹${m.min_price} - ₹${m.max_price}\n- **Date:** ${m.date}\n- **Source:** ${m.source}`;
        }
      } else {
        if (lang === 'hi') {
          return `कृपया मुझे उस जिले या मंडी का नाम बताएं जिसके भाव आप जानना चाहते हैं (उदाहरण: वाराणसी में गेहूं का भाव)।`;
        } else {
          return `Please specify the district or mandi name you would like the price for (e.g., "Wheat price in Varanasi").`;
        }
      }
    }

    if (entities.intent === 'weather_advisory') {
      if (liveContext.weatherData) {
        const w = liveContext.weatherData;
        if (lang === 'hi') {
          return `🌦️ **मौसम पूर्वानुमान (${w.location}):**\n\n- **तापमान:** ${w.temperature}°C\n- **हवा में नमी (आर्द्रता):** ${w.humidity}%\n- **मौसम स्थिति:** ${w.condition}\n- **डेटा स्रोत:** ${w.provider}\n\n*कृषि सुझाव:* मौसम के अनुकूल समय पर ही कीटनाशक या खाद का छिड़काव करें।`;
        } else {
          return `🌦️ **Agricultural Weather Advisory (${w.location}):**\n\n- **Temperature:** ${w.temperature}°C\n- **Relative Humidity:** ${w.humidity}%\n- **Condition:** ${w.condition}\n- **Source:** ${w.provider}`;
        }
      }
    }

    if (lang === 'hi') {
      return `नमस्ते किसान भाई! मैं एग्रो-हाट का बहुभाषी AI वॉइस असिस्टेंट हूँ। आप मुझसे मंडी भाव, मौसम, फसल चयन या कीट नियंत्रण के बारे में बोलकर या लिखकर पूछ सकते हैं।`;
    } else if (lang === 'hinglish') {
      return `Namaste! Main AgroHaat ka AI Voice Assistant hoon. Aap mujhse mandi bhav, mausam, fasal salah aur keeda rog ke baare me pooch sakte hain.`;
    } else {
      return `Hello! I am your AgroHaat AI Voice Assistant. You can ask me about mandi prices, live weather, crop recommendations, or pest management by typing or speaking naturally.`;
    }
  }

  /**
   * Transcribe speech audio using Bhashini IndicWav2Vec ASR or Groq Whisper (whisper-large-v3)
   */
  async transcribeAudio(audioBuffer, mimeType = 'audio/webm', languageHint = '') {
    // 1. Try Digital India Bhashini ASR if configured
    if (bhashiniService.isConfigured() && audioBuffer) {
      try {
        const bhashiniRes = await bhashiniService.transcribeAudio({
          audioBase64: audioBuffer.toString('base64'),
          language: languageHint || 'hi',
          audioFormat: mimeType.includes('wav') ? 'wav' : 'webm'
        });
        if (bhashiniRes && bhashiniRes.success && bhashiniRes.transcript) {
          return {
            text: bhashiniRes.transcript,
            language: languageHint || 'hi',
            provider: bhashiniRes.provider
          };
        }
      } catch (bErr) {
        console.warn('Bhashini ASR delegation notice:', bErr.message);
      }
    }

    // 2. Fallback to Groq Whisper
    if (!this.apiKey) {
      throw new Error('Neither Bhashini credentials nor GROQ_API_KEY is configured on the server.');
    }

    const form = new FormData();
    form.append('model', this.whisperModel);
    
    // Choose appropriate file extension based on mimeType
    let ext = 'webm';
    if (mimeType.includes('wav')) ext = 'wav';
    else if (mimeType.includes('mp4') || mimeType.includes('m4a')) ext = 'm4a';
    else if (mimeType.includes('ogg')) ext = 'ogg';
    else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) ext = 'mp3';

    form.append('file', new Blob([audioBuffer], { type: mimeType }), `speech.${ext}`);

    if (languageHint && languageHint !== 'auto' && languageHint !== 'hinglish') {
      const whisperSupported = ['hi', 'en', 'bn', 'gu', 'mr', 'pa', 'ta', 'te', 'ur', 'kn', 'ml'];
      if (whisperSupported.includes(languageHint)) {
        form.append('language', languageHint);
      } else {
        form.append('language', 'hi');
      }
    }

    // Set temperature to 0 for deterministic, clean transcription without hallucination
    form.append('temperature', '0');
    form.append('response_format', 'json');

    const res = await axios.post(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      form,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        },
        timeout: 20000
      }
    );

    return {
      text: res.data?.text ? res.data.text.trim() : '',
      language: res.data?.language || languageHint || 'auto',
      provider: 'Groq Whisper-large-v3'
    };
  }

  /**
   * Generate Text-to-Speech audio stream buffer (Bhashini IndicTTS or Indic Multi-Chunk Concatenator)
   */
  async generateSpeechAudio(text, lang = 'hi') {
    // 1. Try Digital India Bhashini IndicTTS if configured
    if (bhashiniService.isConfigured()) {
      try {
        const bhashiniTts = await bhashiniService.synthesizeSpeech({
          text,
          language: lang
        });
        if (bhashiniTts && bhashiniTts.success && bhashiniTts.audioBuffer) {
          return {
            buffer: bhashiniTts.audioBuffer,
            contentType: 'audio/wav',
            provider: 'Bhashini IndicTTS'
          };
        }
      } catch (bErr) {
        console.warn('Bhashini TTS delegation notice:', bErr.message);
      }
    }

    // 2. High-Clarity Multi-Chunk Indic Audio Concatenator
    const cleanText = this.formatForNaturalSpeech(text, lang);
    const supportedIndic = ['hi', 'en', 'bn', 'gu', 'kn', 'ml', 'mr', 'ta', 'te', 'pa'];
    const targetLang = supportedIndic.includes(lang) ? lang : (lang === 'hinglish' ? 'hi' : 'hi');
    
    // Split into chunks of maximum 120 characters on space boundaries
    const words = cleanText.split(/\s+/);
    const chunks = [];
    let current = '';

    for (const w of words) {
      if ((current + ' ' + w).length > 120) {
        if (current) chunks.push(current.trim());
        current = w;
      } else {
        current = current ? current + ' ' + w : w;
      }
    }
    if (current) chunks.push(current.trim());

    // Take up to 4 chunks to keep speech prompt and concise
    const limitedChunks = chunks.slice(0, 4);
    const audioBuffers = [];

    for (const chunk of limitedChunks) {
      if (!chunk.trim()) continue;
      try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          responseType: 'arraybuffer',
          timeout: 8000
        });
        if (response.data && response.data.length > 0) {
          audioBuffers.push(Buffer.from(response.data));
        }
      } catch (chunkErr) {
        console.warn('TTS chunk fetch notice:', chunkErr.message);
      }
    }

    if (audioBuffers.length === 0) {
      throw new Error('Could not generate audio stream for text.');
    }

    return {
      buffer: Buffer.concat(audioBuffers),
      contentType: 'audio/mpeg',
      provider: 'Indic Multi-Chunk Concatenator'
    };
  }
}

module.exports = new VoiceAssistantService();

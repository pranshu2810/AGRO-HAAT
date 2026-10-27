import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from '../../components/GlassCard';
import { LanguagePill } from '../../components/LanguagePill';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS, SIZES } from '../../constants/theme';

export default function CropRecommendationScreen({ navigation }) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [season, setSeason] = useState('rabi'); // 'kharif', 'rabi', 'zaid'
  const [soil, setSoil] = useState('alluvial'); // 'alluvial', 'black', 'red', 'sandy'
  const [water, setWater] = useState('moderate'); // 'high', 'moderate', 'low'
  const [acres, setAcres] = useState('2.5');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const CROP_MODELS = {
    'rabi-alluvial': {
      cropEn: 'Sharbati Wheat (HD-3086) + Mustard (Pusa Bold)',
      cropHi: 'शरबती गेहूं (HD-3086) + सरसों (पूसा बोल्ड)',
      yieldEn: '22 - 25 Quintals / Acre',
      yieldHi: '22 - 25 क्विंटल प्रति एकड़',
      profitEn: '₹55,000 - ₹68,000 / Acre',
      profitHi: '₹55,000 - ₹68,000 प्रति एकड़',
      whyEn: 'Alluvial soil provides ideal root aeration and water retention for winter Rabi cereals. Mustard intercropping boosts net farm income by 25%.',
      whyHi: 'जलोढ़ मिट्टी रबी की फसलों के लिए सर्वोत्तम नमी व पोषण प्रदान करती है। गेहूं के साथ सरसों की सह-फसली खेती से 25% अधिक लाभ मिलता है।',
      sowingEn: 'Sowing Window: 1 Nov to 20 Nov. Seed Rate: 40 kg Wheat, 1.5 kg Mustard per acre.',
      sowingHi: 'बुवाई का समय: 1 से 20 नवंबर। बीज दर: 40 किग्रा गेहूं, 1.5 किग्रा सरसों प्रति एकड़।',
      protocolEn: 'Treat seed with Trichoderma viride (5g/kg) and Azotobacter (250g/10kg seed) before drilling.',
      protocolHi: 'बुवाई से पहले बीज को ट्राइकोडर्मा विरिडी (5g/kg) और एजोटोबैक्टर कल्चर से बीजोपचार अवश्य करें।',
    },
    'rabi-black': {
      cropEn: 'Gram / Chickpea (JG-11) + Linseed',
      cropHi: 'चना (JG-11) + अलसी',
      yieldEn: '10 - 14 Quintals / Acre',
      yieldHi: '10 - 14 क्विंटल प्रति एकड़',
      profitEn: '₹48,000 - ₹62,000 / Acre',
      profitHi: '₹48,000 - ₹62,000 प्रति एकड़',
      whyEn: 'Black cotton soil holds residual monsoon moisture deep in root zones, perfectly suited for drought-hardy pulses.',
      whyHi: 'काली मिट्टी में मानसून की नमी गहराई तक संरक्षित रहती है, जो दलहनी फसलों (चने) के लिए सर्वोत्तम है।',
      sowingEn: 'Sowing Window: 15 Oct to 10 Nov. Seed Rate: 30-35 kg/acre with 30cm row spacing.',
      sowingHi: 'बुवाई का समय: 15 अक्टूबर से 10 नवंबर। बीज दर: 30-35 किग्रा प्रति एकड़।',
      protocolEn: 'Treat seed with Rhizobium leguminosarum culture to maximize atmospheric nitrogen fixation.',
      protocolHi: 'राइजोबियम कल्चर (Rhizobium) से बीज उपचारित करें ताकि प्राकृतिक नाइट्रोजन मिले।',
    },
    'kharif-alluvial': {
      cropEn: 'Basmati Paddy (Pusa 1121 / 1509)',
      cropHi: 'बासमती धान (पूसा 1121 / 1509)',
      yieldEn: '18 - 22 Quintals / Acre',
      yieldHi: '18 - 22 क्विंटल प्रति एकड़',
      profitEn: '₹72,000 - ₹85,000 / Acre',
      profitHi: '₹72,000 - ₹85,000 प्रति एकड़',
      whyEn: 'High fertility alluvial loams in northern plains yield premium aroma and long grains commanding peak mandi prices.',
      whyHi: 'उपजाऊ दोमट जलोढ़ मिट्टी में बासमती का उत्कृष्ट दाना और सुगंध तैयार होती है, जिसका मंडी में सबसे ऊंचा भाव मिलता है।',
      sowingEn: 'Transplant 21-day nursery seedlings between 25 June and 15 July.',
      sowingHi: 'रोपाई: 25 जून से 15 जुलाई के बीच 21 दिन की पौध की रोपाई करें।',
      protocolEn: 'Maintain 2-3 inches standing water during initial 4 weeks and apply balanced Zinc Sulphate.',
      protocolHi: 'शुरुआती 4 सप्ताह 2-3 इंच पानी रखें और जिंक सल्फेट (10 kg/एकड़) का प्रयोग करें।',
    },
    'kharif-black': {
      cropEn: 'Bt Cotton (Bollgard II) + Soybean Intercrop',
      cropHi: 'बीटी कपास (बोलगार्ड II) + सोयाबीन',
      yieldEn: '12 - 15 Quintals Cotton / Acre',
      yieldHi: '12 - 15 क्विंटल कपास प्रति एकड़',
      profitEn: '₹65,000 - ₹80,000 / Acre',
      profitHi: '₹65,000 - ₹80,000 प्रति एकड़',
      whyEn: 'Deep black soil supports the deep taproot system of cotton while retaining optimum monsoon moisture.',
      whyHi: 'गहरी काली मिट्टी कपास की मूसला जड़ प्रणाली को मजबूत बनाती है और लंबे समय तक नमी बनाए रखती है।',
      sowingEn: 'Sow with onset of monsoon showers (June). Spacing: 90 x 60 cm.',
      sowingHi: 'मानसून की पहली बारिश (जून) के साथ 90 x 60 सेमी की दूरी पर बुवाई करें।',
      protocolEn: 'Apply Single Super Phosphate (100 kg/acre) at sowing and install 5 pheromone traps.',
      protocolHi: 'बुवाई के समय 100 kg SSP डालें और गुलाबी सुंडी से बचाव हेतु 5 फेरोमोन ट्रैप लगाएं।',
    },
    'zaid-alluvial': {
      cropEn: 'Hybrid Watermelon (Kiran) & Cucumber',
      cropHi: 'तरबूज (किरण) एवं खीरा',
      yieldEn: '180 - 220 Quintals / Acre',
      yieldHi: '180 - 220 क्विंटल प्रति एकड़',
      profitEn: '₹90,000 - ₹1,20,000 / Acre (65 Days)',
      profitHi: '₹90,000 - ₹1,20,000 प्रति एकड़ (मात्र 65 दिन)',
      whyEn: 'Warm sunny weather and light alluvial soil facilitate rapid vine growth and high brix sweetness sugar content.',
      whyHi: 'गर्मी की धूप और जलोढ़ मिट्टी में बेल वाली फसलें मात्र 65 दिनों में बंपर पैदावार और उच्च मिठास देती हैं।',
      sowingEn: 'Sowing Window: 15 Feb to 15 March. Seed Rate: 1.5 kg/acre with silver-black mulch.',
      sowingHi: 'बुवाई: 15 फरवरी से 15 मार्च। सिल्वर-ब्लैक मल्चिंग शीट पर ड्रिप से खेती करें।',
      protocolEn: 'Use 25-micron plastic mulch and drip irrigation fertigation with 19:19:19 water soluble fertilizer.',
      protocolHi: 'सिल्वर मल्चिंग का प्रयोग करें और ड्रिप से 19:19:19 घुलनशील खाद दें।',
    },
  };

  const runRecommendation = () => {
    setLoading(true);
    setTimeout(() => {
      const key = `${season}-${soil}`;
      const rec = CROP_MODELS[key] || CROP_MODELS['rabi-alluvial'];
      setResult(rec);
      setLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('FarmerDashboard')} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color="#ffffff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>
              {isHi ? '🌾 एआई सटीक फसल अनुशंसा' : '🌾 AI Precision Crop Advisory'}
            </Text>
            <Text style={styles.headerSub}>
              {isHi ? 'मृदा एवं मौसम अनुकूलतम फसल चयन' : 'Soil, Weather & Market Suitability Intelligence'}
            </Text>
          </View>
          <LanguagePill />
        </View>

        {/* Input Parameters Card */}
        <GlassCard style={styles.formCard}>
          {/* Season Selector */}
          <Text style={styles.label}>{isHi ? '1. बुवाई का मौसम (Season):' : '1. Cultivation Season:'}</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, season === 'kharif' && styles.chipActive]}
              onPress={() => setSeason('kharif')}
            >
              <Text style={styles.chipIcon}>🌧️</Text>
              <Text style={[styles.chipText, season === 'kharif' && styles.chipTextActive]}>
                {isHi ? 'खरीफ (मानसून)' : 'Kharif (Monsoon)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, season === 'rabi' && styles.chipActive]}
              onPress={() => setSeason('rabi')}
            >
              <Text style={styles.chipIcon}>❄️</Text>
              <Text style={[styles.chipText, season === 'rabi' && styles.chipTextActive]}>
                {isHi ? 'रबी (सर्दियां)' : 'Rabi (Winter)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, season === 'zaid' && styles.chipActive]}
              onPress={() => setSeason('zaid')}
            >
              <Text style={styles.chipIcon}>☀️</Text>
              <Text style={[styles.chipText, season === 'zaid' && styles.chipTextActive]}>
                {isHi ? 'जायद (गर्मी)' : 'Zaid (Summer)'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Soil Type Selector */}
          <Text style={styles.label}>{isHi ? '2. खेत की मिट्टी का प्रकार (Soil):' : '2. Soil Classification:'}</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, soil === 'alluvial' && styles.chipActive]}
              onPress={() => setSoil('alluvial')}
            >
              <Text style={styles.chipIcon}>🟤</Text>
              <Text style={[styles.chipText, soil === 'alluvial' && styles.chipTextActive]}>
                {isHi ? 'जलोढ़ दोमट' : 'Alluvial Loam'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, soil === 'black' && styles.chipActive]}
              onPress={() => setSoil('black')}
            >
              <Text style={styles.chipIcon}>⬛</Text>
              <Text style={[styles.chipText, soil === 'black' && styles.chipTextActive]}>
                {isHi ? 'काली मिट्टी' : 'Black Cotton'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, soil === 'red' && styles.chipActive]}
              onPress={() => setSoil('red')}
            >
              <Text style={styles.chipIcon}>🔴</Text>
              <Text style={[styles.chipText, soil === 'red' && styles.chipTextActive]}>
                {isHi ? 'लाल मिट्टी' : 'Red Soil'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Water Availability */}
          <Text style={styles.label}>{isHi ? '3. सिंचाई की उपलब्धता (Water):' : '3. Irrigation Facility:'}</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, water === 'high' && styles.chipActive]}
              onPress={() => setWater('high')}
            >
              <Text style={styles.chipIcon}>🌊</Text>
              <Text style={[styles.chipText, water === 'high' && styles.chipTextActive]}>
                {isHi ? 'नहरी / प्रचुर' : 'Canal / High'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, water === 'moderate' && styles.chipActive]}
              onPress={() => setWater('moderate')}
            >
              <Text style={styles.chipIcon}>⚡</Text>
              <Text style={[styles.chipText, water === 'moderate' && styles.chipTextActive]}>
                {isHi ? 'ट्यूबवेल / मध्यम' : 'Tubewell / Normal'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, water === 'low' && styles.chipActive]}
              onPress={() => setWater('low')}
            >
              <Text style={styles.chipIcon}>🌧️</Text>
              <Text style={[styles.chipText, water === 'low' && styles.chipTextActive]}>
                {isHi ? 'वर्षा आधारित' : 'Rainfed'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Farm Size */}
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>{isHi ? 'खेत का क्षेत्रफल (एकड़ में):' : 'Cultivated Area (Acres):'}</Text>
            <TextInput
              style={styles.input}
              value={acres}
              onChangeText={setAcres}
              keyboardType="numeric"
              placeholder="2.5"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={runRecommendation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Ionicons name="sparkles" size={16} color="#ffffff" />
                <Text style={styles.submitBtnText}>
                  {isHi ? 'एआई फसल अनुशंसा प्राप्त करें' : 'Generate AI Crop Recommendation'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </GlassCard>

        {/* Results Card */}
        {result && (
          <View style={styles.resultsWrap}>
            <GlassCard heavy style={styles.resultCard}>
              <View style={styles.resBadge}>
                <Ionicons name="ribbon" size={14} color="#10b981" />
                <Text style={styles.resBadgeText}>
                  {isHi ? '⭐ सर्वोत्तम लाभप्रद फसल' : '⭐ Top Recommended High-Profit Crop'}
                </Text>
              </View>

              <Text style={styles.resCropTitle}>{isHi ? result.cropHi : result.cropEn}</Text>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLbl}>{isHi ? 'अनुमानित पैदावार' : 'Est. Yield'}</Text>
                  <Text style={styles.statVal}>{isHi ? result.yieldHi : result.yieldEn}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLbl}>{isHi ? 'अनुमानित मुनाफा' : 'Est. Net Return'}</Text>
                  <Text style={[styles.statVal, { color: '#10b981' }]}>
                    {isHi ? result.profitHi : result.profitEn}
                  </Text>
                </View>
              </View>

              {/* Agronomic Rationale */}
              <View style={styles.detailCard}>
                <Text style={styles.detailHeading}>{isHi ? '💡 वैज्ञानिक कारण:' : '💡 Agronomic Rationale:'}</Text>
                <Text style={styles.detailBody}>{isHi ? result.whyHi : result.whyEn}</Text>
              </View>

              {/* Sowing & Seed Guidance */}
              <View style={styles.detailCard}>
                <Text style={styles.detailHeading}>{isHi ? '📅 बुवाई एवं बीज दर:' : '📅 Sowing & Seed Rate:'}</Text>
                <Text style={styles.detailBody}>{isHi ? result.sowingHi : result.sowingEn}</Text>
              </View>

              {/* Seed Treatment */}
              <View style={styles.detailCard}>
                <Text style={styles.detailHeading}>{isHi ? '🛡️ बीजोपचार विधि:' : '🛡️ Certified Seed Treatment:'}</Text>
                <Text style={styles.detailBody}>{isHi ? result.protocolHi : result.protocolEn}</Text>
              </View>

              {/* Action buttons */}
              <View style={styles.resActionRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('MandiPrices')}
                >
                  <FontAwesome5 name="chart-line" size={13} color="#ffffff" />
                  <Text style={styles.actionBtnText}>{isHi ? 'ताज़ा मंडी भाव' : 'Live Mandi Rates'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#16a34a' }]}
                  onPress={() => navigation.navigate('SoilAnalysis')}
                >
                  <Ionicons name="flask" size={14} color="#ffffff" />
                  <Text style={styles.actionBtnText}>{isHi ? 'मिट्टी जांचें' : 'Check Soil NPK'}</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  formCard: {
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
    marginTop: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  chipActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.22)',
    borderColor: COLORS.primary,
  },
  chipIcon: {
    fontSize: 13,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#16a34a',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  resultsWrap: {
    marginTop: 4,
  },
  resultCard: {
    padding: 16,
    marginBottom: 16,
  },
  resBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    gap: 6,
    marginBottom: 8,
  },
  resBadgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
  },
  resCropTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statLbl: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
  },
  detailCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 8,
  },
  detailHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryLight,
    marginBottom: 4,
  },
  detailBody: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 17,
  },
  resActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});

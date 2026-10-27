import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from '../../components/GlassCard';
import { LanguagePill } from '../../components/LanguagePill';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS, SIZES } from '../../constants/theme';

export default function SoilAnalysisScreen({ navigation }) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [nitrogen, setNitrogen] = useState('140');
  const [phosphorus, setPhosphorus] = useState('42');
  const [potassium, setPotassium] = useState('180');
  const [ph, setPh] = useState('6.8');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Compute dynamic analysis based on user inputs
  const computeSoilAnalysis = () => {
    setAnalyzing(true);

    setTimeout(() => {
      const n = parseFloat(nitrogen) || 0;
      const p = parseFloat(phosphorus) || 0;
      const k = parseFloat(potassium) || 0;
      const phVal = parseFloat(ph) || 7.0;

      // Calculate health score (0-100)
      let score = 100;
      let deficiencies = [];
      let schedule = [];
      let chemicalSchedule = [];

      // Nitrogen Evaluation (Ideal: 140 - 280 kg/ha)
      if (n < 120) {
        score -= 22;
        deficiencies.push(isHi ? 'गंभीर नाइट्रोजन की कमी (पत्तियों का पीला पड़ना)' : 'Nitrogen Deficient (Low vegetative vigor)');
        schedule.push(isHi ? 'बुवाई पूर्व ढैंचा (Dhaincha) हरी खाद या 2 टन/एकड़ वर्मीकम्पोस्ट मिलाएं।' : 'Apply Green Manure (Dhaincha) or 2 tonnes/acre vermicompost.');
        chemicalSchedule.push(isHi ? 'नीम-लेपित यूरिया (45 kg/एकड़) 2 बराबर भागों में (बुवाई एवं कल्ले फूटते समय)।' : 'Neem Coated Urea (45 kg/acre) in 2 split doses (Basal & Tillering).');
      } else if (n > 320) {
        score -= 10;
        deficiencies.push(isHi ? 'अत्यधिक नाइट्रोजन (कीट व रोग का जोखिम)' : 'Excess Nitrogen (Risk of lodging & pest attack)');
      }

      // Phosphorus Evaluation (Ideal: 35 - 60 kg/ha)
      if (p < 30) {
        score -= 20;
        deficiencies.push(isHi ? 'फास्फोरस की कमी (जड़ों का कमज़ोर विकास)' : 'Phosphorus Deficient (Stunted root elongation)');
        schedule.push(isHi ? 'PSB (फास्फेट सोल्यूबिलाइजिंग बैक्टीरिया) 2 kg/एकड़ खाद में मिलाकर दें।' : 'Inoculate with Phosphate Solubilizing Bacteria (PSB) @ 2 kg/acre.');
        chemicalSchedule.push(isHi ? 'सिंगल सुपर फास्फेट (SSP 100 kg/एकड़) या DAP (50 kg/एकड़) बुवाई के समय।' : 'Single Super Phosphate (SSP 100 kg/acre) as basal application.');
      }

      // Potassium Evaluation (Ideal: 150 - 280 kg/ha)
      if (k < 140) {
        score -= 18;
        deficiencies.push(isHi ? 'पोटैशियम की कमी (सूखा व पाला सहने में दुर्बल)' : 'Potassium Deficient (Poor drought tolerance)');
        chemicalSchedule.push(isHi ? 'म्यूरेट ऑफ पोटाश (MOP 25 kg/एकड़) बुवाई से पहले खेत में मिलाएं।' : 'Apply Muriate of Potash (MOP 25 kg/acre) before sowing.');
      }

      // pH Evaluation (Ideal: 6.2 - 7.5)
      if (phVal < 6.0) {
        score -= 25;
        deficiencies.push(isHi ? 'अम्लीय मृदा pH < 6.0 (पोषक तत्व लॉक हो जाते हैं)' : 'Acidic Soil (Nutrient fixation hazard)');
        schedule.push(isHi ? 'खेत की जुताई के समय 150-200 kg/एकड़ कृषि चूना (Agricultural Lime) मिलाएं।' : 'Apply Agricultural Lime (150-200 kg/acre) 3 weeks before sowing.');
      } else if (phVal > 7.8) {
        score -= 20;
        deficiencies.push(isHi ? 'क्षारीय मृदा pH > 7.8 (जिप्सम की आवश्यकता)' : 'Alkaline Soil (Requires gypsum amendment)');
        schedule.push(isHi ? 'कृषि जिप्सम (250 kg/एकड़) खेत में डालकर पानी भरें।' : 'Apply Agricultural Gypsum (250 kg/acre) with standing water.');
      }

      if (deficiencies.length === 0) {
        deficiencies.push(isHi ? 'मृदा संतुलित एवं उपजाऊ है (उत्तम स्वास्थ्य)' : 'Soil nutrients are optimal & well-balanced');
        schedule.push(isHi ? 'नियमित जीवामृत व 1 टन वर्मीकम्पोस्ट का प्रयोग पर्याप्त है।' : 'Regular Jeevamrutha and 1 tonne/acre compost maintains peak fertility.');
        chemicalSchedule.push(isHi ? 'मानक संतुलित NPK 12:32:16 (40 kg/एकड़) बुवाई पर दें।' : 'Standard balanced NPK 12:32:16 (40 kg/acre) at sowing.');
      }

      const finalScore = Math.max(25, Math.min(98, score));
      let healthTag = isHi ? 'उत्तम स्वास्थ्य' : 'Optimal Health';
      let healthColor = '#10b981';

      if (finalScore < 50) {
        healthTag = isHi ? 'अत्यधिक दुर्बल' : 'Severely Depleted';
        healthColor = '#ef4444';
      } else if (finalScore < 75) {
        healthTag = isHi ? 'मध्यम उर्वरता' : 'Moderate Fertility';
        healthColor = '#f59e0b';
      }

      setAnalysisResult({
        score: finalScore,
        healthTag,
        healthColor,
        deficiencies,
        schedule,
        chemicalSchedule,
        n, p, k, phVal,
      });

      setAnalyzing(false);
    }, 1200);
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
              {isHi ? '🌱 मृदा स्वास्थ्य एवं एन-पी-के विश्लेषण' : '🌱 Soil Health & N-P-K Analysis'}
            </Text>
            <Text style={styles.headerSub}>
              {isHi ? 'स्मार्ट फर्टिलाइज़र कैलकुलेटर' : 'Smart Fertilizer & Bio-Dosage Calculator'}
            </Text>
          </View>
          <LanguagePill />
        </View>

        {/* Form Inputs */}
        <GlassCard style={styles.formCard}>
          <Text style={styles.cardHeading}>
            {isHi ? 'मृदा परीक्षण पैरामीटर दर्ज करें:' : 'Enter Soil Lab Test Values:'}
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>{isHi ? 'नाइट्रोजन (N) kg/ha' : 'Nitrogen (N) kg/ha'}</Text>
              <TextInput
                style={styles.input}
                value={nitrogen}
                onChangeText={setNitrogen}
                keyboardType="numeric"
                placeholder="140"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.inputCol}>
              <Text style={styles.label}>{isHi ? 'फास्फोरस (P) kg/ha' : 'Phosphorus (P) kg/ha'}</Text>
              <TextInput
                style={styles.input}
                value={phosphorus}
                onChangeText={setPhosphorus}
                keyboardType="numeric"
                placeholder="42"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>{isHi ? 'पोटैशियम (K) kg/ha' : 'Potassium (K) kg/ha'}</Text>
              <TextInput
                style={styles.input}
                value={potassium}
                onChangeText={setPotassium}
                keyboardType="numeric"
                placeholder="180"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.inputCol}>
              <Text style={styles.label}>{isHi ? 'मृदा pH मान (0-14)' : 'Soil pH Level (0-14)'}</Text>
              <TextInput
                style={styles.input}
                value={ph}
                onChangeText={setPh}
                keyboardType="numeric"
                placeholder="6.8"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>
          </View>

          {/* Quick preset buttons */}
          <Text style={styles.presetLabel}>
            {isHi ? 'त्वरित प्रीसेट टेस्ट:' : 'Quick Presets:'}
          </Text>
          <View style={styles.presetRow}>
            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => {
                setNitrogen('85');
                setPhosphorus('22');
                setPotassium('120');
                setPh('5.6');
              }}
            >
              <Text style={styles.presetBtnText}>{isHi ? 'कमज़ोर / अम्लीय' : 'Depleted'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => {
                setNitrogen('180');
                setPhosphorus('48');
                setPotassium('210');
                setPh('6.8');
              }}
            >
              <Text style={styles.presetBtnText}>{isHi ? 'संतुलित / उपजाऊ' : 'Balanced'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => {
                setNitrogen('140');
                setPhosphorus('18');
                setPotassium('160');
                setPh('8.2');
              }}
            >
              <Text style={styles.presetBtnText}>{isHi ? 'क्षारीय मिट्टी' : 'Alkaline'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.analyzeBtn, analyzing && { opacity: 0.7 }]}
            onPress={computeSoilAnalysis}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Ionicons name="sparkles" size={16} color="#ffffff" />
                <Text style={styles.analyzeBtnText}>
                  {isHi ? 'एआई मृदा विश्लेषण एवं खुराक तैयार करें' : 'Compute AI Soil Diagnostics'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </GlassCard>

        {/* Dynamic Results */}
        {analysisResult && (
          <View style={styles.resultsWrap}>
            <GlassCard heavy style={styles.resultCard}>
              <View style={styles.scoreRow}>
                <View style={[styles.scoreCircle, { borderColor: analysisResult.healthColor }]}>
                  <Text style={[styles.scoreText, { color: analysisResult.healthColor }]}>
                    {analysisResult.score}%
                  </Text>
                  <Text style={styles.scoreSub}>{analysisResult.healthTag}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.resTitle}>
                    {isHi ? 'मृदा स्वास्थ्य सूचकांक' : 'Fertility Status'}
                  </Text>
                  <Text style={styles.resDesc}>
                    {isHi
                      ? `N: ${analysisResult.n} • P: ${analysisResult.p} • K: ${analysisResult.k} • pH: ${analysisResult.phVal}`
                      : `NPK: ${analysisResult.n}-${analysisResult.p}-${analysisResult.k} kg/ha (pH ${analysisResult.phVal})`}
                  </Text>
                  {analysisResult.deficiencies.map((item, idx) => (
                    <Text key={idx} style={styles.defItem}>• {item}</Text>
                  ))}
                </View>
              </View>
            </GlassCard>

            {/* Organic Advisory Card */}
            <GlassCard style={styles.advisoryCard}>
              <Text style={styles.advTitle}>
                {isHi ? '🌿 अनुशंसित जैविक खाद एवं सुधारक:' : '🌿 Organic & Bio-Fertilizer Schedule:'}
              </Text>
              {analysisResult.schedule.map((item, idx) => (
                <View key={idx} style={styles.advRow}>
                  <Ionicons name="leaf" size={14} color="#10b981" style={{ marginTop: 2 }} />
                  <Text style={styles.advText}>{item}</Text>
                </View>
              ))}
            </GlassCard>

            {/* Chemical Spray Schedule */}
            <GlassCard style={styles.advisoryCard}>
              <Text style={styles.advTitle}>
                {isHi ? '🧪 रासायनिक पोषक तत्व खुराक (NPK Balancing):' : '🧪 Targeted Inorganic Nutrients:'}
              </Text>
              {analysisResult.chemicalSchedule.map((item, idx) => (
                <View key={idx} style={styles.advRow}>
                  <MaterialCommunityIcons name="flask-outline" size={15} color="#f59e0b" style={{ marginTop: 2 }} />
                  <Text style={styles.advText}>{item}</Text>
                </View>
              ))}
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
  cardHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputCol: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 6,
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
  },
  presetLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    marginBottom: 6,
    fontWeight: '600',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  presetBtnText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '700',
  },
  analyzeBtn: {
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
  analyzeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  resultsWrap: {
    marginTop: 4,
  },
  resultCard: {
    padding: 16,
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '900',
  },
  scoreSub: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  resTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  resDesc: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 6,
  },
  defItem: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
  },
  advisoryCard: {
    padding: 14,
    marginBottom: 12,
  },
  advTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  advRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  advText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 17,
  },
});

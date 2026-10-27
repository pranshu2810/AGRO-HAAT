import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/GlassCard';
import { LanguagePill } from '../../components/LanguagePill';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS, SIZES } from '../../constants/theme';

export default function MandiPricesScreen({ navigation }) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMandi, setSelectedMandi] = useState('all');

  const MANDI_ITEMS = [
    {
      cropEn: 'Wheat (Sharbati Grade A)',
      cropHi: 'शरबती गेहूं (ग्रेड A)',
      mandi: 'Karnal Mandi',
      mandiCode: 'karnal',
      state: 'Haryana',
      price: '₹2,425 / Qtl',
      minMax: 'Min: ₹2,380 • Max: ₹2,480',
      change: '+₹45',
      up: true,
      directAdvantage: '+₹425/Qtl more on Agro-Haat Direct',
    },
    {
      cropEn: 'Mustard (Pusa Bold)',
      cropHi: 'सरसों (पूसा बोल्ड)',
      mandi: 'Jaipur Mandi',
      mandiCode: 'jaipur',
      state: 'Rajasthan',
      price: '₹5,650 / Qtl',
      minMax: 'Min: ₹5,500 • Max: ₹5,750',
      change: '+₹110',
      up: true,
      directAdvantage: '+₹650/Qtl more on Agro-Haat Direct',
    },
    {
      cropEn: 'Basmati Paddy (Pusa 1121)',
      cropHi: 'बासमती धान (पूसा 1121)',
      mandi: 'Amritsar Mandi',
      mandiCode: 'amritsar',
      state: 'Punjab',
      price: '₹3,890 / Qtl',
      minMax: 'Min: ₹3,750 • Max: ₹3,980',
      change: '-₹30',
      up: false,
      directAdvantage: '+₹510/Qtl more on Agro-Haat Direct',
    },
    {
      cropEn: 'Vine Tomatoes (देसी टमाटर)',
      cropHi: 'देसी टमाटर (लाल पके)',
      mandi: 'Azadpur Mandi',
      mandiCode: 'azadpur',
      state: 'Delhi NCR',
      price: '₹1,850 / Qtl',
      minMax: 'Min: ₹1,600 • Max: ₹2,100',
      change: '+₹80',
      up: true,
      directAdvantage: '+₹13/kg more on Agro-Haat Direct',
    },
    {
      cropEn: 'Potato (Chipsona / Pukhraj)',
      cropHi: 'आलू (चिप्सोना / पुखराज)',
      mandi: 'Agra Mandi',
      mandiCode: 'agra',
      state: 'Uttar Pradesh',
      price: '₹1,240 / Qtl',
      minMax: 'Min: ₹1,180 • Max: ₹1,320',
      change: '-₹15',
      up: false,
      directAdvantage: '+₹360/Qtl more on Agro-Haat Direct',
    },
    {
      cropEn: 'Red Onion (नासिक लाल प्याज)',
      cropHi: 'लाल प्याज (मध्यम साइज)',
      mandi: 'Nasik Mandi',
      mandiCode: 'nasik',
      state: 'Maharashtra',
      price: '₹2,100 / Qtl',
      minMax: 'Min: ₹1,950 • Max: ₹2,300',
      change: '+₹65',
      up: true,
      directAdvantage: '+₹500/Qtl more on Agro-Haat Direct',
    },
    {
      cropEn: 'Cotton / Kapas (Medium Staple)',
      cropHi: 'कपास (मध्यम रेशा)',
      mandi: 'Sirsa Mandi',
      mandiCode: 'karnal',
      state: 'Haryana',
      price: '₹7,150 / Qtl',
      minMax: 'Min: ₹6,950 • Max: ₹7,350',
      change: '+₹140',
      up: true,
      directAdvantage: '+₹850/Qtl more on Agro-Haat Direct',
    },
  ];

  const filteredMandiItems = MANDI_ITEMS.filter((item) => {
    const matchesMandi = selectedMandi === 'all' || item.mandiCode === selectedMandi;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.cropEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cropHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mandi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMandi && matchesSearch;
  });

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
              {isHi ? '📈 लाइव दैनिक मंडी भाव (APMC)' : '📈 Live APMC Mandi Price Benchmarks'}
            </Text>
            <Text style={styles.headerSub}>
              {isHi ? 'सरकारी एवं निजी मंडियों के ताज़ा भाव' : 'Real-time Daily Market Benchmark Rates'}
            </Text>
          </View>
          <LanguagePill />
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color="rgba(255,255,255,0.4)" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={isHi ? 'फसल या मंडी खोजें (गेहूं, टमाटर, करनाल...)' : 'Search crop or mandi (Wheat, Tomato...)'}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Mandi Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mandiScroll}>
          {[
            { id: 'all', label: isHi ? 'सभी मंडियां' : 'All Mandis' },
            { id: 'karnal', label: 'Karnal' },
            { id: 'azadpur', label: 'Azadpur (Delhi)' },
            { id: 'jaipur', label: 'Jaipur' },
            { id: 'agra', label: 'Agra' },
            { id: 'nasik', label: 'Nasik' },
          ].map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.mandiChip, selectedMandi === m.id && styles.mandiChipActive]}
              onPress={() => setSelectedMandi(m.id)}
            >
              <Text style={[styles.mandiChipText, selectedMandi === m.id && styles.mandiChipTextActive]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sell Direct Banner */}
        <GlassCard heavy style={styles.bannerCard}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>0% Middleman Commission</Text>
          </View>
          <Text style={styles.bannerHeading}>
            {isHi ? 'मंडी के भाव से 25% अधिक में बेचें' : 'Get up to 25% Higher than Mandi Rates'}
          </Text>
          <Text style={styles.bannerSub}>
            {isHi
              ? 'बिचौलियों और आढ़ती की 6% आढ़त व भाड़ा बचाएं। सीधे शहरी परिवारों और एग्रो-हाट सब्सक्रिप्शन बास्केट में आपूर्ति करें।'
              : 'Directly supply to urban residential societies and subscriber baskets on Agro-Haat with guaranteed 24-hour payouts.'}
          </Text>
          <TouchableOpacity
            style={styles.listProductBtn}
            onPress={() => navigation.navigate('FarmerMarketplace')}
          >
            <FontAwesome5 name="store" size={14} color="#ffffff" />
            <Text style={styles.listProductBtnText}>
              {isHi ? 'सीधा किसान बाज़ार में बेचें' : 'List Harvest on Direct Market'}
            </Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Mandi Rates List */}
        <Text style={styles.listHeading}>
          {isHi ? 'दैनिक औसत मंडी दरें (₹ प्रति क्विंटल):' : "Today's APMC Mandi Rates (₹ / Quintal):"}
        </Text>

        <View style={styles.ratesList}>
          {filteredMandiItems.map((item, index) => (
            <GlassCard key={index} style={styles.rateCard}>
              <View style={styles.rateTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cropName}>{isHi ? item.cropHi : item.cropEn}</Text>
                  <Text style={styles.mandiName}>{item.mandi} • {item.state}</Text>
                  <Text style={styles.minMaxText}>{item.minMax}</Text>
                </View>

                <View style={styles.priceCol}>
                  <Text style={styles.priceText}>{item.price}</Text>
                  <View style={[styles.trendBadge, { backgroundColor: item.up ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                    <Ionicons
                      name={item.up ? 'trending-up' : 'trending-down'}
                      size={12}
                      color={item.up ? '#10b981' : '#ef4444'}
                    />
                    <Text style={[styles.trendText, { color: item.up ? '#10b981' : '#ef4444' }]}>
                      {item.change}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.directAdvantageBox}>
                <Ionicons name="sparkles" size={12} color={COLORS.primaryLight} />
                <Text style={styles.directAdvText}>{item.directAdvantage}</Text>
              </View>
            </GlassCard>
          ))}
        </View>
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
    marginBottom: 14,
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
  },
  mandiScroll: {
    marginBottom: 14,
  },
  mandiChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginRight: 8,
  },
  mandiChipActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.22)',
    borderColor: COLORS.primary,
  },
  mandiChipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
  mandiChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  bannerCard: {
    padding: 16,
    marginBottom: 16,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 8,
  },
  bannerBadgeText: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '800',
  },
  bannerHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 17,
    marginBottom: 12,
  },
  listProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  listProductBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  listHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  ratesList: {
    gap: 10,
  },
  rateCard: {
    padding: 14,
  },
  rateTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cropName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  mandiName: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
  },
  minMaxText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '800',
  },
  directAdvantageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  directAdvText: {
    fontSize: 10.5,
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
});

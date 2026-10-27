import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from '../../components/GlassCard';
import { LanguagePill } from '../../components/LanguagePill';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS, SIZES } from '../../constants/theme';

export default function FarmerMarketplaceScreen({ navigation }) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [modalVisible, setModalVisible] = useState(false);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const [myListings, setMyListings] = useState([
    {
      id: 'lst-1',
      nameEn: 'Fresh Vine Tomatoes (देसी टमाटर)',
      nameHi: 'ताज़ा देसी टमाटर (प्राकृतिक पके)',
      category: 'Vegetables',
      qty: '120 kg available',
      price: '₹35 / kg',
      mandiBenchmark: '₹22 / kg at Azadpur (You save +₹13/kg)',
      statusEn: 'Active in Market',
      statusHi: 'बाज़ार में लाइव',
      statusColor: '#10b981',
      ordersCount: 4,
      views: 48,
    },
    {
      id: 'lst-2',
      nameEn: 'Sharbati Wheat (शरबती गेहूं)',
      nameHi: 'शुद्ध शरबती गेहूं (ग्रेड A)',
      category: 'Grains',
      qty: '8 Quintals',
      price: '₹2,850 / Qtl',
      mandiBenchmark: '₹2,425 at Karnal Mandi (You save +₹425/Qtl)',
      statusEn: 'Active in Market',
      statusHi: 'बाज़ार में लाइव',
      statusColor: '#10b981',
      ordersCount: 2,
      views: 35,
    },
    {
      id: 'lst-3',
      nameEn: 'Organic Spinach (पालक)',
      nameHi: 'ऑर्गेनिक हरी पालक',
      category: 'Vegetables',
      qty: '40 kg',
      price: '₹40 / kg',
      mandiBenchmark: '₹25 / kg at Local Mandi',
      statusEn: 'Batch Dispatched',
      statusHi: 'हब को रवाना',
      statusColor: '#38bdf8',
      ordersCount: 8,
      views: 62,
    },
  ]);

  const handleAddProduct = () => {
    if (!productName.trim() || !price.trim() || !quantity.trim()) {
      Alert.alert(isHi ? 'विवरण भरें' : 'Incomplete Form', isHi ? 'कृपया फसल का नाम, मात्रा और मूल्य भरें।' : 'Please enter crop name, quantity, and price.');
      return;
    }

    const newListing = {
      id: `lst-${Date.now()}`,
      nameEn: productName,
      nameHi: productName,
      category,
      qty: `${quantity} ${unit}`,
      price: `₹${price} / ${unit}`,
      mandiBenchmark: isHi ? 'सीधा परिवार डिलीवरी • 0% कमीशन' : 'Direct Family Dispatch • 0% Cut',
      statusEn: 'Active in Market',
      statusHi: 'बाज़ार में लाइव',
      statusColor: '#10b981',
      ordersCount: 0,
      views: 1,
    };

    setMyListings([newListing, ...myListings]);
    setModalVisible(false);
    setProductName('');
    setQuantity('');
    setPrice('');
    setToastMsg(isHi ? 'फसल सफलतापूर्वक बाज़ार में सूचीबद्ध हुई!' : 'Harvest listed directly in marketplace!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const deleteListing = (id) => {
    setMyListings(myListings.filter(item => item.id !== id));
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
              {isHi ? '🛒 सीधा किसान बाज़ार (Direct Market)' : '🛒 Direct Farmer Marketplace'}
            </Text>
            <Text style={styles.headerSub}>
              {isHi ? 'बिना आढ़ती 0% कमीशन • 24 घंटे में सीधा भुगतान' : 'Sell Direct to Urban Families • 0% Middleman Cut'}
            </Text>
          </View>
          <LanguagePill />
        </View>

        {/* Toast alert */}
        {toastMsg ? (
          <View style={styles.toast}>
            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            <Text style={styles.toastText}>{toastMsg}</Text>
          </View>
        ) : null}

        {/* Value Proposition GlassCard */}
        <GlassCard heavy style={styles.bannerCard}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>0% Middleman Commission</Text>
          </View>
          <Text style={styles.bannerHeading}>
            {isHi ? 'अपनी फसल सीधे शहरी परिवारों को बेचें' : 'Sell Harvest Directly to Verified Buyers'}
          </Text>
          <Text style={styles.bannerDesc}>
            {isHi
              ? 'मंडी के आढ़ती व दलालों के कमीशन से बचें। एग्रो-हाट पर सीधे ग्राहकों को बेचकर 25-30% अधिक शुद्ध लाभ पाएं।'
              : 'Skip APMC broker deductions and transit loss. List your crop here to get automatic fulfillment orders to local collection hubs.'}
          </Text>

          <TouchableOpacity style={styles.listBtn} onPress={() => setModalVisible(true)}>
            <FontAwesome5 name="plus-circle" size={15} color="#ffffff" />
            <Text style={styles.listBtnText}>
              {isHi ? '+ नई फसल बिक्री के लिए जोड़ें' : '+ List New Harvest for Sale'}
            </Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Listings Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>
            {isHi ? 'आपकी सक्रिय फसलें (Active Listings):' : 'Your Live Marketplace Harvest:'}
          </Text>
          <Text style={styles.listingCount}>{myListings.length} {isHi ? 'फसलें' : 'Items'}</Text>
        </View>

        {myListings.map((item) => (
          <GlassCard key={item.id} style={styles.listingCard}>
            <View style={styles.listingTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cropTitle}>{isHi ? item.nameHi : item.nameEn}</Text>
                <Text style={styles.cropQty}>{item.qty} • {item.category}</Text>
              </View>

              <View style={[styles.statusTag, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={[styles.statusTagText, { color: item.statusColor }]}>
                  {isHi ? item.statusHi : item.statusEn}
                </Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>{isHi ? 'आपका सीधा विक्रय मूल्य:' : 'Your Direct Sale Price:'}</Text>
                <Text style={styles.priceVal}>{item.price}</Text>
              </View>
              <View style={styles.statsMini}>
                <Text style={styles.statMiniText}>👁️ {item.views} {isHi ? 'व्यूज़' : 'Views'}</Text>
                <Text style={styles.statMiniText}>📦 {item.ordersCount} {isHi ? 'ऑर्डर' : 'Orders'}</Text>
              </View>
            </View>

            <View style={styles.benchmarkBox}>
              <Ionicons name="trending-up" size={14} color="#10b981" />
              <Text style={styles.benchmarkText}>{item.mandiBenchmark}</Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.delBtn}
                onPress={() => deleteListing(item.id)}
              >
                <Feather name="trash-2" size={14} color="#ef4444" />
                <Text style={styles.delBtnText}>{isHi ? 'हटाएं' : 'Remove'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manageBtn}
                onPress={() => navigation.navigate('OrdersPayout')}
              >
                <Ionicons name="receipt-outline" size={14} color="#ffffff" />
                <Text style={styles.manageBtnText}>{isHi ? 'ऑर्डर देखें' : 'View Orders'}</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        ))}
      </ScrollView>

      {/* Add Produce Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard heavy style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isHi ? 'नई फसल लिस्ट करें' : 'List Harvest for Sale'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>{isHi ? 'फसल का नाम (Crop Name):' : 'Crop / Vegetable Name:'}</Text>
              <TextInput
                style={styles.input}
                value={productName}
                onChangeText={setProductName}
                placeholder={isHi ? 'जैसे: देसी टमाटर, शरबती गेहूं' : 'e.g. Vine Tomatoes, Organic Spinach'}
                placeholderTextColor="rgba(255,255,255,0.4)"
              />

              <Text style={styles.inputLabel}>{isHi ? 'श्रेणी (Category):' : 'Category:'}</Text>
              <View style={styles.catRow}>
                {['Vegetables', 'Grains', 'Fruits', 'Organic'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, category === cat && styles.catChipActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1.2, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>{isHi ? 'उपलब्ध मात्रा:' : 'Quantity Available:'}</Text>
                  <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder="100"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{isHi ? 'इकाई:' : 'Unit:'}</Text>
                  <View style={styles.unitRow}>
                    {['kg', 'Qtl'].map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitChip, unit === u && styles.unitChipActive]}
                        onPress={() => setUnit(u)}
                      >
                        <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>{isHi ? 'आपका अपेक्षित मूल्य (₹ / इकाई):' : 'Direct Price (₹ / unit):'}</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder={unit === 'kg' ? '35' : '2800'}
                placeholderTextColor="rgba(255,255,255,0.4)"
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleAddProduct}>
                <Ionicons name="checkmark-done" size={16} color="#ffffff" />
                <Text style={styles.saveBtnText}>{isHi ? 'बाज़ार में लाइव करें' : 'Publish Directly'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>
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
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
  },
  bannerCard: {
    padding: 18,
    marginBottom: 18,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 8,
  },
  bannerBadgeText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  bannerHeading: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  bannerDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 18,
    marginBottom: 14,
  },
  listBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  listBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
  },
  listingCount: {
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  listingCard: {
    padding: 16,
    marginBottom: 14,
  },
  listingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cropTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  cropQty: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.55)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  priceVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10b981',
  },
  statsMini: {
    flexDirection: 'row',
    gap: 10,
  },
  statMiniText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  benchmarkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  benchmarkText: {
    fontSize: 11.5,
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  delBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  delBtnText: {
    color: '#ef4444',
    fontSize: 11.5,
    fontWeight: '700',
  },
  manageBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  manageBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(12, 34, 21, 0.98)',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 10,
  },
  catRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  catChipActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderColor: COLORS.primary,
  },
  catChipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
  },
  unitRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  unitChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  unitChipActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderColor: COLORS.primary,
  },
  unitChipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  unitChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});

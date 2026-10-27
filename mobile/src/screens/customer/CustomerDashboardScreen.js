import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GlassCard } from '../../components/GlassCard';
import { LanguagePill } from '../../components/LanguagePill';
import { COLORS, SIZES } from '../../constants/theme';

export default function CustomerDashboardScreen({ navigation }) {
  const { user, switchRole, addToCart, cart } = useAuth();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const featuredProduce = [
    { id: '1', name: 'Fresh Organic Spinach', hindiName: 'देसी पालक', price: 40, unit: '500g', emoji: '🥬', farmer: 'Karan Farm (Karnal)' },
    { id: '2', name: 'Vine-Ripened Tomatoes', hindiName: 'लाल टमाटर', price: 35, unit: '1 kg', emoji: '🍅', farmer: 'Vikas Organic (Sonipat)' },
    { id: '3', name: 'Fresh Green Cauliflower', hindiName: 'फूलगोभी', price: 45, unit: '1 pc', emoji: '🥦', farmer: 'Sharma Greens (Rohtak)' },
    { id: '4', name: 'Crisp Farm Carrots', hindiName: 'गाजर', price: 50, unit: '1 kg', emoji: '🥕', farmer: 'Saini Farm (Panipat)' },
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <View>
            <View style={styles.brandRow}>
              <View style={styles.brandBadge}>
                <Ionicons name="basket" size={16} color="#ffffff" />
              </View>
              <Text style={styles.brandText}>AGRO<Text style={{ color: COLORS.customerLightBlue }}>HAAT</Text></Text>
            </View>
            <Text style={styles.greetingText}>{t('welcome_customer')}, {user?.fullname || 'Customer'}! 🛒</Text>
            <Text style={styles.subGreetingText}>{t('customer_tagline')}</Text>
          </View>

          <View style={styles.headerActions}>
            <LanguagePill />
            <TouchableOpacity style={styles.roleSwitchBtn} onPress={switchRole}>
              <FontAwesome5 name="sync-alt" size={11} color={COLORS.primaryLight} />
              <Text style={styles.roleSwitchText}>{t('role_farmer')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_placeholder')}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.amber }]}>16</Text>
            <Text style={styles.statLbl}>{t('avail_items')}</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.customerLightBlue }]}>5</Text>
            <Text style={styles.statLbl}>{t('your_orders')}</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.primaryLight }]}>100%</Text>
            <Text style={styles.statLbl}>{t('guarantee')}</Text>
          </GlassCard>
        </View>

        {/* Subscription Feature Banner */}
        <GlassCard heavy style={styles.subBanner}>
          <View style={styles.subBannerTop}>
            <View style={styles.subTag}>
              <Text style={styles.subTagText}>Convenient Doorstep Delivery</Text>
            </View>
            <Text style={styles.subPrice}>From ₹49/day</Text>
          </View>
          <Text style={styles.subTitle}>Weekly Family Fresh Basket</Text>
          <Text style={styles.subDesc}>
            Chemical-free, farm-fresh vegetables and cooking greens delivered twice a week directly to your kitchen.
          </Text>
          <TouchableOpacity
            style={styles.subBtn}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Text style={styles.subBtnText}>Explore Subscription Plans</Text>
            <Feather name="arrow-right" size={14} color="#ffffff" />
          </TouchableOpacity>
        </GlassCard>

        {/* Popular Fresh Veggies Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Today's Farm Harvest</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.produceGrid}>
          {featuredProduce.map((item) => (
            <GlassCard key={item.id} style={styles.produceCard}>
              <Text style={styles.produceEmoji}>{item.emoji}</Text>
              <Text style={styles.produceName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.produceHindi}>{item.hindiName}</Text>
              <Text style={styles.produceFarmer}>{item.farmer}</Text>

              <View style={styles.produceBottom}>
                <View>
                  <Text style={styles.producePrice}>₹{item.price}</Text>
                  <Text style={styles.produceUnit}>/ {item.unit}</Text>
                </View>

                <TouchableOpacity
                  style={styles.addCartBtn}
                  onPress={() => addToCart(item)}
                >
                  <Feather name="plus" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingTop: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  brandBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.customerBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  greetingText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  subGreetingText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    maxWidth: 220,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  roleSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  roleSwitchText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#ffffff',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLbl: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  subBanner: {
    padding: 18,
    marginBottom: 22,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  subBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subTagText: {
    color: COLORS.customerLightBlue,
    fontSize: 10,
    fontWeight: '700',
  },
  subPrice: {
    color: COLORS.amber,
    fontSize: 13,
    fontWeight: '800',
  },
  subTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  subDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  subBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.customerBlue,
    paddingVertical: 11,
    borderRadius: 10,
  },
  subBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  seeAllText: {
    color: COLORS.customerLightBlue,
    fontSize: 12,
    fontWeight: '700',
  },
  produceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  produceCard: {
    width: '48%',
    padding: 12,
  },
  produceEmoji: {
    fontSize: 34,
    marginBottom: 6,
  },
  produceName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 1,
  },
  produceHindi: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },
  produceFarmer: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginBottom: 10,
  },
  produceBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
  },
  producePrice: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  produceUnit: {
    color: COLORS.textMuted,
    fontSize: 9,
  },
  addCartBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

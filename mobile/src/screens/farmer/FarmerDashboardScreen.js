import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GlassCard } from '../../components/GlassCard';
import { LanguagePill } from '../../components/LanguagePill';
import { COLORS, SIZES } from '../../constants/theme';

export default function FarmerDashboardScreen({ navigation }) {
  const { user, switchRole } = useAuth();
  const { t, language } = useLanguage();
  const isHi = language === 'hi';
  const [selectedStage, setSelectedStage] = useState('all');

  const tools = [
    // Stage 1
    {
      id: 'crop',
      stage: 'pre',
      stageBadge: t('stage_1_badge'),
      title: t('tool_crop_title'),
      desc: t('tool_crop_desc'),
      icon: 'seedling',
      iconType: 'FontAwesome5',
      color: '#22c55e',
      screen: 'CropRecommendation',
    },
    {
      id: 'soil',
      stage: 'pre',
      stageBadge: t('stage_1_badge'),
      title: t('tool_soil_title'),
      desc: t('tool_soil_desc'),
      icon: 'flask-outline',
      iconType: 'Ionicons',
      color: '#f59e0b',
      screen: 'SoilAnalysis',
    },
    {
      id: 'weather',
      stage: 'pre',
      stageBadge: t('stage_1_badge'),
      title: t('tool_weather_title'),
      desc: t('tool_weather_desc'),
      icon: 'weather-partly-cloudy',
      iconType: 'MaterialCommunityIcons',
      color: '#06b6d4',
      screen: 'Weather',
    },
    {
      id: 'machinery',
      stage: 'pre',
      stageBadge: t('stage_1_badge'),
      title: t('tool_machinery_title'),
      desc: t('tool_machinery_desc'),
      icon: 'tractor',
      iconType: 'FontAwesome5',
      color: '#38bdf8',
      screen: 'Machinery',
      params: { initialCategory: 'prep' },
    },

    // Stage 2
    {
      id: 'pest',
      stage: 'mid',
      stageBadge: t('stage_2_badge'),
      title: t('tool_pest_title'),
      desc: t('tool_pest_desc'),
      icon: 'shield-virus',
      iconType: 'FontAwesome5',
      color: '#f43f5e',
      screen: 'PestScanner',
    },
    {
      id: 'support',
      stage: 'mid',
      stageBadge: t('stage_2_badge'),
      title: t('tool_support_title'),
      desc: t('tool_support_desc'),
      icon: 'chatbubbles-outline',
      iconType: 'Ionicons',
      color: '#a855f7',
      screen: 'SoilAnalysis',
    },
    {
      id: 'irrigation',
      stage: 'mid',
      stageBadge: t('stage_2_badge'),
      title: t('tool_irrigation_title'),
      desc: t('tool_irrigation_desc'),
      icon: 'water-outline',
      iconType: 'Ionicons',
      color: '#0284c7',
      screen: 'Weather',
    },
    {
      id: 'nutrient',
      stage: 'mid',
      stageBadge: t('stage_2_badge'),
      title: t('tool_nutrient_title'),
      desc: t('tool_nutrient_desc'),
      icon: 'spray-can',
      iconType: 'FontAwesome5',
      color: '#eab308',
      screen: 'SoilAnalysis',
    },

    // Stage 3
    {
      id: 'mandi',
      stage: 'post',
      stageBadge: t('stage_3_badge'),
      title: t('tool_mandi_title'),
      desc: t('tool_mandi_desc'),
      icon: 'chart-line',
      iconType: 'FontAwesome5',
      color: '#10b981',
      screen: 'MandiPrices',
    },
    {
      id: 'market',
      stage: 'post',
      stageBadge: t('stage_3_badge'),
      title: t('tool_market_title'),
      desc: t('tool_market_desc'),
      icon: 'storefront-outline',
      iconType: 'Ionicons',
      color: '#22c55e',
      screen: 'FarmerMarketplace',
    },
    {
      id: 'orders',
      stage: 'post',
      stageBadge: t('stage_3_badge'),
      title: t('tool_orders_title'),
      desc: t('tool_orders_desc'),
      icon: 'receipt-outline',
      iconType: 'Ionicons',
      color: '#f59e0b',
      screen: 'OrdersPayout',
    },
    {
      id: 'harvester',
      stage: 'post',
      stageBadge: t('stage_3_badge'),
      title: t('tool_harvester_title'),
      desc: t('tool_harvester_desc'),
      icon: 'truck-pickup',
      iconType: 'FontAwesome5',
      color: '#8b5cf6',
      screen: 'Machinery',
      params: { initialCategory: 'harvest' },
    },
  ];

  const filteredTools = selectedStage === 'all'
    ? tools
    : tools.filter(item => item.stage === selectedStage);

  const renderIcon = (item) => {
    if (item.iconType === 'Ionicons') {
      return <Ionicons name={item.icon} size={22} color={item.color} />;
    }
    if (item.iconType === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />;
    }
    return <FontAwesome5 name={item.icon} size={20} color={item.color} />;
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <View>
            <View style={styles.brandRow}>
              <View style={styles.brandBadge}>
                <Ionicons name="leaf" size={16} color="#ffffff" />
              </View>
              <Text style={styles.brandText}>AGRO<Text style={{ color: COLORS.primaryLight }}>HAAT</Text></Text>
            </View>
            <Text style={styles.greetingText}>{t('welcome_farmer')}, {user?.fullname || 'Farmer'} 🌾</Text>
            <Text style={styles.subGreetingText}>{t('farmer_tagline')}</Text>
          </View>

          <View style={styles.headerActions}>
            <LanguagePill />
            <TouchableOpacity style={styles.roleSwitchBtn} onPress={switchRole}>
              <FontAwesome5 name="sync-alt" size={11} color={COLORS.customerLightBlue} />
              <Text style={styles.roleSwitchText}>{t('role_customer')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Action Chips */}
        <Text style={styles.sectionHeading}>{t('quick_actions')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('PestScanner')}
          >
            <FontAwesome5 name="shield-virus" size={14} color="#f43f5e" />
            <Text style={styles.actionChipText}>{t('action_scan')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('Weather')}
          >
            <Ionicons name="cloud-outline" size={15} color="#06b6d4" />
            <Text style={styles.actionChipText}>{t('action_weather')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('MandiPrices')}
          >
            <FontAwesome5 name="chart-line" size={14} color="#10b981" />
            <Text style={styles.actionChipText}>{t('action_prices')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('Machinery', { initialCategory: 'prep' })}
          >
            <FontAwesome5 name="tractor" size={14} color="#38bdf8" />
            <Text style={styles.actionChipText}>{isHi ? 'मशीनरी' : 'Machinery'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('FarmerMarketplace')}
          >
            <Ionicons name="storefront-outline" size={15} color="#22c55e" />
            <Text style={styles.actionChipText}>{isHi ? 'डायरेक्ट बाज़ार' : 'Marketplace'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('OrdersPayout')}
          >
            <Ionicons name="receipt-outline" size={15} color="#f59e0b" />
            <Text style={styles.actionChipText}>{isHi ? 'ऑर्डर व पेआउट' : 'Orders'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('CropRecommendation')}
          >
            <FontAwesome5 name="seedling" size={14} color="#22c55e" />
            <Text style={styles.actionChipText}>{isHi ? 'फसल सुझाव' : 'Crops'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('SoilAnalysis')}
          >
            <Ionicons name="flask-outline" size={15} color="#f59e0b" />
            <Text style={styles.actionChipText}>{t('action_soil')}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Stats Grid - Interactive (2 clean rows to prevent Android flexWrap overlap) */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statTouch}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('FarmerMarketplace')}
            >
              <GlassCard style={styles.statCard}>
                <Text style={[styles.statNumber, { color: COLORS.primaryLight }]}>12</Text>
                <Text style={styles.statLabel}>{t('stat_active_products')}</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statTouch}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('OrdersPayout')}
            >
              <GlassCard style={styles.statCard}>
                <Text style={[styles.statNumber, { color: COLORS.customerLightBlue }]}>28</Text>
                <Text style={styles.statLabel}>{t('stat_total_orders')}</Text>
              </GlassCard>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statTouch}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('OrdersPayout')}
            >
              <GlassCard style={styles.statCard}>
                <Text style={[styles.statNumber, { color: COLORS.amber }]}>₹42,850</Text>
                <Text style={styles.statLabel}>{t('stat_month_rev')}</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statTouch}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('OrdersPayout')}
            >
              <GlassCard style={styles.statCard}>
                <Text style={[styles.statNumber, { color: COLORS.violet }]}>142</Text>
                <Text style={styles.statLabel}>{t('stat_units_sold')}</Text>
              </GlassCard>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stage Filter Tabs */}
        <Text style={styles.sectionHeading}>Agricultural Lifecycle Stages</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageTabsScroll}>
          <TouchableOpacity
            style={[styles.stageTab, selectedStage === 'all' && styles.stageTabActive]}
            onPress={() => setSelectedStage('all')}
          >
            <Text style={[styles.stageTabText, selectedStage === 'all' && styles.stageTabTextActive]}>
              {t('stage_all')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.stageTab, selectedStage === 'pre' && styles.stageTabActive]}
            onPress={() => setSelectedStage('pre')}
          >
            <Text style={[styles.stageTabText, selectedStage === 'pre' && styles.stageTabTextActive]}>
              {t('stage_1')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.stageTab, selectedStage === 'mid' && styles.stageTabActive]}
            onPress={() => setSelectedStage('mid')}
          >
            <Text style={[styles.stageTabText, selectedStage === 'mid' && styles.stageTabTextActive]}>
              {t('stage_2')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.stageTab, selectedStage === 'post' && styles.stageTabActive]}
            onPress={() => setSelectedStage('post')}
          >
            <Text style={[styles.stageTabText, selectedStage === 'post' && styles.stageTabTextActive]}>
              {t('stage_3')}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Tool Cards */}
        <View style={styles.toolCardsList}>
          {filteredTools.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => (item.params ? navigation.navigate(item.screen, item.params) : navigation.navigate(item.screen))}
            >
              <GlassCard style={styles.toolCard}>
                <View style={styles.toolTopRow}>
                  <View style={[styles.toolIconBox, { backgroundColor: `${item.color}20`, borderColor: `${item.color}50` }]}>
                    {renderIcon(item)}
                  </View>
                  <View style={styles.stageTag}>
                    <Text style={styles.stageTagText}>{item.stageBadge}</Text>
                  </View>
                </View>

                <Text style={styles.toolTitle}>{item.title}</Text>
                <Text style={styles.toolDesc}>{item.desc}</Text>

                <TouchableOpacity
                  style={[styles.toolBtn, { backgroundColor: item.color }]}
                  onPress={() => (item.params ? navigation.navigate(item.screen, item.params) : navigation.navigate(item.screen))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.toolBtnText}>{t('btn_explore')}</Text>
                  <Feather name="arrow-right" size={14} color="#ffffff" />
                </TouchableOpacity>
              </GlassCard>
            </TouchableOpacity>
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
    marginBottom: 20,
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
    backgroundColor: COLORS.primary,
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
    backgroundColor: 'rgba(2, 132, 199, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  roleSwitchText: {
    color: COLORS.customerLightBlue,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeading: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  chipsScroll: {
    marginBottom: 18,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginRight: 10,
  },
  actionChipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  statsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statTouch: {
    flex: 1,
  },
  statCard: {
    padding: 16,
    borderRadius: 16,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  stageTabsScroll: {
    marginBottom: 16,
  },
  stageTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginRight: 8,
  },
  stageTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  stageTabText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  stageTabTextActive: {
    color: '#ffffff',
  },
  toolCardsList: {
    gap: 12,
  },
  toolCard: {
    padding: 16,
    borderRadius: 18,
  },
  toolTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  toolIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stageTagText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  toolTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  toolDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  toolBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

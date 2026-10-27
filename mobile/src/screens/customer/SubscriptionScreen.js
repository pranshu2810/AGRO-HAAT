import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/GlassCard';
import { LanguagePill } from '../../components/LanguagePill';
import { COLORS, SIZES } from '../../constants/theme';

export default function SubscriptionScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState('weekly');

  const plans = [
    {
      id: 'daily',
      title: 'Daily Fresh Pack',
      price: '₹49',
      period: '/ day',
      desc: 'Essential daily cooking greens & vegetables',
      features: [
        'Fresh seasonal vegetables daily',
        'Morning farm harvest guarantee',
        '100% free doorstep delivery',
        'Pause or cancel anytime',
      ],
      popular: false,
    },
    {
      id: 'weekly',
      title: 'Weekly Family Basket',
      price: '₹99',
      period: '/ week',
      desc: 'Ideal for a family of 3-5 members',
      features: [
        '6-8 varieties of seasonal produce',
        'Delivered twice a week',
        'Fixed price guarantee (no surge)',
        'Custom veggie swap options',
        'Dedicated hub coordinator',
      ],
      popular: true,
    },
    {
      id: 'monthly',
      title: 'Monthly Super Value',
      price: '₹999',
      period: '/ month',
      desc: 'Complete monthly farm-fresh pantry care',
      features: [
        'Large weekly hampers delivered',
        'Free organic seasonal fruit bonus',
        'Fully customizable basket',
        'Priority customer hotline',
      ],
      popular: false,
    },
  ];

  const handleSubscribe = (planTitle) => {
    Alert.alert(
      'Subscription Activated! 🎉',
      `You have successfully subscribed to the ${planTitle}. Your fresh harvest basket will arrive on schedule!`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription Packages</Text>
          <LanguagePill />
        </View>

        <Text style={styles.subHeading}>
          Farm-fresh, chemical-free vegetables and seasonal produce delivered automatically to your doorstep.
        </Text>

        {/* Plan Cards */}
        <View style={styles.planList}>
          {plans.map(p => (
            <GlassCard
              key={p.id}
              heavy={p.popular}
              style={[styles.planCard, p.popular && styles.planCardPopular]}
            >
              {p.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>★ MOST POPULAR</Text>
                </View>
              )}

              <Text style={styles.planTitle}>{p.title}</Text>
              <Text style={styles.planDesc}>{p.desc}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>{p.price}</Text>
                <Text style={styles.planPeriod}>{p.period}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.featuresList}>
                {p.features.map((feat, idx) => (
                  <View key={idx} style={styles.featRow}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.primaryLight} />
                    <Text style={styles.featText}>{feat}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.subscribeBtn, p.popular ? styles.subBtnPrimary : styles.subBtnSecondary]}
                onPress={() => handleSubscribe(p.title)}
                activeOpacity={0.85}
              >
                <Text style={styles.subscribeBtnText}>Subscribe Now</Text>
                <Feather name="arrow-right" size={16} color="#ffffff" />
              </TouchableOpacity>
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
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  subHeading: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  planList: {
    gap: 16,
  },
  planCard: {
    padding: 20,
    borderRadius: 20,
  },
  planCardPopular: {
    borderColor: 'rgba(74, 222, 128, 0.55)',
    borderWidth: 1.5,
  },
  popularBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  planDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
  },
  planPeriod: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginLeft: 4,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 14,
  },
  featuresList: {
    gap: 10,
    marginBottom: 20,
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  subBtnPrimary: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  subBtnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  subscribeBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});

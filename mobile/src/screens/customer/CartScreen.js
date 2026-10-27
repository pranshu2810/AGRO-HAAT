import React from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GlassCard } from '../../components/GlassCard';
import { LanguagePill } from '../../components/LanguagePill';
import { COLORS, SIZES } from '../../constants/theme';

export default function CartScreen({ navigation }) {
  const { cart, updateCartQty, removeFromCart, clearCart } = useAuth();
  const { t } = useLanguage();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const delivery = subtotal > 0 ? 0 : 0; // Free delivery
  const total = subtotal + delivery;

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add some fresh produce to your cart first.');
      return;
    }
    Alert.alert(
      'Order Confirmed! 🚚',
      `Thank you for supporting local farmers! Your fresh order of ₹${total} has been placed. Expected delivery: Tomorrow morning 7:00 AM.`,
      [{ text: 'Awesome', onPress: () => clearCart() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={18} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('cart_title')}</Text>
        <LanguagePill />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {cart.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="basket-outline" size={64} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyTitle}>{t('cart_empty')}</Text>
            <Text style={styles.emptySub}>Add hand-picked vegetables directly from nearby farms.</Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => navigation.navigate('Shop')}
            >
              <Text style={styles.browseBtnText}>Explore Fresh Produce</Text>
            </TouchableOpacity>
          </GlassCard>
        ) : (
          <View style={{ gap: 12 }}>
            {/* Items List */}
            {cart.map(item => (
              <GlassCard key={item.id} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemEmoji}>{item.image || '🥬'}</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₹{item.price} <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>/ {item.unit}</Text></Text>
                  </View>

                  <View style={styles.qtyControls}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateCartQty(item.id, -1)}
                    >
                      <Feather name="minus" size={14} color="#ffffff" />
                    </TouchableOpacity>

                    <Text style={styles.qtyNumber}>{item.qty}</Text>

                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateCartQty(item.id, 1)}
                    >
                      <Feather name="plus" size={14} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            ))}

            {/* Price Breakdown */}
            <GlassCard heavy style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Bill Details</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryVal}>₹{subtotal}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={[styles.summaryVal, { color: COLORS.primaryLight }]}>FREE</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>{t('cart_total')}</Text>
                <Text style={styles.totalVal}>₹{total}</Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleCheckout}
                activeOpacity={0.85}
              >
                <Text style={styles.checkoutBtnText}>{t('btn_checkout')}</Text>
                <Feather name="arrow-right" size={16} color="#ffffff" />
              </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 4,
  },
  emptySub: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  itemCard: {
    padding: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemPrice: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: '800',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 4,
    gap: 8,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNumber: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    minWidth: 16,
    textAlign: 'center',
  },
  summaryCard: {
    padding: 18,
    marginTop: 10,
  },
  summaryTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  summaryVal: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 10,
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  totalVal: {
    color: COLORS.primaryLight,
    fontSize: 18,
    fontWeight: '900',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});

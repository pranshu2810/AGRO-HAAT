import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from '../../components/GlassCard';
import { LanguagePill } from '../../components/LanguagePill';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS, SIZES } from '../../constants/theme';

export default function OrdersPayoutScreen({ navigation }) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [filter, setFilter] = useState('all'); // 'all', 'dispatch', 'completed'
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawnSuccess, setWithdrawnSuccess] = useState(false);

  const [orders, setOrders] = useState([
    {
      id: 'ORD-8941',
      date: 'Today, 8:30 AM',
      produce: 'Vine-Ripened Tomatoes (टमाटर)',
      qty: '50 kg',
      amount: '₹1,750',
      hub: 'Sonipat Central Collection Hub',
      buyer: 'Urban Family Subscription Basket',
      status: 'dispatch',
      statusEn: 'Ready for Dispatch',
      statusHi: 'हब को रवाना हेतु तैयार',
      statusColor: '#f59e0b',
    },
    {
      id: 'ORD-8890',
      date: 'Yesterday',
      produce: 'Organic Spinach (पालक)',
      qty: '25 kg',
      amount: '₹1,000',
      hub: 'Karnal Agro Cold Hub',
      buyer: 'Direct Consumer Retail Basket',
      status: 'dispatch',
      statusEn: 'In Transit to Hub',
      statusHi: 'रास्ते में (इन-ट्रांजिट)',
      statusColor: '#06b6d4',
    },
    {
      id: 'ORD-8712',
      date: '16 Oct 2026',
      produce: 'Sharbati Wheat (गेहूं Grade A)',
      qty: '4 Quintals',
      amount: '₹11,400',
      hub: 'Delhi Azadpur Food Hub',
      buyer: 'Wholesale Apartment Co-op',
      status: 'completed',
      statusEn: 'Delivered & Paid',
      statusHi: 'डिलीवर व भुगतान संपन्न',
      statusColor: '#10b981',
    },
    {
      id: 'ORD-8650',
      date: '14 Oct 2026',
      produce: 'Fresh Green Chillies (हरी मिर्च)',
      qty: '15 kg',
      amount: '₹900',
      hub: 'Sonipat Central Collection Hub',
      buyer: 'Daily Fresh Pack Subscriber',
      status: 'completed',
      statusEn: 'Delivered & Paid',
      statusHi: 'डिलीवर व भुगतान संपन्न',
      statusColor: '#10b981',
    },
  ]);

  const [wallet, setWallet] = useState({
    totalEarnings: '₹42,850',
    available: 12400,
    bank: 'State Bank of India (SBI)',
    account: '•••• 4821',
  });

  const handleWithdraw = () => {
    if (wallet.available === 0) {
      Alert.alert(isHi ? 'शून्य बैलेंस' : 'Zero Balance', isHi ? 'निकासी हेतु कोई राशि उपलब्ध नहीं है।' : 'No funds available to withdraw.');
      return;
    }

    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setWallet(prev => ({ ...prev, available: 0 }));
      setWithdrawnSuccess(true);
      setTimeout(() => setWithdrawnSuccess(false), 3500);
    }, 1200);
  };

  const markDispatched = (orderId) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'completed',
          statusEn: 'Delivered & Paid',
          statusHi: 'डिलीवर व भुगतान संपन्न',
          statusColor: '#10b981',
        };
      }
      return o;
    }));
    Alert.alert(
      isHi ? 'डिस्पैच सफल' : 'Order Dispatched',
      isHi ? 'ऑर्डर हब को भेज दिया गया है। भुगतान स्वतः एस्क्रो से रिलीज़ हो जाएगा।' : 'Order marked dispatched to local collection hub. Payout queued in escrow.'
    );
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

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
              {isHi ? '📦 किसान ऑर्डर एवं बैंक पेआउट' : '📦 Orders & Farmer Payout Ledger'}
            </Text>
            <Text style={styles.headerSub}>
              {isHi ? 'पारदर्शी दैनिक भुगतान • सीधा बैंक ट्रांसफर' : 'Direct Hub Dispatches • Instant Bank Transfer'}
            </Text>
          </View>
          <LanguagePill />
        </View>

        {/* Withdrawal Success Alert */}
        {withdrawnSuccess && (
          <View style={styles.successToast}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.successToastText}>
              {isHi
                ? '₹12,400 का पेआउट SBI बैंक खाता (•••• 4821) में सफलतापूर्वक ट्रांसफर हुआ!'
                : '₹12,400 payout successfully transferred to your SBI Account (•••• 4821)!'}
            </Text>
          </View>
        )}

        {/* Farmer Wallet GlassCard */}
        <GlassCard heavy style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View>
              <Text style={styles.walletSub}>{isHi ? 'उपलब्ध निकासी राशि (Available for Payout):' : 'Available for Instant Payout:'}</Text>
              <Text style={styles.walletBalance}>₹{wallet.available.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={[styles.withdrawBtn, (wallet.available === 0 || withdrawing) && { opacity: 0.6 }]}
              onPress={handleWithdraw}
              disabled={wallet.available === 0 || withdrawing}
            >
              <MaterialCommunityIcons name="bank-transfer-out" size={18} color="#ffffff" />
              <Text style={styles.withdrawBtnText}>
                {withdrawing ? (isHi ? 'भेज रहे हैं...' : 'Processing...') : isHi ? 'बैंक में भेजें' : 'Withdraw Now'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bankDetailRow}>
            <View style={styles.bankTag}>
              <FontAwesome5 name="university" size={12} color={COLORS.primaryLight} />
              <Text style={styles.bankText}>{wallet.bank} • {wallet.account}</Text>
            </View>
            <Text style={styles.lifetimeText}>
              {isHi ? `कुल कमाई: ${wallet.totalEarnings}` : `Lifetime: ${wallet.totalEarnings}`}
            </Text>
          </View>
        </GlassCard>

        {/* Orders Filter Tabs */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterBtnText, filter === 'all' && styles.filterBtnTextActive]}>
              {isHi ? 'सभी ऑर्डर (4)' : 'All Orders (4)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, filter === 'dispatch' && styles.filterBtnActive]}
            onPress={() => setFilter('dispatch')}
          >
            <Text style={[styles.filterBtnText, filter === 'dispatch' && styles.filterBtnTextActive]}>
              {isHi ? 'रवाना योग्य (2)' : 'In Dispatch (2)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, filter === 'completed' && styles.filterBtnActive]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterBtnText, filter === 'completed' && styles.filterBtnTextActive]}>
              {isHi ? 'भुगतान संपन्न (2)' : 'Completed (2)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Order Cards */}
        {filteredOrders.map((ord) => (
          <GlassCard key={ord.id} style={styles.orderCard}>
            <View style={styles.orderTop}>
              <View>
                <Text style={styles.orderId}>{ord.id} • {ord.date}</Text>
                <Text style={styles.produceTitle}>{ord.produce}</Text>
                <Text style={styles.orderBuyer}>{ord.buyer}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.orderAmount}>{ord.amount}</Text>
                <Text style={styles.orderQty}>{ord.qty}</Text>
              </View>
            </View>

            {/* Collection Hub Info */}
            <View style={styles.hubBox}>
              <Ionicons name="location-outline" size={14} color={COLORS.primaryLight} />
              <Text style={styles.hubText}>{ord.hub}</Text>
            </View>

            <View style={styles.orderBottom}>
              <View style={[styles.statusTag, { backgroundColor: `${ord.statusColor}22`, borderColor: `${ord.statusColor}55` }]}>
                <Text style={[styles.statusText, { color: ord.statusColor }]}>
                  {isHi ? ord.statusHi : ord.statusEn}
                </Text>
              </View>

              {ord.status === 'dispatch' ? (
                <TouchableOpacity
                  style={styles.dispatchActionBtn}
                  onPress={() => markDispatched(ord.id)}
                >
                  <Ionicons name="paper-plane" size={12} color="#ffffff" />
                  <Text style={styles.dispatchActionText}>
                    {isHi ? 'हब को रवाना मार्क करें' : 'Dispatch to Hub'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.paidBadge}>
                  <Ionicons name="checkmark-done" size={14} color="#10b981" />
                  <Text style={styles.paidText}>{isHi ? 'खाते में जमा' : 'Settled to Bank'}</Text>
                </View>
              )}
            </View>
          </GlassCard>
        ))}
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
  successToast: {
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
  successToastText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  walletCard: {
    padding: 18,
    marginBottom: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  walletBalance: {
    fontSize: 26,
    fontWeight: '900',
    color: '#10b981',
    marginTop: 2,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  withdrawBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  bankTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bankText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: '600',
  },
  lifetimeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.22)',
    borderColor: COLORS.primary,
  },
  filterBtnText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
  filterBtnTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  orderCard: {
    padding: 16,
    marginBottom: 12,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 10.5,
    color: COLORS.primaryLight,
    fontWeight: '800',
  },
  produceTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  orderBuyer: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10b981',
  },
  orderQty: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
  },
  hubBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginBottom: 10,
  },
  hubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  dispatchActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  dispatchActionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paidText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
});

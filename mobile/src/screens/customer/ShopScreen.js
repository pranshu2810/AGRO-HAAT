import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GlassCard } from '../../components/GlassCard';
import { LanguagePill } from '../../components/LanguagePill';
import { COLORS, SIZES } from '../../constants/theme';

export default function ShopScreen({ navigation }) {
  const { addToCart, cart } = useAuth();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'leafy', label: 'Leafy Greens' },
    { id: 'vegetable', label: 'Vegetables' },
    { id: 'staples', label: 'Organic Staples' },
  ];

  const products = [
    { id: '1', cat: 'leafy', name: 'Fresh Organic Spinach (पालक)', price: 40, unit: '500g', emoji: '🥬', farmer: 'Karan Farm', tag: 'Morning Harvest' },
    { id: '2', cat: 'vegetable', name: 'Vine-Ripened Tomatoes (टमाटर)', price: 35, unit: '1 kg', emoji: '🍅', farmer: 'Vikas Organic', tag: 'Chemical-Free' },
    { id: '3', cat: 'vegetable', name: 'Fresh Cauliflower (फूलगोभी)', price: 45, unit: '1 pc', emoji: '🥦', farmer: 'Sharma Greens', tag: 'Farm Direct' },
    { id: '4', cat: 'vegetable', name: 'Crisp Farm Carrots (गाजर)', price: 50, unit: '1 kg', emoji: '🥕', farmer: 'Saini Farm', tag: 'Sweet & Crisp' },
    { id: '5', cat: 'leafy', name: 'Fresh Coriander Bunch (धनिया)', price: 20, unit: '250g', emoji: '🌿', farmer: 'Green Valley', tag: 'Super Fresh' },
    { id: '6', cat: 'vegetable', name: 'Baby Potatoes (नए आलू)', price: 30, unit: '1 kg', emoji: '🥔', farmer: 'Agra Organic', tag: 'Grade-A' },
    { id: '7', cat: 'vegetable', name: 'Fresh Green Capsicum (शिमला मिर्च)', price: 60, unit: '500g', emoji: '🫑', farmer: 'Hill Fresh', tag: 'Crisp' },
    { id: '8', cat: 'staples', name: 'Pure Desi Mustard Oil (सरसों तेल)', price: 180, unit: '1 Litre', emoji: '🫒', farmer: 'Jaipur Press', tag: 'Cold-Pressed' },
  ];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.cat === selectedCategory);

  const totalCartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Farm-Fresh Marketplace</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LanguagePill />
          <TouchableOpacity
            style={styles.cartIconBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Feather name="shopping-cart" size={18} color="#ffffff" />
            {totalCartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoriesWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catChip, selectedCategory === c.id && styles.catChipActive]}
              onPress={() => setSelectedCategory(c.id)}
            >
              <Text style={[styles.catChipText, selectedCategory === c.id && styles.catChipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      <ScrollView contentContainerStyle={styles.productList} showsVerticalScrollIndicator={false}>
        {filteredProducts.map(p => (
          <GlassCard key={p.id} style={styles.productCard}>
            <View style={styles.productRow}>
              <View style={styles.emojiBox}>
                <Text style={styles.emoji}>{p.emoji}</Text>
              </View>

              <View style={styles.productDetails}>
                <View style={styles.tagWrap}>
                  <Text style={styles.tagText}>{p.tag}</Text>
                </View>
                <Text style={styles.productName}>{p.name}</Text>
                <Text style={styles.farmerName}>Grown by: {p.farmer}</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>₹{p.price} <Text style={styles.unitText}>/ {p.unit}</Text></Text>

                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => addToCart(p)}
                  >
                    <Feather name="plus" size={14} color="#ffffff" />
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  cartIconBtn: {
    width: 38,
    height: 38,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  categoriesWrap: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: COLORS.bgCard,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  catChipText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  catChipTextActive: {
    color: '#ffffff',
  },
  productList: {
    padding: 16,
    paddingBottom: 90,
    gap: 12,
  },
  productCard: {
    padding: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 34,
  },
  productDetails: {
    flex: 1,
  },
  tagWrap: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  tagText: {
    color: COLORS.primaryLight,
    fontSize: 9,
    fontWeight: '800',
  },
  productName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  farmerName: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  unitText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
});

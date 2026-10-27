import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

export const GlassCard = ({ children, style, heavy = false }) => {
  return (
    <View style={[styles.card, heavy && styles.heavyCard, style]}>
      <View style={styles.topHighlight} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
  heavyCard: {
    backgroundColor: 'rgba(8, 28, 16, 0.85)',
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(74, 222, 128, 0.45)',
  },
});

export default GlassCard;

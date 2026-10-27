import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SIZES } from '../constants/theme';

export const LanguagePill = ({ style }) => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.pill, style]}
      onPress={toggleLanguage}
    >
      <Text style={styles.flag}>{language === 'en' ? '🇮🇳' : '🇬🇧'}</Text>
      <Text style={styles.text}>{t('lang_toggle_btn')}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  flag: {
    fontSize: 14,
  },
  text: {
    color: '#ffffff',
    fontSize: SIZES.xs + 1,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default LanguagePill;

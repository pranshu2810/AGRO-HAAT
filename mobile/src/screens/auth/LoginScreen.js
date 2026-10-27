import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GlassCard } from '../../components/GlassCard';
import { LanguagePill } from '../../components/LanguagePill';
import { COLORS, SIZES } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Farmer');

  const handleLogin = () => {
    login(email, password, role);
  };

  return (
    <ImageBackground
      source={require('../../../assets/auth_bg.jpg')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Bar with Language Pill */}
            <View style={styles.topBar}>
              <View style={styles.logoPill}>
                <Ionicons name="leaf" size={16} color={COLORS.primary} />
                <Text style={styles.logoText}>AGRO<Text style={{ color: COLORS.primaryLight }}>HAAT</Text></Text>
              </View>
              <LanguagePill />
            </View>

            {/* Glassmorphic Login Box */}
            <GlassCard heavy style={styles.authBox}>
              <View style={styles.badgeWrapper}>
                <View style={styles.leafBadge}>
                  <Ionicons name="leaf" size={24} color="#ffffff" />
                </View>
              </View>

              <Text style={styles.title}>{t('login_title')}</Text>
              <Text style={styles.subtitle}>{t('login_sub')}</Text>

              {/* Role Switcher Pill */}
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleBtn, role === 'Farmer' && styles.roleBtnActive]}
                  onPress={() => setRole('Farmer')}
                >
                  <FontAwesome5 name="tractor" size={13} color={role === 'Farmer' ? '#ffffff' : COLORS.textMuted} />
                  <Text style={[styles.roleText, role === 'Farmer' && styles.roleTextActive]}>
                    {t('role_farmer')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleBtn, role === 'Customer' && styles.roleBtnActiveBlue]}
                  onPress={() => setRole('Customer')}
                >
                  <FontAwesome5 name="shopping-basket" size={13} color={role === 'Customer' ? '#ffffff' : COLORS.textMuted} />
                  <Text style={[styles.roleText, role === 'Customer' && styles.roleTextActive]}>
                    {t('role_customer')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('email_label')}</Text>
                <View style={styles.inputWrap}>
                  <Feather name="mail" size={16} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('email_placeholder')}
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('pass_label')}</Text>
                <View style={styles.inputWrap}>
                  <Feather name="lock" size={16} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('pass_placeholder')}
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>{t('btn_signin')}</Text>
                <Feather name="arrow-right" size={18} color="#ffffff" />
              </TouchableOpacity>

              {/* Extra Links */}
              <View style={styles.linksContainer}>
                <Text style={styles.linkText}>{t('new_user')}{' '}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.linkAction}>{t('btn_signup')}</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 18, 11, 0.72)',
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(12, 34, 21, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  authBox: {
    padding: 24,
    borderRadius: 24,
  },
  badgeWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  leafBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    transform: [{ rotate: '-8deg' }],
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: SIZES.radiusMd,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: SIZES.radiusSm,
  },
  roleBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  roleBtnActiveBlue: {
    backgroundColor: COLORS.customerBlue,
    shadowColor: COLORS.customerBlue,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  roleText: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: SIZES.xs + 1,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: SIZES.md,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: SIZES.base,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  linkText: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
  },
  linkAction: {
    color: COLORS.primaryLight,
    fontWeight: '700',
    fontSize: SIZES.sm,
  },
});

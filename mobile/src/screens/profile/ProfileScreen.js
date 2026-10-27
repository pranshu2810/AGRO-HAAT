import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import GlassCard from '../../components/GlassCard';
import LanguagePill from '../../components/LanguagePill';

export default function ProfileScreen({ navigation }) {
  const { user, switchRole, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const isFarmer = user?.role === 'Farmer';

  const handleRoleSwitch = () => {
    switchRole();
    Alert.alert(
      language === 'hi' ? 'भूमिका बदली गई' : 'Role Switched',
      language === 'hi'
        ? `अब आप ${!isFarmer ? 'किसान' : 'ग्राहक'} मोड में हैं।`
        : `Switched to ${!isFarmer ? 'Farmer' : 'Customer'} workspace.`
    );
  };

  const handleLogout = () => {
    Alert.alert(
      language === 'hi' ? 'लॉगआउट' : 'Sign Out',
      language === 'hi'
        ? 'क्या आप वाकई लॉगआउट करना चाहते हैं?'
        : 'Are you sure you want to sign out of Agro-Haat 2.0?',
      [
        { text: language === 'hi' ? 'रद्द करें' : 'Cancel', style: 'cancel' },
        {
          text: language === 'hi' ? 'लॉगआउट' : 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>
              {language === 'hi' ? 'मेरी प्रोफाइल' : 'My Profile'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {language === 'hi'
                ? 'खाता और प्राथमिकताओं का प्रबंधन करें'
                : 'Account settings and preferences'}
            </Text>
          </View>
          <LanguagePill />
        </View>

        {/* User Card */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <LinearGradient
              colors={isFarmer ? [THEME.colors.emerald, '#047857'] : ['#0284c7', '#0369a1']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {user?.fullname ? user.fullname.charAt(0).toUpperCase() : 'A'}
              </Text>
            </LinearGradient>
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user?.fullname || 'Suraj Sahni'}</Text>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor: isFarmer
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(56, 189, 248, 0.2)',
                      borderColor: isFarmer ? THEME.colors.emerald : '#38bdf8',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleBadgeText,
                      { color: isFarmer ? THEME.colors.emerald : '#38bdf8' },
                    ]}
                  >
                    {isFarmer
                      ? language === 'hi'
                        ? '🌱 किसान'
                        : '🌱 Farmer'
                      : language === 'hi'
                      ? '🛒 ग्राहक'
                      : '🛒 Customer'}
                  </Text>
                </View>
              </View>
              <Text style={styles.userEmail}>{user?.email || 'farmer@agrohaat.com'}</Text>
              <Text style={styles.userPhone}>+91 98765 43210</Text>
            </View>
          </View>

          {/* Role Switcher Action */}
          <TouchableOpacity
            style={styles.switchRoleButton}
            onPress={handleRoleSwitch}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
              style={styles.switchRoleGradient}
            >
              <Ionicons name="swap-horizontal" size={20} color={THEME.colors.emerald} />
              <Text style={styles.switchRoleText}>
                {language === 'hi'
                  ? `${isFarmer ? 'ग्राहक (Customer)' : 'किसान (Farmer)'} मोड में बदलें`
                  : `Switch to ${isFarmer ? 'Customer' : 'Farmer'} Mode`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {isFarmer ? (
            <>
              <GlassCard style={styles.miniStat}>
                <Text style={styles.miniStatValue}>4.8 ★</Text>
                <Text style={styles.miniStatLabel}>
                  {language === 'hi' ? 'फार्म रेटिंग' : 'Farm Rating'}
                </Text>
              </GlassCard>
              <GlassCard style={styles.miniStat}>
                <Text style={styles.miniStatValue}>12 Acres</Text>
                <Text style={styles.miniStatLabel}>
                  {language === 'hi' ? 'भूमि क्षेत्र' : 'Land Area'}
                </Text>
              </GlassCard>
              <GlassCard style={styles.miniStat}>
                <Text style={styles.miniStatValue}>₹1.4L</Text>
                <Text style={styles.miniStatLabel}>
                  {language === 'hi' ? 'कुल बिक्री' : 'Total Sales'}
                </Text>
              </GlassCard>
            </>
          ) : (
            <>
              <GlassCard style={styles.miniStat}>
                <Text style={styles.miniStatValue}>14</Text>
                <Text style={styles.miniStatLabel}>
                  {language === 'hi' ? 'ऑर्डर' : 'Orders'}
                </Text>
              </GlassCard>
              <GlassCard style={styles.miniStat}>
                <Text style={styles.miniStatValue}>Weekly</Text>
                <Text style={styles.miniStatLabel}>
                  {language === 'hi' ? 'प्लान' : 'Active Plan'}
                </Text>
              </GlassCard>
              <GlassCard style={styles.miniStat}>
                <Text style={styles.miniStatValue}>₹480</Text>
                <Text style={styles.miniStatLabel}>
                  {language === 'hi' ? 'बचत' : 'Saved'}
                </Text>
              </GlassCard>
            </>
          )}
        </View>

        {/* Account Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'hi' ? 'सेटिंग्स और प्राथमिकताएं' : 'Settings & Preferences'}
          </Text>

          <GlassCard style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={toggleLanguage}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="language" size={20} color={THEME.colors.emerald} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuTitle}>
                  {language === 'hi' ? 'ऐप भाषा' : 'App Language'}
                </Text>
                <Text style={styles.menuSubtitle}>
                  {language === 'hi' ? 'वर्तमान: हिन्दी' : 'Current: English'}
                </Text>
              </View>
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText}>
                  {language === 'hi' ? '🇮🇳 हिन्दी' : '🇬🇧 English'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(
                  language === 'hi' ? 'कृषि एवं पता' : 'Saved Addresses',
                  language === 'hi'
                    ? 'पता: फार्म हाउस #12, जीटी रोड, करनाल, हरियाणा'
                    : 'Location: Farm House #12, GT Road, Karnal, Haryana'
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="location-outline" size={20} color="#38bdf8" />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuTitle}>
                  {isFarmer
                    ? language === 'hi'
                      ? 'फार्म का स्थान व गोदाम'
                      : 'Farm Location & Hub'
                    : language === 'hi'
                    ? 'डिलीवरी का पता'
                    : 'Delivery Address'}
                </Text>
                <Text style={styles.menuSubtitle}>Karnal, Haryana - 132001</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(
                  language === 'hi' ? 'नोटिफिकेशन' : 'Notifications',
                  language === 'hi'
                    ? 'मौसम अलर्ट, मंडी रेट और ऑर्डर अपडेट चालू हैं।'
                    : 'Weather advisories, mandi rates, and order tracking alerts are active.'
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="notifications-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuTitle}>
                  {language === 'hi' ? 'सूचनाएं एवं अलर्ट' : 'Smart Alerts & Notifications'}
                </Text>
                <Text style={styles.menuSubtitle}>
                  {language === 'hi' ? 'मौसम, मंडी व ऑर्डर' : 'Weather, Mandi & Orders'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(
                  language === 'hi' ? 'किसान सहायता केंद्र' : 'Kisan AI Helpline',
                  language === 'hi'
                    ? 'टोल फ्री: 1800-180-1551\nएग्रोनॉमिस्ट चैट: चौबीसों घंटे सक्रिय'
                    : 'Toll-free: 1800-180-1551\nAI Agronomist Chat: 24x7 active'
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="headset-outline" size={20} color="#a855f7" />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuTitle}>
                  {language === 'hi' ? '24x7 सहायता केंद्र' : '24x7 Support Helpline'}
                </Text>
                <Text style={styles.menuSubtitle}>
                  {language === 'hi' ? 'कृषि विशेषज्ञ से बात करें' : 'Talk with Agronomist'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* App Info & Logout */}
        <View style={styles.logoutWrap}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>
              {language === 'hi' ? 'लॉगआउट करें' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Agro-Haat AI 2.0 • Build v2.4.0 (React Native)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.bgDark,
  },
  container: {
    padding: THEME.spacing.lg,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.colors.textLight,
  },
  headerSubtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  profileCard: {
    marginBottom: THEME.spacing.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  avatarGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textLight,
  },
  roleBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  switchRoleButton: {
    marginTop: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  switchRoleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  switchRoleText: {
    color: THEME.colors.textLight,
    fontWeight: '700',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.lg,
    gap: 10,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  miniStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.emerald,
  },
  miniStatLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textLight,
    marginBottom: THEME.spacing.sm,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 14,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textLight,
  },
  menuSubtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  pillBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.emerald,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginLeft: 56,
  },
  logoutWrap: {
    alignItems: 'center',
    marginTop: THEME.spacing.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: '100%',
    gap: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 16,
  },
});

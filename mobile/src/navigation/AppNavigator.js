import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { THEME } from '../constants/theme';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Farmer Screens
import FarmerDashboardScreen from '../screens/farmer/FarmerDashboardScreen';
import CropRecommendationScreen from '../screens/farmer/CropRecommendationScreen';
import SoilAnalysisScreen from '../screens/farmer/SoilAnalysisScreen';
import PestScannerScreen from '../screens/farmer/PestScannerScreen';
import WeatherScreen from '../screens/farmer/WeatherScreen';
import MandiPricesScreen from '../screens/farmer/MandiPricesScreen';
import MachineryScreen from '../screens/farmer/MachineryScreen';
import FarmerMarketplaceScreen from '../screens/farmer/FarmerMarketplaceScreen';
import OrdersPayoutScreen from '../screens/farmer/OrdersPayoutScreen';

// Customer Screens
import CustomerDashboardScreen from '../screens/customer/CustomerDashboardScreen';
import ShopScreen from '../screens/customer/ShopScreen';
import SubscriptionScreen from '../screens/customer/SubscriptionScreen';
import CartScreen from '../screens/customer/CartScreen';

// Common Screens
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabBarIcon({ name, type = 'Ionicons', color, size = 22, badge }) {
  return (
    <View style={styles.iconWrap}>
      {type === 'FontAwesome5' ? (
        <FontAwesome5 name={name} size={size - 2} color={color} />
      ) : (
        <Ionicons name={name} size={size} color={color} />
      )}
      {badge > 0 && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

function MainTabNavigator() {
  const { user, cart } = useAuth();
  const { t } = useLanguage();
  const isFarmer = user?.role === 'Farmer';

  const cartCount = cart?.reduce((sum, item) => sum + (item.qty || 1), 0) || 0;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: THEME.colors.emerald,
        tabBarInactiveTintColor: THEME.colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {isFarmer ? (
        <>
          <Tab.Screen
            name="FarmerDashboard"
            component={FarmerDashboardScreen}
            options={{
              tabBarLabel: t('tab_dashboard'),
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="grid-outline" color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="PestScannerTab"
            component={PestScannerScreen}
            options={{
              tabBarLabel: t('action_scan'),
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="scan-circle-outline" color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="WeatherTab"
            component={WeatherScreen}
            options={{
              tabBarLabel: t('action_weather'),
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="partly-sunny-outline" color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="MandiPricesTab"
            component={MandiPricesScreen}
            options={{
              tabBarLabel: t('action_prices'),
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="trending-up-outline" color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="ProfileTab"
            component={ProfileScreen}
            options={{
              tabBarLabel: t('tab_profile'),
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="person-outline" color={color} />
              ),
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="CustomerDashboard"
            component={CustomerDashboardScreen}
            options={{
              tabBarLabel: t('tab_dashboard'),
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="home-outline" color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="ShopTab"
            component={ShopScreen}
            options={{
              tabBarLabel: t('tab_shop'),
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="basket-outline" color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="SubscriptionTab"
            component={SubscriptionScreen}
            options={{
              tabBarLabel: t('tab_plans'),
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="calendar-outline" color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="CartTab"
            component={CartScreen}
            options={{
              tabBarLabel: t('tab_cart'),
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="cart-outline" color={color} badge={cartCount} />
              ),
            }}
          />
          <Tab.Screen
            name="ProfileTab"
            component={ProfileScreen}
            options={{
              tabBarLabel: t('tab_profile'),
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="person-outline" color={color} />
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: THEME.colors.bgDark },
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // App Stack (Authenticated)
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />

          {/* Farmer Sub-screens & Direct Stack Routes */}
          <Stack.Screen name="FarmerDashboard" component={FarmerDashboardScreen} />
          <Stack.Screen name="CropRecommendation" component={CropRecommendationScreen} />
          <Stack.Screen name="SoilAnalysis" component={SoilAnalysisScreen} />
          <Stack.Screen name="PestScanner" component={PestScannerScreen} />
          <Stack.Screen name="Weather" component={WeatherScreen} />
          <Stack.Screen name="MandiPrices" component={MandiPricesScreen} />
          <Stack.Screen name="Machinery" component={MachineryScreen} />
          <Stack.Screen name="FarmerMarketplace" component={FarmerMarketplaceScreen} />
          <Stack.Screen name="OrdersPayout" component={OrdersPayoutScreen} />

          {/* Customer Sub-screens & Direct Stack Routes */}
          <Stack.Screen name="CustomerDashboard" component={CustomerDashboardScreen} />
          <Stack.Screen name="Shop" component={ShopScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Subscriptions" component={SubscriptionScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />

          {/* Common */}
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(8, 20, 14, 0.96)',
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 86 : 66,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    elevation: 12,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrap: {
    width: 32,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
});

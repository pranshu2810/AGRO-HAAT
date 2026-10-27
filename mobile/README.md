# 🌾 Agro-Haat AI 2.0 Mobile (React Native + Expo)

A cross-platform React Native mobile application for **Agro-Haat 2.0**, built with Expo, modern frosted glassmorphic UI aesthetics, and real-time bilingual support (**English 🇬🇧 ↔ 🇮🇳 हिन्दी**).

---

## 📱 Features

### 🚜 Farmer Workspace (3 Cultivation Stages)
1. **🌱 Stage 1: Pre-Cultivation**
   - **Soil Health & N-P-K Analysis**: Real-time N-P-K & pH input with AI Soil Health Score (84/100) and custom bio-fertilizer schedule.
   - **Monsoon & Weather Radar**: 5-day agro-meteorological forecast and smart irrigation advisory.
   - **Land Prep Machinery Booking**: Rent tractors, laser levelers, and rotavators.
   - **Precision Crop Recommendation**: Season and soil suitability intelligence.

2. **🌿 Stage 2: Middle Stage (Crop Growth)**
   - **AI Crop Disease Scanner**: Computer-vision viewfinder, confidence score, treatment protocols, and organic bio-fungicide remedies.
   - **Agronomist AI Support**: 24/7 crop specialist advisory helpline.
   - **Smart Irrigation Scheduling**: Moisture radar conserving water and power.
   - **Nutrient & Bio-Fertilizer Schedule**: Vegetative growth phase dosage calculator.

3. **🌾 Stage 3: End Stage (Harvest & Market)**
   - **Live Mandi Rates (APMC)**: Real-time price benchmarks across nearby agricultural mandis (Karnal, Azadpur, Sonipat) with price trend indicators.
   - **Direct Farmer Marketplace**: Sell directly to customers with 0% middleman commission.
   - **Order Dispatch & Payouts**: Real-time order fulfillment tracker.
   - **Combine Harvester Rental**: On-demand booking during peak harvest season.

---

### 🛒 Customer Workspace
- **Farm-Fresh Organic Marketplace**: Browse morning-harvested vegetables directly from local verified farmers with category filtering (All, Leafy, Daily Essentials, Exotic).
- **Subscription Baskets**:
  - *Daily Fresh Pack* (₹49/day)
  - *Weekly Family Basket* (₹99/week - Most Popular)
  - *Monthly Super Value* (₹999/month)
- **Live Cart & Instant Checkout**: Quantity stepper, subtotal/delivery calculation, and instant delivery dispatch alert.
- **One-Tap Role Switcher**: Switch between **Farmer** and **Customer** modes anytime without logging out.

---

### 🎨 Design System & Accessibility
- **Frosted Glassmorphism**: Translucent cards (`rgba(255, 255, 255, 0.05)`), neon borders, and dark emerald forest gradients.
- **Instant Language Toggle**: Tap `🇮🇳 हिन्दी` / `🇬🇧 English` anywhere in the app header to immediately translate all titles, descriptions, and action buttons.
- **Tractor Field Background**: Matching web design aerial tractor photography for authentication pages.

---

## 🚀 How to Run the App

### Prerequisites
- Node.js (v18+)
- Mobile device with **Expo Go** app installed:
  - [Expo Go on Android (Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [Expo Go on iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)

### 1. Start Metro Bundler
```bash
cd mobile
npx expo start
```

### 2. Open on Mobile Device
- **Android**: Scan the QR code shown in the terminal or web browser using the **Expo Go** app.
- **iOS**: Scan the QR code using the default **Camera** app, then tap the "Open in Expo Go" banner.
- **Web Preview**: Press `w` in the terminal to view in your desktop web browser.

---

## 📂 Project Structure

```
mobile/
├── assets/                  # Icons, tractor background (auth_bg.jpg), splash screen
├── src/
│   ├── components/
│   │   ├── GlassCard.js     # Reusable frosted glassmorphic card component
│   │   └── LanguagePill.js  # Bilingual language switcher toggle
│   ├── constants/
│   │   ├── theme.js         # Color tokens, gradients, glassmorphism presets
│   │   └── translations.js  # Complete English & Hindi agricultural dictionary
│   ├── context/
│   │   ├── AuthContext.js   # User state, role switcher (Farmer ↔ Customer), cart
│   │   └── LanguageContext.js # Dynamic English / Hindi provider (t() helper)
│   ├── navigation/
│   │   └── AppNavigator.js  # Bottom Tab bar & Root Stack Navigation
│   └── screens/
│       ├── auth/
│       │   ├── LoginScreen.js
│       │   └── RegisterScreen.js
│       ├── farmer/
│       │   ├── FarmerDashboardScreen.js
│       │   ├── SoilAnalysisScreen.js
│       │   ├── PestScannerScreen.js
│       │   ├── WeatherScreen.js
│       │   └── MandiPricesScreen.js
│       ├── customer/
│       │   ├── CustomerDashboardScreen.js
│       │   ├── ShopScreen.js
│       │   ├── SubscriptionScreen.js
│       │   └── CartScreen.js
│       └── profile/
│           └── ProfileScreen.js
├── App.js                   # Application root with context providers
├── app.json                 # Expo project configuration
└── package.json
```

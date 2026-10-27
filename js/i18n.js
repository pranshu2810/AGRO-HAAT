// ==========================================================================
// AGRO-HAAT 2.0 - MULTILINGUAL (ENGLISH & HINDI) TRANSLATION ENGINE
// ==========================================================================

const AGRO_TRANSLATIONS = {
  en: {
    // Navigation
    "nav_home": "Home",
    "nav_features": "Features",
    "nav_demo": "Demo",
    "nav_subscription": "Subscription",
    "nav_contact": "Contact",
    "btn_farmer": "Farmer",
    "btn_customer": "Customer",
    "nav_dashboard": "Dashboard",
    "nav_orders": "Orders",
    "nav_inventory": "Inventory",
    "nav_shop": "Shop Fresh",
    "nav_cart": "Cart",
    "profile_my": "My Profile",
    "profile_orders": "Track Orders",
    "profile_password": "Change Password",
    "profile_logout": "Logout",

    // Hero Section
    "hero_kicker": "Cultivating",
    "hero_title": "GROWING IDEAS",
    "hero_subtitle": "Long-established agricultural ecosystem empowering Indian farmers and families with AI intelligence, precision crop analytics, fair mandi prices, and direct farm-to-table delivery.",
    "btn_start_sub": "Start Subscription",
    "btn_explore_features": "Explore Features",
    "hero_scroll": "Scroll",

    // Features Header & Stages
    "features_tag": "Agricultural Lifecycle",
    "features_title": "End-to-End Farming Solutions",
    "features_subtitle": "Explore comprehensive AI intelligence and farm support across every critical stage of cultivation.",
    "tab_all_features": "All Features",
    "tab_pre_cultivation": "Pre-Cultivation",
    "tab_mid_cultivation": "Middle of Cultivation",
    "tab_post_cultivation": "End of Cultivation",

    // Stage 1: Pre-Cultivation
    "stage1_pill": "Stage 01",
    "stage1_title": "Pre-Cultivation (Planning & Land Preparation)",
    "stage1_desc": "Scientific soil testing, precision crop selection, seasonal weather forecasting, and land preparation before sowing.",
    "feat_soil_title": "Soil Health & N-P-K Analysis",
    "feat_soil_desc": "Assess soil nutrient levels, pH, and electrical conductivity with AI-driven recommendations for soil enrichment and balanced fertilization.",
    "feat_crop_title": "Precision Crop Suggestions",
    "feat_crop_desc": "Personalized recommendations tailored to local soil composition, regional water availability, and upcoming market demand.",
    "feat_weather_title": "Monsoon & Weather Outlook",
    "feat_weather_desc": "Long-range climate projections and seasonal monsoon forecasts helping farmers identify the optimal sowing window to minimize risk.",
    "feat_machinery_title": "Land Preparation Machinery",
    "feat_machinery_desc": "Book tractors, laser land levelers, and rotavators from nearby equipment owners at transparent hourly rates without middleman commissions.",

    // Stage 2: Middle of Cultivation
    "stage2_pill": "Stage 02",
    "stage2_title": "Middle of Cultivation (Crop Growth & Protection)",
    "stage2_desc": "Active monitoring, instant disease diagnostics, precision irrigation, and nutrient management during vegetative development.",
    "feat_pest_title": "AI Crop Disease & Pest Scanner",
    "feat_pest_desc": "Upload photos of affected leaves for instant computer-vision disease diagnosis, early blight detection, and certified treatment protocols.",
    "feat_irrigation_title": "Smart Irrigation Scheduling",
    "feat_irrigation_desc": "Weather-linked moisture alerts preventing both over-watering and moisture stress while conserving groundwater resources.",
    "feat_nutrient_title": "Nutrient & Bio-Fertilizer Guidance",
    "feat_nutrient_desc": "Calculated dosage recommendations for organic manures and fertilizers during key vegetative and flowering phases.",
    "feat_alerts_title": "Growth Tracking & Advisory Alerts",
    "feat_alerts_desc": "Real-time agronomic alerts and localized pest outbreak warnings sent straight to WhatsApp to keep crops healthy and productive.",

    // Stage 3: End of Cultivation
    "stage3_pill": "Stage 03",
    "stage3_title": "End of Cultivation (Harvest, Packaging & Direct Sales)",
    "stage3_desc": "Harvest machinery booking, damage-free standard packaging, real mandi rates, and direct consumer marketplace.",
    "feat_harvester_title": "Harvester & Thresher Rental",
    "feat_harvester_desc": "Rent combine harvesters and threshers during peak harvest season without middleman delays or inflated pricing.",
    "feat_pkg_title": "Smart Standard Packaging",
    "feat_pkg_desc": "Small-sized eco-crates (5kg, 10kg, 25kg) that protect produce from transit spoilage and make it kitchen-ready for urban consumers.",
    "feat_mandi_title": "Real-Time Mandi Price Benchmarks",
    "feat_mandi_desc": "Live APMC mandi rates updated daily so farmers negotiate and sell their harvest from a position of data-backed confidence.",
    "feat_market_title": "Direct Farmer Marketplace",
    "feat_market_desc": "Sell directly to retail families and subscribers with prompt digital payouts, guaranteed fair pricing, and 0% commission deduction.",

    // Demo Section
    "demo_tag": "Live Preview",
    "demo_title": "Explore Our Services",
    "demo_subtitle": "Experience Agro-Haat's intelligent modules in real-time.",
    "demo_tab_weather": "Weather Forecast",
    "demo_tab_crops": "AI Crop Health",
    "demo_tab_machinery": "Machinery Rental",
    "demo_tab_market": "Direct Market",

    // Subscription
    "sub_tag": "Flexible Delivery",
    "sub_title": "Subscription Packages",
    "sub_subtitle": "Farm-fresh, chemical-free vegetables and seasonal produce delivered automatically to your family doorstep.",
    "sub_daily_title": "Daily Fresh Pack",
    "sub_daily_desc": "Essential daily cooking greens & vegetables",
    "sub_weekly_title": "Weekly Family Basket",
    "sub_weekly_desc": "Ideal for a family of 3-5 members",
    "sub_monthly_title": "Monthly Super Value",
    "sub_monthly_desc": "Complete monthly farm-fresh pantry care",
    "sub_popular": "Most Popular",
    "btn_subscribe": "Subscribe Now",

    // Stats
    "stats_heading": "Transforming Agriculture Nationwide",
    "stat_farmers": "Verified Farmers Connected",
    "stat_customers": "Satisfied Urban Families",
    "stat_income": "Higher Farmer Net Earnings",
    "stat_waste": "Reduced Post-Harvest Loss",

    // Farmer Dashboard
    "farmer_welcome": "Welcome back",
    "farmer_subtext": "Your digital agricultural command center is live across every cultivation stage.",
    "btn_quick_actions": "Quick Actions",
    "action_add_product": "Add New Product",
    "action_orders": "Manage Orders",
    "action_scan_crop": "Scan Crop Disease",
    "action_weather": "Check Weather Radar",
    "stat_active_products": "Active Products",
    "stat_total_orders": "Total Orders",
    "stat_monthly_revenue": "This Month Revenue",
    "stat_units_sold": "Units Sold",
    "btn_explore_models": "Explore Models",
    "btn_analyze_soil": "Analyze Soil",
    "btn_check_weather": "Check Weather",
    "btn_find_equipment": "Find Equipment",
    "btn_scan_crop": "Scan Crop",
    "btn_ask_expert": "Ask Expert",
    "btn_irrigation_plan": "Irrigation Plan",
    "btn_view_advisory": "View Advisory",
    "btn_view_rates": "View Rates",
    "btn_manage_inv": "Manage Inventory",
    "btn_manage_orders": "Manage Orders",
    "btn_rent_harvester": "Rent Harvester",

    // Customer Dashboard
    "customer_welcome": "Hello",
    "customer_subtext": "Fresh organic vegetables delivered straight from the farm to your door. Support local farmers today.",
    "customer_search_placeholder": "Search vegetables...",
    "stat_avail_items": "Available Items",
    "stat_your_orders": "Your Orders",
    "stat_organic_guar": "Organic Guarantee",
    "feat_browse_title": "Browse Products",
    "feat_browse_desc": "Discover fresh vegetables and organic produce directly from local farmers.",
    "feat_plans_title": "Delivery Plans",
    "feat_plans_desc": "Subscribe to weekly fresh baskets delivered to your doorstep.",
    "feat_track_title": "Track Orders",
    "feat_track_desc": "Keep an eye on your recent purchases and delivery status.",
    "feat_farmers_title": "Farmer Profiles",
    "feat_farmers_desc": "Meet the farmers growing your food. View their practices and ratings.",
    "feat_history_title": "Purchase History",
    "feat_history_desc": "Easily reorder your favorite products from past purchases.",
    "feat_offers_title": "Offers & Deals",
    "feat_offers_desc": "Check out bulk discounts and seasonal offers on fresh produce.",
    "btn_shop_now": "Shop Now",
    "btn_view_plans": "View Plans",
    "btn_my_orders": "My Orders",
    "btn_meet_farmers": "Meet Farmers",
    "btn_view_history": "View History",
    "btn_claim_offers": "Claim Offers"
  },

  hi: {
    // Navigation
    "nav_home": "होम",
    "nav_features": "विशेषताएं",
    "nav_demo": "लाइव डेमो",
    "nav_subscription": "सब्सक्रिप्शन",
    "nav_contact": "संपर्क",
    "btn_farmer": "किसान",
    "btn_customer": "ग्राहक",
    "nav_dashboard": "डैशबोर्ड",
    "nav_orders": "ऑर्डर",
    "nav_inventory": "इन्वेंटरी",
    "nav_shop": "ताज़ा खरीदें",
    "nav_cart": "कार्ट",
    "profile_my": "मेरी प्रोफाइल",
    "profile_orders": "ऑर्डर ट्रैक करें",
    "profile_password": "पासवर्ड बदलें",
    "profile_logout": "लॉगआउट",

    // Hero Section
    "hero_kicker": "उन्नत कृषि",
    "hero_title": "नए विचार, समृद्ध किसान",
    "hero_subtitle": "भारतीय किसानों और परिवारों को AI तकनीक, सटीक फसल परामर्श, पारदर्शी मंडी भाव और खेत से सीधी आपूर्ति द्वारा सशक्त बनाने वाला आधुनिक कृषि मंच।",
    "btn_start_sub": "सब्सक्रिप्शन शुरू करें",
    "btn_explore_features": "विशेषताएं देखें",
    "hero_scroll": "नीचे देखें",

    // Features Header & Stages
    "features_tag": "संपूर्ण कृषि चक्र",
    "features_title": "बुवाई से बिक्री तक संपूर्ण कृषि समाधान",
    "features_subtitle": "फसल के हर महत्वपूर्ण चरण में आधुनिक AI तकनीक और व्यापक किसान सहायता का अनुभव करें।",
    "tab_all_features": "सभी सुविधाएं",
    "tab_pre_cultivation": "🌱 बुवाई पूर्व",
    "tab_mid_cultivation": "🌿 फसल वृद्धि",
    "tab_post_cultivation": "🚜 कटाई उपरांत",

    // Stage 1: Pre-Cultivation
    "stage1_pill": "चरण 01",
    "stage1_title": "बुवाई पूर्व (योजना एवं भूमि तैयारी)",
    "stage1_desc": "बुवाई से पहले वैज्ञानिक मृदा परीक्षण, सटीक फसल चयन, मौसमी मौसम पूर्वानुमान और भूमि तैयारी उपकरण।",
    "feat_soil_title": "मृदा स्वास्थ्य एवं N-P-K विश्लेषण",
    "feat_soil_desc": "मिट्टी के पोषक तत्वों (N-P-K), pH और विद्युत चालकता का AI विश्लेषण व संतुलित खाद की वैज्ञानिक सलाह।",
    "feat_crop_title": "सटीक फसल चयन सुझाव",
    "feat_crop_desc": "स्थानीय मिट्टी संरचना, पानी की उपलब्धता और आगामी बाज़ार मांग के आधार पर सबसे उत्तम फसल सिफारिशें।",
    "feat_weather_title": "मानसून एवं मौसम पूर्वानुमान",
    "feat_weather_desc": "लंबी अवधि के मौसमी वर्षा मॉडल ताकि किसान सही समय पर बुवाई करके अनिश्चित मौसम के नुकसान से बच सकें।",
    "feat_machinery_title": "भूमि तैयारी उपकरण किराया",
    "feat_machinery_desc": "आसपास के सत्यापित किसानों से ट्रैक्टर, लेजर लैंड लेवलर और रोटावेटर उचित प्रति घंटे दर पर बुक करें।",

    // Stage 2: Middle of Cultivation
    "stage2_pill": "चरण 02",
    "stage2_title": "फसल वृद्धि (देखभाल एवं सुरक्षा)",
    "stage2_desc": "सक्रिय निगरानी, तत्काल रोग निदान, सटीक सिंचाई अलर्ट और वानस्पतिक विकास के दौरान पोषण प्रबंधन।",
    "feat_pest_title": "AI फसल रोग एवं कीट स्कैनर",
    "feat_pest_desc": "प्रभावित पत्ती की फोटो अपलोड करें और कंप्यूटर विज़न तकनीक से तुरंत रोग पहचान और प्रमाणित उपचार पाएं।",
    "feat_irrigation_title": "स्मार्ट सिंचाई समय-सारणी",
    "feat_irrigation_desc": "मौसम और मिट्टी की नमी से जुड़े अलर्ट जो अधिक या कम सिंचाई से बचाकर पानी व बिजली दोनों की बचत करते हैं।",
    "feat_nutrient_title": "पोषक तत्व एवं जैविक खाद सलाह",
    "feat_nutrient_desc": "वानस्पतिक विकास और फूल आने की अवस्था में संतुलित जैविक व रासायनिक खादों की सही खुराक का हिसाब।",
    "feat_alerts_title": "फसल वृद्धि एवं चेतावनी अलर्ट",
    "feat_alerts_desc": "कीट प्रकोप और मौसमी बीमारियों से बचाव के लिए रियल-टाइम कृषि परामर्श अलर्ट सीधे व्हाट्सएप पर प्राप्त करें।",

    // Stage 3: End of Cultivation
    "stage3_pill": "चरण 03",
    "stage3_title": "कटाई उपरांत (पैकेजिंग एवं सीधी बिक्री)",
    "stage3_desc": "कटाई मशीनरी बुकिंग, सुरक्षित मानक पैकेजिंग, लाइव मंडी भाव और सीधी उपभोक्ता बिक्री।",
    "feat_harvester_title": "हार्वेस्टर एवं थ्रेशर किराया",
    "feat_harvester_desc": "कटाई सीजन में बिना बिचौलियों के आसानी से कंबाइन हार्वेस्टर और थ्रेशर उचित किराये पर बुक करें।",
    "feat_pkg_title": "स्मार्ट मानक पैकेजिंग",
    "feat_pkg_desc": "छोटे व सुरक्षित इको-क्रेट्स (5kg, 10kg, 25kg) जो परिवहन में उपज को खराब होने से बचाते हैं।",
    "feat_mandi_title": "लाइव मंडी भाव एवं मूल्य निर्धारण",
    "feat_mandi_desc": "आसपास की सभी प्रमुख APMC मंडियों के दैनिक भाव ताकि किसान सही जानकारी और आत्मविश्वास से बिक्री करें।",
    "feat_market_title": "सीधा किसान बाज़ार (0% कमीशन)",
    "feat_market_desc": "बिना किसी बिचौलिए के अपनी ताज़ा फसल सीधे ग्राहकों को बेचें और 30% तक अधिक मुनाफा पाएं।",

    // Demo Section
    "demo_tag": "लाइव पूर्वावलोकन",
    "demo_title": "हमारी मुख्य सेवाएं देखें",
    "demo_subtitle": "एग्रो-हाट के आधुनिक AI और डिजिटल मॉड्यूल्स को लाइव अनुभव करें।",
    "demo_tab_weather": "मौसम पूर्वानुमान",
    "demo_tab_crops": "फसल स्वास्थ्य",
    "demo_tab_machinery": "मशीनरी किराया",
    "demo_tab_market": "सीधा बाज़ार",

    // Subscription
    "sub_tag": "सुविधाजनक डिलीवरी",
    "sub_title": "घर-घर ताज़ा सब्ज़ी पैकेज",
    "sub_subtitle": "खेत से ताज़ा, रसायन-मुक्त हरी सब्ज़ियां और मौसमी फल सीधे आपके परिवार की रसोई तक।",
    "sub_daily_title": "दैनिक ताज़ा पैक",
    "sub_daily_desc": "दैनिक भोजन के लिए आवश्यक ताज़ी हरी सब्ज़ियां",
    "sub_weekly_title": "साप्ताहिक पारिवारिक टोकरी",
    "sub_weekly_desc": "3-5 सदस्यों वाले परिवार के लिए सबसे उत्तम",
    "sub_monthly_title": "मासिक संपूर्ण बचत पैक",
    "sub_monthly_desc": "महीने भर की ताज़ा जैविक सब्ज़ी की पूरी व्यवस्था",
    "sub_popular": "सबसे लोकप्रिय",
    "btn_subscribe": "अभी सब्सक्राइब करें",

    // Stats
    "stats_heading": "देशभर में कृषि परिवर्तन की नई लहर",
    "stat_farmers": "सत्यापित किसान जुड़े हुए",
    "stat_customers": "संतुष्ट शहरी परिवार",
    "stat_income": "अधिक शुद्ध किसान आय",
    "stat_waste": "कम फसल बर्बादी",

    // Farmer Dashboard
    "farmer_welcome": "स्वागत है",
    "farmer_subtext": "आपका डिजिटल कृषि नियंत्रण केंद्र फसल के हर चरण में आपकी सेवा में तैयार है।",
    "btn_quick_actions": "त्वरित कार्य",
    "action_add_product": "नया उत्पाद जोड़ें",
    "action_orders": "ऑर्डर संभालें",
    "action_scan_crop": "फसल रोग जांचें",
    "action_weather": "मौसम रडार देखें",
    "stat_active_products": "सक्रिय उत्पाद",
    "stat_total_orders": "कुल ऑर्डर",
    "stat_monthly_revenue": "इस महीने की आय",
    "stat_units_sold": "बेची गई इकाइयां",
    "btn_explore_models": "मॉडल देखें",
    "btn_analyze_soil": "मिट्टी जांचें",
    "btn_check_weather": "मौसम देखें",
    "btn_find_equipment": "उपकरण खोजें",
    "btn_scan_crop": "फसल स्कैन करें",
    "btn_ask_expert": "विशेषज्ञ से पूछें",
    "btn_irrigation_plan": "सिंचाई योजना",
    "btn_view_advisory": "सलाह देखें",
    "btn_view_rates": "भाव देखें",
    "btn_manage_inv": "इन्वेंटरी संभालें",
    "btn_manage_orders": "ऑर्डर देखें",
    "btn_rent_harvester": "हार्वेस्टर बुक करें",

    // Customer Dashboard
    "customer_welcome": "नमस्ते",
    "customer_subtext": "खेत से ताज़ी जैविक सब्ज़ियां सीधे आपके दरवाज़े तक। आज ही स्थानीय किसानों का समर्थन करें।",
    "customer_search_placeholder": "ताज़ी सब्ज़ियां खोजें...",
    "stat_avail_items": "उपलब्ध उत्पाद",
    "stat_your_orders": "आपके ऑर्डर",
    "stat_organic_guar": "100% जैविक गारंटी",
    "feat_browse_title": "उत्पाद ब्राउज़ करें",
    "feat_browse_desc": "स्थानीय किसानों से सीधे ताज़ी सब्ज़ियां और जैविक उत्पाद खोजें।",
    "feat_plans_title": "डिलीवरी योजनाएं",
    "feat_plans_desc": "घर पर साप्ताहिक ताज़ी टोकरी डिलीवरी के लिए सब्सक्राइब करें।",
    "feat_track_title": "ऑर्डर ट्रैक करें",
    "feat_track_desc": "अपनी हालिया खरीदारी और डिलीवरी स्थिति पर नज़र रखें।",
    "feat_farmers_title": "किसान प्रोफाइल",
    "feat_farmers_desc": "अपनी फसल उगाने वाले किसानों से मिलें और उनकी रेटिंग देखें।",
    "feat_history_title": "खरीदारी इतिहास",
    "feat_history_desc": "पिछली खरीदारी से अपने पसंदीदा उत्पाद दोबारा आसानी से मंगाएं।",
    "feat_offers_title": "ऑफर एवं छूट",
    "feat_offers_desc": "ताज़ा उपज पर भारी छूट और मौसमी ऑफर्स देखें।",
    "btn_shop_now": "खरीदारी करें",
    "btn_view_plans": "योजनाएं देखें",
    "btn_my_orders": "मेरे ऑर्डर",
    "btn_meet_farmers": "किसानों से मिलें",
    "btn_view_history": "इतिहास देखें",
    "btn_claim_offers": "ऑफर पाएं"
  }
};

// Current active language: default is English or saved in localStorage
let currentLanguage = localStorage.getItem('agro_haat_lang') || 'en';

function applyLanguage(lang) {
  if (!AGRO_TRANSLATIONS[lang]) return;
  currentLanguage = lang;
  localStorage.setItem('agro_haat_lang', lang);

  // 1. Update text of all [data-i18n] elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (AGRO_TRANSLATIONS[lang][key]) {
      el.textContent = AGRO_TRANSLATIONS[lang][key];
    }
  });

  // 2. Update placeholders of all [data-i18n-placeholder] elements
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (AGRO_TRANSLATIONS[lang][key]) {
      el.placeholder = AGRO_TRANSLATIONS[lang][key];
    }
  });

  // 3. Update the toggle button label(s)
  document.querySelectorAll('#langToggleText').forEach(langLabel => {
    langLabel.textContent = lang === 'hi' ? 'English' : 'हिन्दी';
  });
  document.querySelectorAll('#langToggleFlag').forEach(langIcon => {
    langIcon.textContent = lang === 'hi' ? '🇬🇧' : '🇮🇳';
  });

  // 4. Update html lang attribute
  document.documentElement.lang = lang;
}

function toggleLanguage() {
  const newLang = currentLanguage === 'hi' ? 'en' : 'hi';
  applyLanguage(newLang);
}

// Automatically apply saved language on document ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => applyLanguage(currentLanguage));
} else {
  applyLanguage(currentLanguage);
}

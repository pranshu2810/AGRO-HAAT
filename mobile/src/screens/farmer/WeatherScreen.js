import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from '../../components/GlassCard';
import { LanguagePill } from '../../components/LanguagePill';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS, SIZES } from '../../constants/theme';

export default function WeatherScreen({ navigation }) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cityName, setCityName] = useState('Detecting Location...');
  const [searchCity, setSearchCity] = useState('');
  const [coords, setCoords] = useState({ lat: 28.7041, lon: 77.1025 }); // default Karnal/Delhi NCR
  const [isGpsActive, setIsGpsActive] = useState(false);

  const [weatherData, setWeatherData] = useState({
    temp: '26°C',
    feelsLike: '27°C',
    humidity: '62%',
    wind: '8 km/h NW',
    rainChance: '10%',
    conditionEn: 'Partly Cloudy • Optimal for Sowing',
    conditionHi: 'हल्के बादल • बुवाई हेतु उत्तम मौसम',
    icon: 'weather-partly-cloudy',
    iconColor: '#38bdf8',
    hourly: [],
    forecast: [],
    advisories: [],
  });

  // WMO Weather code mapper
  const parseWmoCode = (code) => {
    switch (code) {
      case 0:
        return {
          en: 'Clear Sky • Optimal for Field Work',
          hi: 'साफ आसमान • बुवाई व सिंचाई हेतु उत्तम',
          icon: 'weather-sunny',
          color: '#f59e0b',
        };
      case 1:
      case 2:
      case 3:
        return {
          en: 'Partly Cloudy • Mild Sunlight',
          hi: 'हल्के बादल • मध्यम धूप',
          icon: 'weather-partly-cloudy',
          color: '#38bdf8',
        };
      case 45:
      case 48:
        return {
          en: 'Misty / Foggy • High Soil Moisture',
          hi: 'कोहरा / धुंध • उच्च नमी',
          icon: 'weather-fog',
          color: '#94a3b8',
        };
      case 51:
      case 53:
      case 55:
        return {
          en: 'Light Drizzle • Postpone Foliar Spray',
          hi: 'हल्की बूंदाबांदी • स्प्रे टालें',
          icon: 'weather-rainy',
          color: '#06b6d4',
        };
      case 61:
      case 63:
      case 65:
        return {
          en: 'Rain Showers • Conserve Tubewell Electricity',
          hi: 'वर्षा • ट्यूबवेल सिंचाई बंद रखें',
          icon: 'weather-pouring',
          color: '#0284c7',
        };
      case 80:
      case 81:
      case 82:
        return {
          en: 'Heavy Showers • Clear Field Drainage',
          hi: 'तेज बारिश • जल निकासी की व्यवस्था करें',
          icon: 'weather-pouring',
          color: '#3b82f6',
        };
      case 95:
      case 96:
      case 99:
        return {
          en: 'Thunderstorm Warning • Shelter Farm Machinery',
          hi: 'आंधी-तूफान अलर्ट • मशीनरी को सुरक्षित स्थान पर रखें',
          icon: 'weather-lightning-rainy',
          color: '#f43f5e',
        };
      default:
        return {
          en: 'Pleasant Agricultural Weather',
          hi: 'अनुकूल कृषि मौसम',
          icon: 'weather-sunny',
          color: '#f59e0b',
        };
    }
  };

  // Fetch real weather from Open-Meteo using exact coordinates
  const fetchWeatherApi = async (latitude, longitude, customName = null) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

      const res = await fetch(url);
      const json = await res.json();

      if (json && json.current) {
        const cur = json.current;
        const wmo = parseWmoCode(cur.weather_code);

        // Hourly: extract next 6 intervals
        const hourlyArr = [];
        if (json.hourly && json.hourly.time) {
          const nowHour = new Date().getHours();
          for (let i = nowHour; i < Math.min(nowHour + 6, json.hourly.time.length); i++) {
            const hTime = new Date(json.hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const hCode = json.hourly.weather_code[i];
            const hWmo = parseWmoCode(hCode);
            hourlyArr.push({
              time: i === nowHour ? 'Now' : hTime,
              temp: `${Math.round(json.hourly.temperature_2m[i])}°`,
              rain: `${json.hourly.precipitation_probability ? json.hourly.precipitation_probability[i] : 0}%`,
              icon: hWmo.icon,
            });
          }
        }

        // Daily: next 5-7 days
        const dailyArr = [];
        if (json.daily && json.daily.time) {
          const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayNamesHi = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

          for (let d = 0; d < Math.min(6, json.daily.time.length); d++) {
            const dateObj = new Date(json.daily.time[d]);
            const dayIdx = dateObj.getDay();
            const dCode = json.daily.weather_code[d];
            const dWmo = parseWmoCode(dCode);
            const rainProb = json.daily.precipitation_probability_max ? json.daily.precipitation_probability_max[d] : 0;

            dailyArr.push({
              day: d === 0 ? (isHi ? 'आज' : 'Today') : (isHi ? dayNamesHi[dayIdx] : dayNamesEn[dayIdx]),
              temp: `${Math.round(json.daily.temperature_2m_max[d])}° / ${Math.round(json.daily.temperature_2m_min[d])}°`,
              rain: `${rainProb}%`,
              cond: isHi ? dWmo.hi.split('•')[0].trim() : dWmo.en.split('•')[0].trim(),
              icon: dWmo.icon,
              color: dWmo.color,
            });
          }
        }

        // Dynamic Advisories derived from real parameters
        const rainProbToday = json.daily?.precipitation_probability_max?.[0] || 0;
        const windSpeed = Math.round(cur.wind_speed_10m || 8);
        const tempVal = Math.round(cur.temperature_2m || 25);

        const dynamicAdvisories = [];

        if (rainProbToday > 40) {
          dynamicAdvisories.push({
            titleEn: '🌧️ Rainfall Expected Today (Smart Irrigation Alert)',
            titleHi: '🌧️ आज वर्षा की संभावना (स्मार्ट सिंचाई अलर्ट)',
            descEn: `Rainfall probability is ${rainProbToday}%. Delay tubewell or canal irrigation by 24-48 hours to save water and electricity.`,
            descHi: `आज बारिश की संभावना ${rainProbToday}% है। ट्यूबवेल या नहर से सिंचाई 1-2 दिन टालें, बिजली व पानी दोनों बचेंगे।`,
            color: '#06b6d4',
          });
          dynamicAdvisories.push({
            titleEn: '🌾 Harvest Protection Reminder',
            titleHi: '🌾 कटाई सुरक्षा अनुस्मारक',
            descEn: 'Move threshed grains and harvested produce under waterproof tarpaulins or into the collection hub.',
            descHi: 'कटी हुई फसल व अनाज को तिरपाल से ढकें या निकटतम एग्रो-हाट कलेक्शन हब पहुंचाएं।',
            color: '#f59e0b',
          });
        } else {
          dynamicAdvisories.push({
            titleEn: '🚜 Optimal Field Sowing Window',
            titleHi: '🚜 बुवाई का सबसे अनुकूल समय',
            descEn: `Dry air, light breeze (${windSpeed} km/h), and ${tempVal}°C soil temperature provide the perfect seedbed drilling conditions.`,
            descHi: `हवा की गति ${windSpeed} किमी/घंटा और तापमान ${tempVal}°C है। रबी/खरीफ बीजों की बुवाई के लिए उत्तम समय।`,
            color: '#10b981',
          });
        }

        if (windSpeed < 12 && rainProbToday < 25) {
          dynamicAdvisories.push({
            titleEn: '🧪 Foliar Spray & Nutrient Application Window',
            titleHi: '🧪 कीटनाशक व सूक्ष्म पोषक छिड़काव का उत्तम समय',
            descEn: `Wind speed is below 12 km/h (${windSpeed} km/h) with clear weather. Maximum leaf absorption for bio-fertilizers.`,
            descHi: `हवा शांत (${windSpeed} किमी/घंटा) और मौसम साफ है। स्प्रे करने पर दवाई पत्तों पर पूरी तरह चिपकेगी।`,
            color: '#38bdf8',
          });
        } else if (windSpeed >= 15) {
          dynamicAdvisories.push({
            titleEn: '⚠️ High Wind Speed: Postpone Spraying',
            titleHi: '⚠️ तेज हवा: रासायनिक छिड़काव स्थगित रखें',
            descEn: `Winds of ${windSpeed} km/h cause chemical drift. Avoid pesticide spraying until wind calms below 10 km/h.`,
            descHi: `हवा की गति ${windSpeed} किमी/घंटा है। दवा उड़कर बेकार हो जाएगी, शांत मौसम की प्रतीक्षा करें।`,
            color: '#f43f5e',
          });
        }

        setWeatherData({
          temp: `${Math.round(cur.temperature_2m)}°C`,
          feelsLike: `${Math.round(cur.apparent_temperature)}°C`,
          humidity: `${cur.relative_humidity_2m}%`,
          wind: `${windSpeed} km/h`,
          rainChance: `${rainProbToday}%`,
          conditionEn: wmo.en,
          conditionHi: wmo.hi,
          icon: wmo.icon,
          iconColor: wmo.color,
          hourly: hourlyArr,
          forecast: dailyArr,
          advisories: dynamicAdvisories,
        });

        if (customName) {
          setCityName(customName);
        }
      }
    } catch (err) {
      console.log('Error fetching weather API:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Get User's Real GPS Current Location
  const detectCurrentLocation = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Fallback to IP Geolocation if GPS permission denied
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          const ipJson = await ipRes.json();
          if (ipJson && ipJson.latitude && ipJson.longitude) {
            const locName = `${ipJson.city || 'Local Hub'}, ${ipJson.region || 'India'}`;
            setCoords({ lat: ipJson.latitude, lon: ipJson.longitude });
            setIsGpsActive(false);
            await fetchWeatherApi(ipJson.latitude, ipJson.longitude, locName);
            return;
          }
        } catch (e) {}

        // Fallback default Karnal
        setCoords({ lat: 29.6857, lon: 76.9905 });
        setCityName('Karnal (Haryana Hub)');
        setIsGpsActive(false);
        await fetchWeatherApi(29.6857, 76.9905, 'Karnal (Haryana Hub)');
        return;
      }

      // GPS Permission Granted
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setCoords({ lat: latitude, lon: longitude });
      setIsGpsActive(true);

      // Reverse geocode to get city/district
      let detectedName = 'Live Location';
      try {
        const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverse && reverse.length > 0) {
          const place = reverse[0];
          detectedName = `${place.city || place.district || place.subregion || 'Your Field'}, ${place.region || 'India'}`;
        }
      } catch (e) {
        detectedName = 'Your Field (GPS)';
      }

      await fetchWeatherApi(latitude, longitude, detectedName);
    } catch (err) {
      console.log('Location detection error:', err);
      // Fallback
      setCoords({ lat: 29.6857, lon: 76.9905 });
      setCityName('Karnal (Agro Hub)');
      await fetchWeatherApi(29.6857, 76.9905, 'Karnal (Agro Hub)');
    }
  };

  // Search City by Name
  const handleSearchCity = async () => {
    if (!searchCity.trim()) return;
    setLoading(true);
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity.trim())}&count=1&language=en&format=json`;
      const res = await fetch(geoUrl);
      const json = await res.json();

      if (json && json.results && json.results.length > 0) {
        const place = json.results[0];
        const formatted = `${place.name}, ${place.admin1 || place.country || ''}`;
        setCoords({ lat: place.latitude, lon: place.longitude });
        setIsGpsActive(false);
        await fetchWeatherApi(place.latitude, place.longitude, formatted);
        setSearchCity('');
      } else {
        Alert.alert(
          isHi ? 'शहर नहीं मिला' : 'City Not Found',
          isHi ? 'कृपया सही शहर का नाम दर्ज करें।' : 'Could not find city. Please verify spelling.'
        );
        setLoading(false);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not search location.');
      setLoading(false);
    }
  };

  // Preset Hub Selection
  const selectPresetHub = (hub) => {
    setCoords({ lat: hub.lat, lon: hub.lon });
    setIsGpsActive(false);
    setLoading(true);
    fetchWeatherApi(hub.lat, hub.lon, hub.name);
  };

  useEffect(() => {
    detectCurrentLocation();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('FarmerDashboard'))}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={18} color="#ffffff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>
              {isHi ? '🌦️ कृषि मौसम एवं मानसून रडार' : '🌦️ Agricultural Weather Radar'}
            </Text>
            <Text style={styles.headerSub}>
              {isHi ? 'लाइव जीपीएस एवं ओपन-वेदर एपीआई डेटा' : 'Real-time GPS Location & Live Meteorological API'}
            </Text>
          </View>
          <LanguagePill />
        </View>

        {/* GPS Location Bar with Refresh Button */}
        <View style={styles.gpsBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <Ionicons
              name={isGpsActive ? 'navigate-circle' : 'location-sharp'}
              size={18}
              color={isGpsActive ? '#10b981' : COLORS.primaryLight}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.gpsStatusText}>
                {isGpsActive
                  ? (isHi ? 'सटीक लाइव जीपीएस लोकेशन' : 'Accurate Device GPS Active')
                  : (isHi ? 'चयनित कृषि हब' : 'Selected Agricultural Hub')}
              </Text>
              <Text style={styles.gpsCityName} numberOfLines={1}>
                {cityName}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.gpsRefreshBtn}
            onPress={detectCurrentLocation}
            disabled={refreshing}
          >
            <Feather name="refresh-cw" size={13} color="#ffffff" style={refreshing ? styles.rotating : null} />
            <Text style={styles.gpsRefreshText}>{isHi ? 'जीपीएस रिफ्रेश' : 'Detect GPS'}</Text>
          </TouchableOpacity>
        </View>

        {/* City Search Bar */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchInputWrap}>
            <Feather name="search" size={15} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder={isHi ? 'भारत का कोई भी शहर खोजें...' : 'Search any city or village in India...'}
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={searchCity}
              onChangeText={setSearchCity}
              onSubmitEditing={handleSearchCity}
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearchCity}>
            <Text style={styles.searchBtnText}>{isHi ? 'खोजें' : 'Search'}</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Agricultural Hub Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hubScroll}>
          {[
            { id: 'karnal', name: 'Karnal (Haryana)', lat: 29.6857, lon: 76.9905 },
            { id: 'sonipat', name: 'Sonipat (Haryana)', lat: 28.9931, lon: 77.0151 },
            { id: 'delhi', name: 'Azadpur (Delhi)', lat: 28.7171, lon: 77.1723 },
            { id: 'nagpur', name: 'Nagpur (Maharashtra)', lat: 21.1458, lon: 79.0882 },
            { id: 'jaipur', name: 'Jaipur (Rajasthan)', lat: 26.9124, lon: 75.7873 },
            { id: 'indore', name: 'Indore (MP)', lat: 22.7196, lon: 75.8577 },
          ].map((hub) => (
            <TouchableOpacity
              key={hub.id}
              style={[
                styles.hubChip,
                cityName.toLowerCase().includes(hub.id) && styles.hubChipActive,
              ]}
              onPress={() => selectPresetHub(hub)}
            >
              <Text
                style={[
                  styles.hubChipText,
                  cityName.toLowerCase().includes(hub.id) && styles.hubChipTextActive,
                ]}
              >
                {hub.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>
              {isHi ? 'उपग्रह एवं मौसम स्टेशन से लाइव डेटा प्राप्त कर रहे हैं...' : 'Fetching Live Satellite Weather Data...'}
            </Text>
          </View>
        ) : (
          <>
            {/* Current Weather Card */}
            <GlassCard heavy style={styles.currentCard}>
              <View style={styles.currentTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationText}>{cityName}</Text>
                  <Text style={styles.currentTemp}>{weatherData.temp}</Text>
                  <Text style={styles.currentCond}>
                    {isHi ? weatherData.conditionHi : weatherData.conditionEn}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={weatherData.icon}
                  size={68}
                  color={weatherData.iconColor}
                />
              </View>

              {/* Key Agro Metrics */}
              <View style={styles.statsRow}>
                <View style={styles.subStat}>
                  <Text style={styles.statVal}>{weatherData.humidity}</Text>
                  <Text style={styles.statLbl}>{isHi ? 'नमी (Humidity)' : 'Humidity'}</Text>
                </View>
                <View style={styles.subStat}>
                  <Text style={styles.statVal}>{weatherData.wind}</Text>
                  <Text style={styles.statLbl}>{isHi ? 'हवा (Wind)' : 'Wind Speed'}</Text>
                </View>
                <View style={styles.subStat}>
                  <Text style={[styles.statVal, { color: '#06b6d4' }]}>{weatherData.rainChance}</Text>
                  <Text style={styles.statLbl}>{isHi ? 'वर्षा संभावना' : 'Rain Probability'}</Text>
                </View>
                <View style={styles.subStat}>
                  <Text style={styles.statVal}>{weatherData.feelsLike}</Text>
                  <Text style={styles.statLbl}>{isHi ? 'महसूस (Feels)' : 'Feels Like'}</Text>
                </View>
              </View>
            </GlassCard>

            {/* Hourly Precipitation & Temp Radar */}
            {weatherData.hourly && weatherData.hourly.length > 0 && (
              <>
                <Text style={styles.sectionHeading}>
                  {isHi ? 'आगामी घंटों का वर्षा एवं तापमान ग्राफ' : 'Hourly Precipitation & Temp Radar'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
                  {weatherData.hourly.map((h, idx) => (
                    <GlassCard key={idx} style={styles.hourlyCard}>
                      <Text style={styles.hourlyTime}>{h.time}</Text>
                      <MaterialCommunityIcons name={h.icon} size={24} color="#38bdf8" style={{ marginVertical: 6 }} />
                      <Text style={styles.hourlyTemp}>{h.temp}</Text>
                      <View style={styles.rainBadge}>
                        <Ionicons name="water" size={10} color="#06b6d4" />
                        <Text style={styles.rainText}>{h.rain}</Text>
                      </View>
                    </GlassCard>
                  ))}
                </ScrollView>
              </>
            )}

            {/* 6-Day Agricultural Outlook */}
            <Text style={styles.sectionHeading}>
              {isHi ? '6-दिवसीय मौसम पूर्वानुमान' : '6-Day Agricultural Forecast Outlook'}
            </Text>
            <GlassCard style={styles.forecastCard}>
              {weatherData.forecast.map((f, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.forecastRow,
                    idx === weatherData.forecast.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={styles.forecastDay}>{f.day}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, width: 110 }}>
                    <MaterialCommunityIcons name={f.icon} size={20} color={f.color} />
                    <Text style={styles.forecastCond} numberOfLines={1}>{f.cond}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="water" size={11} color="#06b6d4" />
                    <Text style={styles.forecastRain}>{f.rain}</Text>
                  </View>
                  <Text style={styles.forecastTemp}>{f.temp}</Text>
                </View>
              ))}
            </GlassCard>

            {/* Live Weather-Linked Agricultural Advisories */}
            <Text style={styles.sectionHeading}>
              {isHi ? '🎯 लाइव मौसम आधारित कृषि सलाह' : '🎯 Live Weather-Linked Advisories'}
            </Text>
            {weatherData.advisories.map((adv, idx) => (
              <GlassCard key={idx} style={styles.advisoryCard}>
                <View style={styles.advHeader}>
                  <Text style={[styles.advTitle, { color: adv.color }]}>
                    {isHi ? adv.titleHi : adv.titleEn}
                  </Text>
                </View>
                <Text style={styles.advDesc}>
                  {isHi ? adv.descHi : adv.descEn}
                </Text>
              </GlassCard>
            ))}
          </>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  gpsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  gpsStatusText: {
    fontSize: 9.5,
    color: COLORS.primaryLight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gpsCityName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  gpsRefreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  gpsRefreshText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  searchBarRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    color: '#ffffff',
    fontSize: 12.5,
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  hubScroll: {
    marginBottom: 14,
  },
  hubChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  hubChipActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderColor: COLORS.primary,
  },
  hubChipText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  hubChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  loadingWrap: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  currentCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
  },
  currentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  currentTemp: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    marginVertical: 2,
  },
  currentCond: {
    fontSize: 12.5,
    color: COLORS.primaryLight,
    fontWeight: '700',
    maxWidth: 220,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  subStat: {
    alignItems: 'center',
  },
  statVal: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  statLbl: {
    color: COLORS.textMuted,
    fontSize: 9.5,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hourlyScroll: {
    marginBottom: 16,
  },
  hourlyCard: {
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 10,
    minWidth: 70,
  },
  hourlyTime: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  hourlyTemp: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  rainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  rainText: {
    color: '#06b6d4',
    fontSize: 10,
    fontWeight: '700',
  },
  forecastCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  forecastDay: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
    width: 60,
  },
  forecastCond: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  forecastRain: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: '700',
  },
  forecastTemp: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  advisoryCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  advHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  advTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  advDesc: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 17,
  },
});

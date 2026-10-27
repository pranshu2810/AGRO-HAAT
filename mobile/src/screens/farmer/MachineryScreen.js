import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from '../../components/GlassCard';
import { LanguagePill } from '../../components/LanguagePill';
import { useLanguage } from '../../context/LanguageContext';
import { COLORS, SIZES } from '../../constants/theme';

export default function MachineryScreen({ navigation, route }) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const initialCat = route?.params?.initialCategory || 'all';
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' (किराये पर लें) or 'my_machinery' (मेरी लिस्टेड मशीनें)

  React.useEffect(() => {
    if (route?.params?.initialCategory) {
      setActiveCategory(route.params.initialCategory);
    }
  }, [route?.params?.initialCategory]);

  // Renting Modal State
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingDate, setBookingDate] = useState('Tomorrow (कल)');
  const [hours, setHours] = useState('4');
  const [withOperator, setWithOperator] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Listing Machinery for Rent State (Farmer rent-out feature)
  const [listModalVisible, setListModalVisible] = useState(false);
  const [newMachName, setNewMachName] = useState('');
  const [newMachCat, setNewMachCat] = useState('prep'); // 'prep' or 'harvest'
  const [newMachRate, setNewMachRate] = useState('');
  const [newMachLocation, setNewMachLocation] = useState('Karnal (करनाल)');
  const [newMachOperator, setNewMachOperator] = useState(true);
  const [newMachPhone, setNewMachPhone] = useState('9812345678');
  const [newMachSpecs, setNewMachSpecs] = useState('');
  const [listToastMsg, setListToastMsg] = useState('');

  // Farmer's own machinery listed for rent
  const [myListedMachinery, setMyListedMachinery] = useState([
    {
      id: 'my-m1',
      nameEn: 'Swaraj 855 FE (52 HP)',
      nameHi: 'स्वराज 855 FE (52 HP)',
      category: 'prep',
      rate: 850,
      unit: '/ hour',
      location: 'Karnal Village Hub',
      status: 'Available',
      statusHi: 'किराये हेतु उपलब्ध',
      statusColor: '#10b981',
      operator: true,
      earnings: '₹12,750',
      specs: '52 HP • Dual Clutch • 3-Bottom Reversible Plough included',
    },
    {
      id: 'my-m2',
      nameEn: 'Happy Seeder & Mulcher',
      nameHi: 'हैप्पी सीडर एवं मल्चर',
      category: 'prep',
      rate: 900,
      unit: '/ hour',
      location: 'Taraori Rural Center',
      status: 'Rented',
      statusHi: 'वर्तमान में किराये पर',
      statusColor: '#06b6d4',
      operator: true,
      earnings: '₹5,400',
      specs: 'Zero stubble burning direct wheat seeding in rice residue',
    },
  ]);

  // Bookings Made by Farmer
  const [myBookings, setMyBookings] = useState([
    {
      id: 'BK-101',
      name: 'Laser Land Leveler (GPS)',
      owner: 'Gurpreet Singh (Karnal)',
      date: '20 Oct 2026',
      hours: '3 Hours',
      total: '₹3,600',
      status: 'Confirmed (पुष्टि)',
      statusColor: '#10b981',
    },
  ]);

  // Public Catalog of Machinery
  const [catalogItems, setCatalogItems] = useState([
    {
      id: 'm1',
      category: 'prep',
      nameEn: 'Mahindra 575 DI (50 HP Tractor)',
      nameHi: 'महिंद्रा 575 DI (50 HP ट्रैक्टर)',
      typeEn: 'Primary Tillage & Haulage',
      typeHi: 'प्राथमिक जुताई एवं ढुलाई',
      rate: 800,
      unit: '/ hour',
      distance: '2.4 km away',
      owner: 'Rameshwar Lal • 4.8 ★',
      icon: 'tractor',
      iconType: 'FontAwesome5',
      available: true,
      specsEn: '50 HP Engine • Dual Clutch • Reversible Plough Ready',
      specsHi: '50 हॉर्सपावर इंजन • दोहरे क्लच • गहरी जुताई हेतु उपयुक्त',
    },
    {
      id: 'm2',
      category: 'prep',
      nameEn: 'Laser Land Leveler (GPS Guided)',
      nameHi: 'लेजर लैंड लेवलर (GPS गाइडेड)',
      typeEn: 'Precision Water-Saving Leveling',
      typeHi: 'सटीक भूमि समतलीकरण (30% पानी की बचत)',
      rate: 1200,
      unit: '/ hour',
      distance: '3.8 km away',
      owner: 'Baljeet Machinery Hub • 4.9 ★',
      icon: 'crosshairs',
      iconType: 'FontAwesome5',
      available: true,
      specsEn: 'Transmitter & Receiver Included • Conserves 25-30% Irrigation Water',
      specsHi: 'ट्रांसमीटर और रिसीवर शामिल • सिंचाई पानी की 30% बचत',
    },
    {
      id: 'm3',
      category: 'prep',
      nameEn: 'Shaktiman 7-Feet Heavy Rotavator',
      nameHi: 'शक्तिमान 7-फीट रोटावेटर',
      typeEn: 'Fine Seedbed Preparation',
      typeHi: 'महीन बीजबेड तैयारी व मिट्टी भुरभुरी करना',
      rate: 700,
      unit: '/ hour',
      distance: '1.9 km away',
      owner: 'Sukhdev Singh • 4.7 ★',
      icon: 'cogs',
      iconType: 'FontAwesome5',
      available: true,
      specsEn: 'Boron Steel Blades • Fast Seedbed Preparation in 1 Pass',
      specsHi: 'बोरोन स्टील ब्लेड • एक ही बार में उत्तम मिट्टी तैयार',
    },
    {
      id: 'm4',
      category: 'harvest',
      nameEn: 'Claas Crop Tiger 30 Combine Harvester',
      nameHi: 'क्लास क्रॉप टाइगर 30 कंबाइन हार्वेस्टर',
      typeEn: 'Paddy & Wheat Grain Harvesting',
      typeHi: 'धान व गेहूं की एक-साथ कटाई व मड़ाई',
      rate: 2400,
      unit: '/ hour',
      distance: '4.5 km away',
      owner: 'Chaudhary Agro Services • 4.9 ★',
      icon: 'truck-pickup',
      iconType: 'FontAwesome5',
      available: true,
      specsEn: 'Track Type / Wheel Type • 99% Grain Separation • Low Loss',
      specsHi: 'ट्रैक/पहिया मॉडल • 99% दाना साफ • भूसे का नुकसान न्यूनतम',
    },
    {
      id: 'm5',
      category: 'prep',
      nameEn: 'Super Seeder (No Residue Burning)',
      nameHi: 'सुपर सीडर (पराली प्रबंधन एवं सीधी बुवाई)',
      typeEn: 'Direct In-Situ Sowing',
      typeHi: 'धान की पराली में गेहूं की सीधी बुवाई',
      rate: 950,
      unit: '/ hour',
      distance: '3.1 km away',
      owner: 'Harpreet Krishi Seva • 4.8 ★',
      icon: 'seedling',
      iconType: 'FontAwesome5',
      available: true,
      specsEn: 'Mulches straw and sows wheat simultaneously with fertilizer drill',
      specsHi: 'पराली को काटकर दबाता है और गेहूं की बुवाई खाद सहित करता है',
    },
    {
      id: 'm6',
      category: 'harvest',
      nameEn: 'Multi-Crop High-Speed Thresher',
      nameHi: 'मल्टी-क्रॉप हाई-स्पीड थ्रेशर',
      typeEn: 'Grain Separation from Stalks',
      typeHi: 'सरसों, चना एवं गेहूं की मड़ाई',
      rate: 900,
      unit: '/ hour',
      distance: '2.0 km away',
      owner: 'Kisan Seva Samiti • 4.6 ★',
      icon: 'fan',
      iconType: 'FontAwesome5',
      available: true,
      specsEn: 'Triple Fan Cleaning • Zero grain breakage guarantee',
      specsHi: 'तीन पंखे वाली सफाई प्रणाली • दाना टूटने की शून्य संभावना',
    },
  ]);

  const filteredItems = activeCategory === 'all'
    ? catalogItems
    : catalogItems.filter(item => item.category === activeCategory);

  const openBookingModal = (machine) => {
    setSelectedMachine(machine);
    setBookingModalVisible(true);
  };

  const confirmBooking = () => {
    if (!selectedMachine) return;
    const hrsNum = parseInt(hours) || 2;
    const operatorCharge = withOperator ? 200 : 0;
    const totalAmount = (selectedMachine.rate * hrsNum) + operatorCharge;

    const newBooking = {
      id: `BK-${Math.floor(100 + Math.random() * 900)}`,
      name: isHi ? selectedMachine.nameHi : selectedMachine.nameEn,
      owner: selectedMachine.owner,
      date: bookingDate,
      hours: `${hrsNum} Hours`,
      total: `₹${totalAmount.toLocaleString()}`,
      status: isHi ? 'पुष्टि हो गई (Confirmed)' : 'Confirmed',
      statusColor: '#10b981',
    };

    setMyBookings([newBooking, ...myBookings]);
    setBookingModalVisible(false);
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 3000);
  };

  // Farmer Listing New Machinery Handler
  const handleListMyMachine = () => {
    if (!newMachName.trim() || !newMachRate.trim()) {
      Alert.alert(
        isHi ? 'विवरण अधूरा है' : 'Incomplete Details',
        isHi ? 'कृपया मशीन का नाम एवं किराया दर दर्ज करें।' : 'Please enter machine name and rental rate.'
      );
      return;
    }

    const rateNum = parseInt(newMachRate) || 800;

    const newMyItem = {
      id: `my-m${Date.now()}`,
      nameEn: newMachName,
      nameHi: newMachName,
      category: newMachCat,
      rate: rateNum,
      unit: '/ hour',
      location: newMachLocation,
      status: 'Available',
      statusHi: 'किराये हेतु उपलब्ध',
      statusColor: '#10b981',
      operator: newMachOperator,
      earnings: '₹0 (New)',
      specs: newMachSpecs || (newMachOperator ? 'Driver / Operator Included' : 'Self-drive / Machinery only'),
    };

    // Also add to public catalog so other farmers can rent it!
    const catalogEntry = {
      id: `cat-${newMyItem.id}`,
      category: newMachCat,
      nameEn: `${newMachName} (Your Machine)`,
      nameHi: `${newMachName} (आपकी मशीन)`,
      typeEn: newMachCat === 'prep' ? 'Land Preparation' : 'Harvesting & Threshing',
      typeHi: newMachCat === 'prep' ? 'भूमि तैयारी' : 'फसल कटाई एवं मड़ाई',
      rate: rateNum,
      unit: '/ hour',
      distance: '0 km (Your Yard)',
      owner: 'You (Farmer Owner) • 5.0 ★',
      icon: newMachCat === 'prep' ? 'tractor' : 'truck-pickup',
      iconType: 'FontAwesome5',
      available: true,
      specsEn: newMachSpecs || 'Farmer verified equipment ready for dispatch',
      specsHi: newMachSpecs || 'सत्यापित किसान उपकरण • तुरंत बुकिंग हेतु उपलब्ध',
      isMine: true,
    };

    setMyListedMachinery([newMyItem, ...myListedMachinery]);
    setCatalogItems([catalogEntry, ...catalogItems]);
    setListModalVisible(false);
    setNewMachName('');
    setNewMachRate('');
    setNewMachSpecs('');
    setListToastMsg(
      isHi
        ? 'आपकी मशीनरी सफलतापूर्वक किराये के लिए लिस्ट हुई!'
        : 'Your machinery has been successfully listed for rent!'
    );
    setTimeout(() => setListToastMsg(''), 3500);
  };

  const toggleMachineStatus = (id) => {
    setMyListedMachinery(prev =>
      prev.map(m => {
        if (m.id === id) {
          const nextStatus = m.status === 'Available' ? 'Rented' : 'Available';
          return {
            ...m,
            status: nextStatus,
            statusHi: nextStatus === 'Available' ? 'किराये हेतु उपलब्ध' : 'वर्तमान में किराये पर',
            statusColor: nextStatus === 'Available' ? '#10b981' : '#06b6d4',
          };
        }
        return m;
      })
    );
  };

  const deleteMyMachine = (id) => {
    setMyListedMachinery(prev => prev.filter(m => m.id !== id));
  };

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
              {isHi ? '🚜 कृषि मशीनरी एवं उपकरण किराया' : '🚜 Farm Machinery & Harvester Rental'}
            </Text>
            <Text style={styles.headerSub}>
              {isHi ? 'किराये पर लें या अपनी मशीन किराये पर चढ़ाएं' : 'Rent Equipment or List Your Own Machinery for Income'}
            </Text>
          </View>
          <LanguagePill />
        </View>

        {/* Success Alert Toast */}
        {(bookingSuccess || listToastMsg) && (
          <View style={styles.toastSuccess}>
            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            <Text style={styles.toastText}>
              {listToastMsg || (isHi ? 'मशीनरी बुकिंग सफलतापूर्वक पंजीकृत हुई!' : 'Machinery booked successfully! Owner notified.')}
            </Text>
          </View>
        )}

        {/* Dual Mode Switch (Browse to Rent vs List My Equipment) */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'browse' && styles.modeTabActive]}
            onPress={() => setActiveTab('browse')}
          >
            <FontAwesome5 name="search" size={12} color={activeTab === 'browse' ? '#ffffff' : COLORS.textMuted} />
            <Text style={[styles.modeTabText, activeTab === 'browse' && styles.modeTabTextActive]}>
              {isHi ? 'उपकरण किराये पर लें' : 'Rent Equipment'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'my_machinery' && styles.modeTabActiveGreen]}
            onPress={() => setActiveTab('my_machinery')}
          >
            <FontAwesome5 name="tractor" size={12} color={activeTab === 'my_machinery' ? '#ffffff' : COLORS.textMuted} />
            <Text style={[styles.modeTabText, activeTab === 'my_machinery' && styles.modeTabTextActive]}>
              {isHi ? 'अपनी मशीन किराये पर दें' : 'List My Equipment'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: BROWSE CATALOG */}
        {activeTab === 'browse' ? (
          <>
            {/* Category Filters */}
            <View style={styles.categoryRow}>
              <TouchableOpacity
                style={[styles.catBtn, activeCategory === 'all' && styles.catBtnActive]}
                onPress={() => setActiveCategory('all')}
              >
                <Text style={[styles.catBtnText, activeCategory === 'all' && styles.catBtnTextActive]}>
                  {isHi ? `सभी (${catalogItems.length})` : `All (${catalogItems.length})`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.catBtn, activeCategory === 'prep' && styles.catBtnActive]}
                onPress={() => setActiveCategory('prep')}
              >
                <Text style={[styles.catBtnText, activeCategory === 'prep' && styles.catBtnTextActive]}>
                  {isHi ? '🌱 भूमि तैयारी' : '🌱 Land Prep'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.catBtn, activeCategory === 'harvest' && styles.catBtnActive]}
                onPress={() => setActiveCategory('harvest')}
              >
                <Text style={[styles.catBtnText, activeCategory === 'harvest' && styles.catBtnTextActive]}>
                  {isHi ? '🌾 फसल कटाई' : '🌾 Harvest'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Machinery Cards List */}
            {filteredItems.map((item) => (
              <GlassCard key={item.id} style={styles.machineCard}>
                <View style={styles.cardTop}>
                  <View style={styles.iconCircle}>
                    <FontAwesome5 name={item.icon} size={22} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.machineName}>{isHi ? item.nameHi : item.nameEn}</Text>
                      {item.isMine && (
                        <View style={styles.mineBadge}>
                          <Text style={styles.mineBadgeText}>{isHi ? 'आपकी' : 'Yours'}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.machineType}>{isHi ? item.typeHi : item.typeEn}</Text>
                    <Text style={styles.ownerText}>{item.owner} • {item.distance}</Text>
                  </View>
                </View>

                <View style={styles.specBox}>
                  <Ionicons name="information-circle-outline" size={14} color={COLORS.primaryLight} />
                  <Text style={styles.specText}>{isHi ? item.specsHi : item.specsEn}</Text>
                </View>

                <View style={styles.cardBottom}>
                  <View>
                    <Text style={styles.rateLabel}>{isHi ? 'किराया दर' : 'Hourly Rate'}</Text>
                    <Text style={styles.rateVal}>
                      ₹{item.rate} <Text style={styles.rateUnit}>{item.unit}</Text>
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.bookBtn} onPress={() => openBookingModal(item)}>
                    <FontAwesome5 name="calendar-check" size={13} color="#ffffff" />
                    <Text style={styles.bookBtnText}>{isHi ? 'किराये पर बुक करें' : 'Book Equipment'}</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}

            {/* My Active Bookings Section */}
            {myBookings.length > 0 && (
              <View style={styles.myBookingsWrap}>
                <Text style={styles.sectionHeading}>
                  {isHi ? 'आपकी सक्रिय बुकिंग (My Bookings)' : 'Active Bookings Tracker'}
                </Text>
                {myBookings.map((b, idx) => (
                  <GlassCard key={idx} style={styles.bookingCard}>
                    <View style={styles.bookingRow}>
                      <View>
                        <Text style={styles.bookingId}>{b.id} • {b.date}</Text>
                        <Text style={styles.bookingName}>{b.name}</Text>
                        <Text style={styles.bookingSub}>{b.owner} • {b.hours}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.bookingTotal}>{b.total}</Text>
                        <View style={[styles.statusTag, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                          <Text style={[styles.statusText, { color: b.statusColor }]}>{b.status}</Text>
                        </View>
                      </View>
                    </View>
                  </GlassCard>
                ))}
              </View>
            )}
          </>
        ) : (
          /* TAB 2: MY LISTED MACHINERY (FARMER RENT-OUT OPTION) */
          <View style={styles.myMachineryContainer}>
            {/* Rental Income Glass Banner */}
            <GlassCard heavy style={styles.incomeCard}>
              <View style={styles.incomeHeader}>
                <View>
                  <Text style={styles.incomeSub}>{isHi ? 'इस सीजन की कुल मशीनरी कमाई' : 'Season Rental Earnings'}</Text>
                  <Text style={styles.incomeAmount}>₹18,150</Text>
                </View>
                <View style={styles.incomeIconWrap}>
                  <FontAwesome5 name="wallet" size={24} color="#10b981" />
                </View>
              </View>

              <View style={styles.incomeMetrics}>
                <View style={styles.incMetric}>
                  <Text style={styles.incMetVal}>{myListedMachinery.length}</Text>
                  <Text style={styles.incMetLbl}>{isHi ? 'लिस्टेड मशीनें' : 'Machines Listed'}</Text>
                </View>
                <View style={styles.incMetric}>
                  <Text style={styles.incMetVal}>8</Text>
                  <Text style={styles.incMetLbl}>{isHi ? 'कुल बुकिंग्स' : 'Total Bookings'}</Text>
                </View>
                <View style={styles.incMetric}>
                  <Text style={styles.incMetVal}>4.9 ★</Text>
                  <Text style={styles.incMetLbl}>{isHi ? 'मालिक रेटिंग' : 'Owner Rating'}</Text>
                </View>
              </View>
            </GlassCard>

            {/* List New Machine Button */}
            <TouchableOpacity
              style={styles.addNewMachBtn}
              onPress={() => setListModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={20} color="#ffffff" />
              <Text style={styles.addNewMachText}>
                {isHi ? '+ अपनी मशीन किराये पर जोड़ें' : '+ List Equipment for Rent'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.sectionHeading}>
              {isHi ? 'मेरी किराये पर उपलब्ध मशीनें' : 'Your Equipment Listed for Rent'}
            </Text>

            {myListedMachinery.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <FontAwesome5 name="tractor" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>{isHi ? 'कोई मशीन लिस्ट नहीं है' : 'No Equipment Listed Yet'}</Text>
                <Text style={styles.emptySub}>
                  {isHi
                    ? 'अपने खाली समय में ट्रैक्टर, थ्रेशर या हार्वेस्टर किराये पर देकर प्रतिदिन ₹2,000-5,000 कमाएं।'
                    : 'List your tractor, thresher, or harvester to earn daily rental income from nearby farmers.'}
                </Text>
              </GlassCard>
            ) : (
              myListedMachinery.map((m) => (
                <GlassCard key={m.id} style={styles.myMachineCard}>
                  <View style={styles.myMachTop}>
                    <View style={styles.myMachIconCircle}>
                      <FontAwesome5
                        name={m.category === 'prep' ? 'tractor' : 'truck-pickup'}
                        size={20}
                        color={COLORS.primaryLight}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.myMachName}>{isHi ? m.nameHi : m.nameEn}</Text>
                      <Text style={styles.myMachLocation}>📍 {m.location} • ₹{m.rate}/hr</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleMachineStatus(m.id)}
                      style={[
                        styles.statusTogglePill,
                        { backgroundColor: m.status === 'Available' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)' },
                      ]}
                    >
                      <Text style={[styles.statusToggleText, { color: m.statusColor }]}>
                        {isHi ? m.statusHi : m.status}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.myMachSpecs}>{m.specs}</Text>

                  <View style={styles.myMachBottom}>
                    <View>
                      <Text style={styles.earnedLbl}>{isHi ? 'कुल अर्जित किराया' : 'Earned Revenue'}</Text>
                      <Text style={styles.earnedVal}>{m.earnings}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={styles.toggleBtnSmall}
                        onPress={() => toggleMachineStatus(m.id)}
                      >
                        <Feather name="refresh-cw" size={12} color="#ffffff" />
                        <Text style={styles.toggleBtnText}>{isHi ? 'स्थिति बदलें' : 'Toggle Status'}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtnSmall}
                        onPress={() => deleteMyMachine(m.id)}
                      >
                        <Ionicons name="trash-outline" size={14} color="#f43f5e" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </GlassCard>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* MODAL 1: BOOKING MODAL (RENTING FROM OTHERS) */}
      <Modal visible={bookingModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard heavy style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isHi ? 'मशीनरी बुकिंग विवरण' : 'Machinery Booking Details'}</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {selectedMachine && (
              <>
                <Text style={styles.modalMachineName}>{isHi ? selectedMachine.nameHi : selectedMachine.nameEn}</Text>
                <Text style={styles.modalRateText}>₹{selectedMachine.rate} / hour</Text>

                <Text style={styles.inputLabel}>{isHi ? 'तारीख / समय:' : 'Required Date & Slot:'}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={bookingDate}
                  onChangeText={setBookingDate}
                  placeholder="Tomorrow 7:00 AM"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />

                <Text style={styles.inputLabel}>{isHi ? 'आवश्यक घंटे (Hours):' : 'Estimated Hours:'}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={hours}
                  onChangeText={setHours}
                  keyboardType="numeric"
                  placeholder="4"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />

                <TouchableOpacity
                  style={styles.operatorToggle}
                  onPress={() => setWithOperator(!withOperator)}
                >
                  <Ionicons
                    name={withOperator ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.operatorText}>
                    {isHi ? 'कुशल ऑपरेटर (चालक) भी चाहिए (+₹200)' : 'Experienced Operator Included (+₹200)'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.summaryBox}>
                  <Text style={styles.sumLbl}>{isHi ? 'कुल अनुमानित देय:' : 'Total Estimated Cost:'}</Text>
                  <Text style={styles.sumVal}>
                    ₹{((selectedMachine.rate * (parseInt(hours) || 1)) + (withOperator ? 200 : 0)).toLocaleString()}
                  </Text>
                </View>

                <TouchableOpacity style={styles.confirmBtn} onPress={confirmBooking}>
                  <Ionicons name="checkmark-done" size={16} color="#ffffff" />
                  <Text style={styles.confirmBtnText}>{isHi ? 'बुकिंग की पुष्टि करें' : 'Confirm & Reserve Slot'}</Text>
                </TouchableOpacity>
              </>
            )}
          </GlassCard>
        </View>
      </Modal>

      {/* MODAL 2: LIST MY EQUIPMENT FOR RENT (FARMER RENT-OUT MODAL) */}
      <Modal visible={listModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard heavy style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {isHi ? '🚜 अपनी मशीन किराये पर जोड़ें' : '🚜 List Equipment for Rent'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {isHi ? '0% कमीशन • सीधा स्थानीय किसानों से जुड़ें' : '0% Commission • Earn Daily Rental Income'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setListModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>{isHi ? 'मशीन / उपकरण का नाम:' : 'Machine Name / Model:'}</Text>
              <TextInput
                style={styles.modalInput}
                value={newMachName}
                onChangeText={setNewMachName}
                placeholder={isHi ? 'उदा. स्वराज 855 FE (52 HP) ट्रैक्टर' : 'e.g. Swaraj 855 FE 52HP Tractor'}
                placeholderTextColor="rgba(255,255,255,0.4)"
              />

              <Text style={styles.inputLabel}>{isHi ? 'उपकरण श्रेणी:' : 'Category:'}</Text>
              <View style={styles.catSelectRow}>
                <TouchableOpacity
                  style={[styles.catSelectPill, newMachCat === 'prep' && styles.catSelectPillActive]}
                  onPress={() => setNewMachCat('prep')}
                >
                  <Text style={[styles.catSelectText, newMachCat === 'prep' && styles.catSelectTextActive]}>
                    🌱 {isHi ? 'भूमि तैयारी / ट्रैक्टर' : 'Land Prep / Tractor'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.catSelectPill, newMachCat === 'harvest' && styles.catSelectPillActive]}
                  onPress={() => setNewMachCat('harvest')}
                >
                  <Text style={[styles.catSelectText, newMachCat === 'harvest' && styles.catSelectTextActive]}>
                    🌾 {isHi ? 'कटाई / हार्वेस्टर' : 'Harvest / Combine'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>{isHi ? 'प्रति घंटा किराया दर (₹):' : 'Hourly Rate (₹/hr):'}</Text>
              <TextInput
                style={styles.modalInput}
                value={newMachRate}
                onChangeText={setNewMachRate}
                keyboardType="numeric"
                placeholder={isHi ? 'उदा. 800' : 'e.g. 800'}
                placeholderTextColor="rgba(255,255,255,0.4)"
              />

              <Text style={styles.inputLabel}>{isHi ? 'स्थान / गांव / तहसील:' : 'Location / Village Hub:'}</Text>
              <TextInput
                style={styles.modalInput}
                value={newMachLocation}
                onChangeText={setNewMachLocation}
                placeholder="Karnal (करनाल)"
                placeholderTextColor="rgba(255,255,255,0.4)"
              />

              <Text style={styles.inputLabel}>{isHi ? 'फोन / व्हाट्सएप संपर्क:' : 'Contact Mobile Number:'}</Text>
              <TextInput
                style={styles.modalInput}
                value={newMachPhone}
                onChangeText={setNewMachPhone}
                keyboardType="phone-pad"
                placeholder="9812345678"
                placeholderTextColor="rgba(255,255,255,0.4)"
              />

              <TouchableOpacity
                style={styles.operatorToggle}
                onPress={() => setNewMachOperator(!newMachOperator)}
              >
                <Ionicons
                  name={newMachOperator ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.operatorText}>
                  {isHi ? 'ऑपरेटर (चालक) भी उपलब्ध है' : 'Driver / Operator Provided with Machine'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>{isHi ? 'मशीन की विशेषताएं / विवरण:' : 'Specifications / Condition:'}</Text>
              <TextInput
                style={[styles.modalInput, { height: 60 }]}
                value={newMachSpecs}
                onChangeText={setNewMachSpecs}
                multiline
                placeholder={isHi ? 'उदा. नया रिवर्सिबल प्लाऊ शामिल, डीजल कुशल' : 'e.g. Reversible plough included, excellent condition'}
                placeholderTextColor="rgba(255,255,255,0.4)"
              />

              <TouchableOpacity style={styles.confirmBtn} onPress={handleListMyMachine}>
                <Ionicons name="cloud-upload" size={16} color="#ffffff" />
                <Text style={styles.confirmBtnText}>
                  {isHi ? 'किराये पर लाइव लिस्ट करें' : 'Publish for Local Rental'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>
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
  toastSuccess: {
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
  toastText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
    gap: 6,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.5)',
  },
  modeTabActiveGreen: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  modeTabText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  modeTabTextActive: {
    color: '#ffffff',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  catBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBtnActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.22)',
    borderColor: COLORS.primary,
  },
  catBtnText: {
    color: COLORS.textMuted,
    fontSize: 11.5,
    fontWeight: '700',
  },
  catBtnTextActive: {
    color: '#ffffff',
  },
  machineCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  machineName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  mineBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mineBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  machineType: {
    fontSize: 11.5,
    color: COLORS.primaryLight,
    fontWeight: '600',
    marginBottom: 2,
  },
  ownerText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  specBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 10,
    borderRadius: 10,
    gap: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  specText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  rateLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  rateVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
  },
  rateUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  bookBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  myBookingsWrap: {
    marginTop: 8,
  },
  sectionHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bookingCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingId: {
    fontSize: 10,
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  bookingName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#ffffff',
    marginVertical: 2,
  },
  bookingSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  bookingTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  // My Machinery Tab Styles
  myMachineryContainer: {
    gap: 12,
  },
  incomeCard: {
    padding: 16,
    borderRadius: 18,
  },
  incomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  incomeSub: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  incomeAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#10b981',
    marginTop: 2,
  },
  incomeIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  incMetric: {
    alignItems: 'center',
  },
  incMetVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  incMetLbl: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addNewMachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#16a34a',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  addNewMachText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '800',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  myMachineCard: {
    padding: 16,
    borderRadius: 16,
  },
  myMachTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  myMachIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myMachName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  myMachLocation: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusTogglePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusToggleText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  myMachSpecs: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
    marginBottom: 10,
  },
  myMachBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  earnedLbl: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  earnedVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10b981',
  },
  toggleBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleBtnText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '700',
  },
  deleteBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(244,63,94,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  modalSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMachineName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  modalRateText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 12,
  },
  catSelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  catSelectPill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  catSelectPillActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderColor: COLORS.primary,
  },
  catSelectText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  catSelectTextActive: {
    color: '#ffffff',
  },
  operatorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  operatorText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  sumLbl: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  sumVal: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '900',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    marginBottom: 10,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});

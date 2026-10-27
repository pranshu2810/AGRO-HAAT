"""
Agronomic Recommendation and Knowledge Engine
Provides certified disease descriptions, treatment protocols, chemical dosages,
prevention tips, and environmental risk correlations in both English and Hindi.
"""

DISEASE_KNOWLEDGE_BASE = {
    # ------------------ TOMATO ------------------
    "Tomato___Early_blight": {
        "crop": "Tomato",
        "disease": "Early Blight",
        "scientific_name": "Alternaria solani",
        "pathogen_type": "Fungal",
        "hindi_name": "टमाटर का अगेती झुलसा (Early Blight)",
        "why": "Caused by the fungus Alternaria solani. Produces dark brown to black spots with concentric rings (target-like pattern) on older leaves, causing yellowing and premature leaf drop.",
        "why_hi": "यह अल्टरनेरिया सोलानी कवक के कारण होता है। निचली पत्तियों पर भूरे-काले संकेंद्री छल्ले (Target spots) बनते हैं जिससे पत्तियां पीली होकर गिर जाती हैं।",
        "severity": "High (Yield loss can reach 35-50% if untreated)",
        "treatment": "Mancozeb 75% WP (Indofil M-45) or Chlorothalonil 75% WP or Saaf (Carbendazim 12% + Mancozeb 63% WP)",
        "quantity": "2 to 2.5 g per liter of water (500g per acre in 200L water)",
        "how": "Foliar spray using a knapsack sprayer with hollow cone nozzle, thoroughly covering both upper and lower leaf surfaces.",
        "when": "Spray immediately at the appearance of first concentric leaf spot. Repeat at 7-10 day intervals. Avoid spraying during rain or extreme midday heat.",
        "prevention": "Rotate crops with non-solanaceous plants for 2-3 years, stake plants to keep leaves off damp soil, use drip irrigation instead of overhead sprinklers, and destroy infected crop debris.",
        "favorable_environment": {
            "min_temp": 20, "max_temp": 30, "min_humidity": 75,
            "condition": "Warm temperatures (24-29°C) combined with high humidity and intermittent rain or dew accelerate fungal sporulation."
        }
    },
    "Tomato___Late_blight": {
        "crop": "Tomato",
        "disease": "Late Blight",
        "scientific_name": "Phytophthora infestans",
        "pathogen_type": "Oomycete / Water Mold",
        "hindi_name": "टमाटर का पछेती झुलसा (Late Blight)",
        "why": "Caused by Phytophthora infestans. Appears as water-soaked, dark lesions on leaves and stems, with white fuzzy fungal growth on the underside during humid weather.",
        "why_hi": "यह फाइटोफ्थोरा इनफेस्टैन्स के कारण होता है। पत्तियों पर जल-सिक्त काले धब्बे बनते हैं और उच्च नमी में सफेद फफूंद दिखाई देती है।",
        "severity": "Critical (Can completely wipe out crop within 7-10 days)",
        "treatment": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold) or Cymoxanil 8% + Mancozeb 64% WP (Curzate)",
        "quantity": "2.5 g per liter of water (500g per acre in 200L water)",
        "how": "High-pressure systemic foliar spray, ensuring entire plant canopy, stems, and fruit clusters are thoroughly covered.",
        "when": "Preventative spray before cloudy/misty weather, or immediately upon first sign. Repeat every 5-7 days under wet cool conditions.",
        "prevention": "Plant certified resistant varieties, ensure wide row spacing for canopy airflow, avoid overhead irrigation, and rogue out infected volunteer plants.",
        "favorable_environment": {
            "min_temp": 12, "max_temp": 22, "min_humidity": 85,
            "condition": "Cool, misty, foggy weather (15-20°C) with persistent leaf wetness (>90% humidity) causes explosive epidemic spread."
        }
    },
    "Tomato___Bacterial_spot": {
        "crop": "Tomato",
        "disease": "Bacterial Spot",
        "scientific_name": "Xanthomonas campestris pv. vesicatoria",
        "pathogen_type": "Bacterial",
        "hindi_name": "टमाटर का जीवाणु पत्ती धब्बा (Bacterial Spot)",
        "why": "Bacterial infection causing small, water-soaked, greasy dark circular spots on leaves that later become necrotic with a yellow halo.",
        "why_hi": "जैंथोमोनास जीवाणु के कारण पत्तियों पर छोटे चिपचिपे काले धब्बे बनते हैं जिनके चारों ओर पीला छल्ला (Yellow halo) होता है।",
        "severity": "Moderate to High",
        "treatment": "Copper Oxychloride 50% WP (Blitox 50) + Streptocycline (Streptomycin sulphate + Tetracycline)",
        "quantity": "Copper Oxychloride: 2.5 g/L + Streptocycline: 0.1 g/L (1-2g in 15L knapsack tank)",
        "how": "Foliar mist spray covering foliage, stems, and fruit stalks.",
        "when": "Apply at early symptom detection during morning hours after morning dew dries.",
        "prevention": "Treat seeds with hot water (50°C for 25 min), avoid touching wet foliage, practice 2-year crop rotation.",
        "favorable_environment": {
            "min_temp": 24, "max_temp": 32, "min_humidity": 80,
            "condition": "Warm, humid conditions with wind-driven rain droplets that splash bacteria between leaves."
        }
    },
    "Tomato___Leaf_Mold": {
        "crop": "Tomato",
        "disease": "Leaf Mold",
        "scientific_name": "Passalora fulva (Cladosporium fulvum)",
        "pathogen_type": "Fungal",
        "hindi_name": "टमाटर का लीफ मोल्ड (Leaf Mold)",
        "why": "Fungal disease causing pale greenish-yellow spots on upper leaf surfaces and velvety olive-green to brown mold on lower leaf surfaces.",
        "why_hi": "पत्तियों की ऊपरी सतह पर हल्के पीले धब्बे और निचली सतह पर मखमली जैतून-भूरे रंग की फफूंद बनती है।",
        "severity": "Moderate (Common in polyhouses and dense foliage)",
        "treatment": "Difenoconazole 25% EC (Score) or Azoxystrobin 23% SC",
        "quantity": "Difenoconazole: 1 ml per liter of water (200 ml/acre)",
        "how": "Thorough undersurface foliar spray targeting lower and middle leaves.",
        "when": "Apply at first onset of velvety mold spots.",
        "prevention": "Improve greenhouse/polyhouse ventilation, increase plant spacing, prune dense bottom leaves.",
        "favorable_environment": {
            "min_temp": 20, "max_temp": 26, "min_humidity": 85,
            "condition": "High relative humidity (>85%) with moderate temperatures in sheltered or dense canopies."
        }
    },
    "Tomato___Septoria_leaf_spot": {
        "crop": "Tomato",
        "disease": "Septoria Leaf Spot",
        "scientific_name": "Septoria lycopersici",
        "pathogen_type": "Fungal",
        "hindi_name": "टमाटर का सेप्टोरिया पत्ती धब्बा",
        "why": "Characterized by numerous small circular spots with grayish-white centers and dark brown margins, speckled with tiny black fruiting bodies (pycnidia).",
        "why_hi": "पत्तियों पर छोटे गोल धब्बे जिनका केंद्र सफेद-धूसर और किनारा गहरा भूरा होता है।",
        "severity": "Moderate to High",
        "treatment": "Chlorothalonil 75% WP (Kavach) or Mancozeb 75% WP",
        "quantity": "2 g per liter of water",
        "how": "Even foliar coverage on canopy, especially lower foliage.",
        "when": "Spray when small lower leaf specks appear.",
        "prevention": "Mulch soil around plants to prevent soil-splash, sanitize pruning shears, remove infected bottom leaves.",
        "favorable_environment": {
            "min_temp": 20, "max_temp": 28, "min_humidity": 75,
            "condition": "Warm temperatures and frequent rain showers that cause splash dispersal from soil debris."
        }
    },
    "Tomato___Target_Spot": {
        "crop": "Tomato",
        "disease": "Target Spot",
        "scientific_name": "Corynespora cassiicola",
        "pathogen_type": "Fungal",
        "hindi_name": "टमाटर का टारगेट स्पॉट",
        "why": "Fungal lesions with pinpoint centers and yellow halos, progressing to brown target-like circular patterns.",
        "why_hi": "पत्तियों पर पीले छल्ले वाले भूरे संकेंद्री धब्बे बनते हैं।",
        "severity": "Moderate",
        "treatment": "Saaf Fungicide (Carbendazim + Mancozeb) or Pyraclostrobin 20% WG",
        "quantity": "2 g / L water for Saaf or 1 g / L for Pyraclostrobin",
        "how": "Foliar spray covering upper and lower canopy surfaces.",
        "when": "Spray early morning on clear days.",
        "prevention": "Ensure good drainage, reduce plant density, avoid overhead sprinklers.",
        "favorable_environment": {
            "min_temp": 22, "max_temp": 30, "min_humidity": 80,
            "condition": "Warm, humid conditions and prolonged leaf wetness."
        }
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "crop": "Tomato",
        "disease": "Yellow Leaf Curl Virus",
        "scientific_name": "TYLCV (Begomovirus)",
        "pathogen_type": "Viral (Vector: Whitefly Bemisia tabaci)",
        "hindi_name": "टमाटर का पीला पत्ती मरोड़िया रोग (लीफ कर्ल वायरस)",
        "why": "Viral disease transmitted by Silverleaf whiteflies. Leaves cup upward, curl, turn pale yellow at edges, and plant becomes severely stunted with bushy rosette growth.",
        "why_hi": "सफेद मक्खी (Whitefly) द्वारा फैलाया जाने वाला वायरस। पत्तियां ऊपर की ओर मुड़कर पीली हो जाती हैं और पौधे की वृद्धि रुक जाती है।",
        "severity": "Critical (No direct chemical cure for virus; must control vector)",
        "treatment": "Diafenthiuron 50% WP (Pegasus) or Spiromesifen 22.9% SC (Oberon) or Imidacloprid 17.8% SL for vector control",
        "quantity": "Diafenthiuron: 1.2 g/L or Imidacloprid: 0.5 ml/L water",
        "how": "Spray under foliage where whitefly colonies dwell, accompanied by yellow sticky traps (15-20 traps/acre).",
        "when": "Apply at earliest appearance of adult whiteflies on nursery or young transplants.",
        "prevention": "Use 50-mesh nylon insect-proof net in nursery, install yellow sticky traps, rogue out severely stunted infected plants, weed out border host plants.",
        "favorable_environment": {
            "min_temp": 25, "max_temp": 38, "min_humidity": 40,
            "condition": "Hot, dry sunny weather favors rapid whitefly population explosion and feeding activity."
        }
    },
    "Tomato___Tomato_mosaic_virus": {
        "crop": "Tomato",
        "disease": "Mosaic Virus",
        "scientific_name": "Tomato Mosaic Virus (ToMV)",
        "pathogen_type": "Viral (Mechanically Transmitted)",
        "hindi_name": "टमाटर का मोज़ेक वायरस",
        "why": "Mechanically transmitted virus causing mottled light and dark green patterns on leaves, distortion, and 'shoestring' leaf fern appearance.",
        "why_hi": "पत्तियों पर हल्के और गहरे हरे रंग के चितकबरे धब्बे बनते हैं और पत्तियां विकृत हो जाती हैं।",
        "severity": "Moderate to High",
        "treatment": "No chemical cure. Spray Virazole/Bio-viricides + Micronutrient zinc/boron mix to boost systemic plant vigor.",
        "quantity": "Zinc sulfate 0.5% + Borax 0.2% foliar spray",
        "how": "Sanitize hands and pruning tools with 20% skimmed milk or 10% trisodium phosphate.",
        "when": "Immediately isolate and remove visibly infected plants.",
        "prevention": "Wash hands with soap before handling plants, do not use tobacco products near fields, use certified ToMV-resistant seeds.",
        "favorable_environment": {
            "min_temp": 18, "max_temp": 32, "min_humidity": 50,
            "condition": "Spreads rapidly by mechanical touch, pruning equipment, and contact between plants."
        }
    },
    "Tomato___healthy": {
        "crop": "Tomato",
        "disease": "Healthy Plant (No Disease Detected)",
        "scientific_name": "Solanum lycopersicum (Healthy)",
        "pathogen_type": "None (Healthy)",
        "hindi_name": "स्वस्थ टमाटर (कोई रोग नहीं पाया गया)",
        "why": "Leaves display vibrant, uniform green pigmentation with clear veins, intact turgid cellular structure, and no visible necrotic lesions or pest infestations.",
        "why_hi": "पत्तियां पूरी तरह स्वस्थ, गहरी हरी और चमकदार हैं। किसी भी कवक या कीट का संक्रमण नहीं है।",
        "severity": "None (Optimal Health)",
        "treatment": "No curative fungicide needed. Maintain regular balanced NPK fertilization (19:19:19) and bio-stimulants.",
        "quantity": "Water soluble 19:19:19 NPK @ 4-5 g/L water as foliar booster every 15 days.",
        "how": "Standard morning irrigation and organic maintenance.",
        "when": "Regular scheduled vegetative and flowering maintenance.",
        "prevention": "Continue preventative neem oil spray (3 ml/L) every 15 days, maintain weed-free soil, and monitor fields weekly.",
        "favorable_environment": {
            "min_temp": 18, "max_temp": 28, "min_humidity": 60,
            "condition": "Optimal growth conditions with balanced moisture and plenty of sunlight."
        }
    },

    # ------------------ POTATO ------------------
    "Potato___Early_blight": {
        "crop": "Potato",
        "disease": "Early Blight",
        "scientific_name": "Alternaria solani",
        "pathogen_type": "Fungal",
        "hindi_name": "आलू का अगेती झुलसा (Early Blight)",
        "why": "Alternaria fungal infection producing dry, brown angular to circular spots with characteristic concentric rings on potato foliage, reducing tuber size.",
        "why_hi": "पत्तियों पर गहरे भूरे रंग के संकेंद्री छल्ले वाले धब्बे बनते हैं जिससे आलू का आकार छोटा रह जाता है।",
        "severity": "High",
        "treatment": "Mancozeb 75% WP (Indofil M-45) or Propineb 70% WP (Antracol)",
        "quantity": "2.5 g per liter of water (500g/acre in 200L water)",
        "how": "Foliar application ensuring uniform droplet coverage on both sides of canopy.",
        "when": "Apply at 40-45 days after sowing or when first spots appear on lower canopy.",
        "prevention": "Ensure certified seed tubers, avoid planting in low-lying waterlogged patches, practice 3-year crop rotation.",
        "favorable_environment": {
            "min_temp": 20, "max_temp": 30, "min_humidity": 75,
            "condition": "Alternating wet and dry periods with warm days foster fungal sporulation."
        }
    },
    "Potato___Late_blight": {
        "crop": "Potato",
        "disease": "Late Blight",
        "scientific_name": "Phytophthora infestans",
        "pathogen_type": "Oomycete",
        "hindi_name": "आलू का पछेती झुलसा (Late Blight)",
        "why": "Devastating water mold causing water-soaked pale green lesions that turn dark purplish-black rapidly, emitting a characteristic rotting smell with white downy growth underneath.",
        "why_hi": "अत्यंत विनाशकारी रोग। पत्तियों के किनारे काले-बैंगनी पड़ जाते हैं और निचली सतह पर सफेद रुई जैसी फफूंद दिखती है।",
        "severity": "Critical (Can wipe out whole potato crop in 48-72 hours)",
        "treatment": "Cymoxanil 8% + Mancozeb 64% WP (Curzate) or Dimethomorph 50% WP (Acrobat) + Mancozeb",
        "quantity": "Cymoxanil+Mancozeb: 2.5 g/L or Dimethomorph: 1 g/L + Mancozeb: 2 g/L",
        "how": "Immediate high-volume knapsack spraying covering entire field without leaving any patch.",
        "when": "Spray immediately upon weather forecast of cold cloudy days with high humidity, even before symptoms show.",
        "prevention": "Proper earthing up to prevent tuber infection, destroy infected haulms before harvest, use resistant varieties like Kufri Pukhraj / Kufri Girdhari.",
        "favorable_environment": {
            "min_temp": 10, "max_temp": 20, "min_humidity": 85,
            "condition": "High humidity (>85%), temperatures around 12-18°C, and fog or continuous drizzle create severe outbreak conditions."
        }
    },
    "Potato___healthy": {
        "crop": "Potato",
        "disease": "Healthy Plant (No Disease Detected)",
        "scientific_name": "Solanum tuberosum (Healthy)",
        "pathogen_type": "None (Healthy)",
        "hindi_name": "स्वस्थ आलू (कोई रोग नहीं पाया गया)",
        "why": "Lush green foliage with crisp margins, intact epidermal layers, and robust stolon/root development without necrotic lesions.",
        "why_hi": "आलू की पत्तियां पूरी तरह स्वस्थ और हरी-भरी हैं।",
        "severity": "None",
        "treatment": "No fungicide needed. Maintain proper earthing up and balanced potash nutrition for tuber bulking.",
        "quantity": "0:0:50 Sulphate of Potash @ 5g/L water during tuber formation stage.",
        "how": "Soil moisture management and preventative crop scouting.",
        "when": "Maintain weekly field inspection.",
        "prevention": "Keep field ridges free of weeds, ensure loose well-aerated soil for tubers.",
        "favorable_environment": {
            "min_temp": 15, "max_temp": 24, "min_humidity": 65,
            "condition": "Cool, pleasant growing temperatures ideal for vegetative and tuber development."
        }
    },

    # ------------------ CORN / MAIZE ------------------
    "Corn_(maize)___Common_rust_": {
        "crop": "Corn (Maize)",
        "disease": "Common Rust",
        "scientific_name": "Puccinia sorghi",
        "pathogen_type": "Fungal",
        "hindi_name": "मक्के का सामान्य रतुआ / गेरुआ (Common Rust)",
        "why": "Fungal rust producing small, elongated powdery golden-brown to cinnamon-brown pustules scattered across both upper and lower leaf surfaces.",
        "why_hi": "पत्तियों की दोनों सतहों पर दालचीनी जैसे भूरे रंग के उभरे हुए फफोले (Pustules) बन जाते हैं।",
        "severity": "Moderate to High",
        "treatment": "Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top) or Propiconazole 25% EC (Tilt)",
        "quantity": "1 ml per liter of water (200 ml per acre in 200L water)",
        "how": "Foliar canopy spray thoroughly wetting midrib and leaf blades.",
        "when": "Apply when first pustules are observed before silking stage.",
        "prevention": "Plant rust-resistant hybrid seeds, avoid late planting, balance nitrogen fertilization.",
        "favorable_environment": {
            "min_temp": 16, "max_temp": 25, "min_humidity": 80,
            "condition": "Cool to moderate temperatures (16-24°C) with high relative humidity and overnight dew."
        }
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "crop": "Corn (Maize)",
        "disease": "Northern Corn Leaf Blight",
        "scientific_name": "Exserohilum turcicum",
        "pathogen_type": "Fungal",
        "hindi_name": "मक्के का उत्तरी पत्ती झुलसा (Northern Leaf Blight)",
        "why": "Characterized by long, elliptical grayish-green to tan cigar-shaped lesions (1-6 inches long) that coalesce and scorch entire leaves.",
        "why_hi": "पत्तियों पर सिगार के आकार के 1 से 6 इंच लंबे भूरे-धूसर धब्बे बनते हैं जो आपस में मिलकर पत्ती को सुखा देते हैं।",
        "severity": "High (Substantial grain filling and fodder yield loss)",
        "treatment": "Mancozeb 75% WP or Azoxystrobin + Tebuconazole (Custodia)",
        "quantity": "Mancozeb: 2.5 g/L or Custodia: 1.5 ml/L water",
        "how": "Tractor-mounted boom or knapsack sprayer directing spray into leaf whorls and canopy.",
        "when": "Apply at knee-high to tasseling stage upon detecting initial spindle lesions.",
        "prevention": "Deep tillage to bury crop residue, rotate with soybean or legumes, select resistant cultivars.",
        "favorable_environment": {
            "min_temp": 18, "max_temp": 27, "min_humidity": 80,
            "condition": "Moderate temperatures and extended periods of leaf wetness (>6 hours)."
        }
    },
    "Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot": {
        "crop": "Corn (Maize)",
        "disease": "Gray Leaf Spot",
        "scientific_name": "Cercospora zeae-maydis",
        "pathogen_type": "Fungal",
        "hindi_name": "मक्के का ग्रे लीफ स्पॉट (Gray Leaf Spot)",
        "why": "Narrow rectangular, blocky lesions restricted by leaf veins. Lesions start tan and turn gray as fungal sporulation develops.",
        "why_hi": "नसों के बीच आयताकार धूसर-भूरे धब्बे बनते हैं जो पत्तियों को समय से पहले सुखा देते हैं।",
        "severity": "High",
        "treatment": "Pyraclostrobin 20% WG or Propiconazole 25% EC",
        "quantity": "Propiconazole: 1 ml/L water",
        "how": "Foliar application to upper leaves supporting the ear.",
        "when": "Apply at VT/R1 stage (tasseling/silking) if disease reaches lower canopy.",
        "prevention": "Practice crop rotation, minimize no-till continuous corn, maintain proper plant spacing.",
        "favorable_environment": {
            "min_temp": 22, "max_temp": 30, "min_humidity": 85,
            "condition": "Warm, humid overcast days with prolonged morning dew."
        }
    },
    "Corn_(maize)___healthy": {
        "crop": "Corn (Maize)",
        "disease": "Healthy Plant (No Disease Detected)",
        "scientific_name": "Zea mays (Healthy)",
        "pathogen_type": "None (Healthy)",
        "hindi_name": "स्वस्थ मक्का (कोई रोग नहीं पाया गया)",
        "why": "Robust upright broad leaves with clean venation, firm midrib, and no fungal pustules or blight streaks.",
        "why_hi": "मक्के का पौधा पूरी तरह स्वस्थ और मजबूत है।",
        "severity": "None",
        "treatment": "No fungicide required. Apply recommended split dose of Urea/Nitrogen and Zinc at knee-high stage.",
        "quantity": "Apply 30-40 kg Urea/acre top-dressed before flowering.",
        "how": "Side dressing near root zone followed by light irrigation.",
        "when": "30 to 45 days after emergence.",
        "prevention": "Scout field regularly for fall armyworm (Spodoptera frugiperda) and stem borer signs.",
        "favorable_environment": {
            "min_temp": 20, "max_temp": 32, "min_humidity": 60,
            "condition": "Warm sunny days with adequate soil moisture."
        }
    },

    # ------------------ RICE / PADDY ------------------
    "Rice___Bacterial_leaf_blight": {
        "crop": "Rice (Paddy)",
        "disease": "Bacterial Leaf Blight",
        "scientific_name": "Xanthomonas oryzae pv. oryzae",
        "pathogen_type": "Bacterial",
        "hindi_name": "धान का जीवाणु झुलसा (Bacterial Leaf Blight)",
        "why": "Water-soaked stripes starting at leaf tips and margins, expanding into wavy yellowish-white stripes that turn bleached white with amber bacterial beads.",
        "why_hi": "पत्तियों के सिरों से शुरू होकर किनारों पर लहरदार पीले-सफेद पट्टे बनते हैं जो बाद में सूखकर पुआल जैसे सफेद हो जाते हैं।",
        "severity": "High (Can reduce rice grain yield by 20-50%)",
        "treatment": "Copper Oxychloride 50% WP (Blitox) + Streptocycline",
        "quantity": "Copper Oxychloride: 2.5 g/L + Streptocycline: 0.15 g/L (1.5g per 10L)",
        "how": "Fine foliar spray directing towards canopy without submerging plants.",
        "when": "Apply at early tillering or panicle initiation upon seeing tip withering.",
        "prevention": "Avoid excess top-dressing with nitrogen fertilizer, drain stagnant water temporarily, treat seeds with carbendazim + streptocycline.",
        "favorable_environment": {
            "min_temp": 25, "max_temp": 34, "min_humidity": 85,
            "condition": "Warm, stormy monsoon weather with high winds that injure leaf tips and spread bacteria."
        }
    },
    "Rice___Blast": {
        "crop": "Rice (Paddy)",
        "disease": "Rice Blast",
        "scientific_name": "Magnaporthe oryzae (Pyricularia oryzae)",
        "pathogen_type": "Fungal",
        "hindi_name": "धान का झोंका रोग (Rice Blast)",
        "why": "Spindle-shaped or eye-shaped lesions with grayish-white centers and brownish margins. Can infect leaf blades, collar, and neck of panicle.",
        "why_hi": "पत्तियों पर आंख या नाव के आकार के धब्बे जिनका केंद्र सफेद-धूसर और किनारा भूरा होता है।",
        "severity": "Critical",
        "treatment": "Tricyclazole 75% WP (Beam) or Isoprothiolane 40% EC (Fuji-one)",
        "quantity": "Tricyclazole: 0.6 g per liter of water (120 g/acre in 200L water)",
        "how": "Thorough canopy spray targeting leaf collars and emerging panicles.",
        "when": "Apply at maximum tillering stage and repeat at 5% panicle emergence stage.",
        "prevention": "Plant resistant varieties, avoid excessive nitrogenous fertilizers, maintain shallow standing water layer.",
        "favorable_environment": {
            "min_temp": 18, "max_temp": 28, "min_humidity": 90,
            "condition": "Cloudy, rainy weather, high relative humidity (>90%) with cool night temperatures and dew."
        }
    },
    "Rice___Brown_Spot": {
        "crop": "Rice (Paddy)",
        "disease": "Brown Spot",
        "scientific_name": "Bipolaris oryzae (Cochliobolus miyabeanus)",
        "pathogen_type": "Fungal",
        "hindi_name": "धान का भूरा धब्बा रोग (Brown Spot)",
        "why": "Small, oval to circular dark brown sesame-seed-like spots uniformly scattered across leaf blades, indicating poor soil nutrition or water stress.",
        "why_hi": "पत्तियों पर तिल के आकार के गहरे भूरे गोल या अंडाकार धब्बे बनते हैं। यह अक्सर पोषक तत्वों की कमी से होता है।",
        "severity": "Moderate to High",
        "treatment": "Mancozeb 75% WP or Propiconazole 25% EC",
        "quantity": "Mancozeb: 2 g/L or Propiconazole: 1 ml/L water",
        "how": "Foliar spray across affected field.",
        "when": "Apply at active tillering and boot leaf stage.",
        "prevention": "Ensure balanced soil nutrition (Zinc and Potash), avoid soil moisture stress, treat seeds with Trichoderma harzianum.",
        "favorable_environment": {
            "min_temp": 24, "max_temp": 32, "min_humidity": 80,
            "condition": "Unbalanced soil fertility, sandy soils, and intermittent drought stress accompanied by humid mornings."
        }
    },
    "Rice___healthy": {
        "crop": "Rice (Paddy)",
        "disease": "Healthy Plant (No Disease Detected)",
        "scientific_name": "Oryza sativa (Healthy)",
        "pathogen_type": "None (Healthy)",
        "hindi_name": "स्वस्थ धान (कोई रोग नहीं पाया गया)",
        "why": "Erect, clean green leaves, healthy tillers, well-developed white roots, and clean flag leaves with no necrotic spots.",
        "why_hi": "धान का पौधा पूरी तरह स्वस्थ और हरा-भरा है।",
        "severity": "None",
        "treatment": "No fungicide needed. Maintain recommended water level (2-5 cm) and balanced N-P-K-Zn application.",
        "quantity": "Apply Zinc Sulfate (21%) @ 10 kg/acre if not applied at basal stage.",
        "how": "Maintain intermittent wetting and drying (AWD) water management.",
        "when": "Tillering and panicle development stages.",
        "prevention": "Scout weekly for Brown Planthopper (BPH) and Stem Borer egg masses.",
        "favorable_environment": {
            "min_temp": 22, "max_temp": 32, "min_humidity": 70,
            "condition": "Favorable warm sunny growing conditions."
        }
    },

    # ------------------ BELL PEPPER / CHILLI ------------------
    "Pepper__bell___Bacterial_spot": {
        "crop": "Bell Pepper / Chilli",
        "disease": "Bacterial Spot",
        "scientific_name": "Xanthomonas campestris pv. vesicatoria",
        "pathogen_type": "Bacterial",
        "hindi_name": "शिमला मिर्च / मिर्च का जीवाणु धब्बा रोग",
        "why": "Small, water-soaked, dark lesions on leaves that turn brown, raised or blister-like, leading to severe leaf shedding and sunscald on exposed peppers.",
        "why_hi": "पत्तियों पर छोटे काले उभरे हुए धब्बे बनते हैं जिससे पत्तियां झड़ने लगती हैं।",
        "severity": "Moderate to High",
        "treatment": "Copper Hydroxide 53.8% DF (Kocide) or Copper Oxychloride 50% WP + Streptocycline",
        "quantity": "Copper: 2 g/L + Streptocycline: 0.1 g/L",
        "how": "Foliar spray covering leaves and fruit stems thoroughly.",
        "when": "Apply at first sign of greasy leaf spots.",
        "prevention": "Use certified disease-free seeds, avoid working in wet fields, practice crop rotation.",
        "favorable_environment": {
            "min_temp": 24, "max_temp": 32, "min_humidity": 80,
            "condition": "Warm temperatures accompanied by rain and overhead sprinkler splashing."
        }
    },
    "Pepper__bell___healthy": {
        "crop": "Bell Pepper / Chilli",
        "disease": "Healthy Plant (No Disease Detected)",
        "scientific_name": "Capsicum annuum (Healthy)",
        "pathogen_type": "None (Healthy)",
        "hindi_name": "स्वस्थ शिमला मिर्च / मिर्च (कोई रोग नहीं पाया गया)",
        "why": "Deep green, glossy intact foliage with sturdy stems and no blistering, spotting, or viral curling.",
        "why_hi": "शिमला मिर्च का पौधा पूरी तरह स्वस्थ और चमकदार है।",
        "severity": "None",
        "treatment": "No fungicide needed. Apply Micronutrient spray (Boron + Calcium) to encourage flower retention.",
        "quantity": "Soluble Boron 20% @ 1 g/L + Calcium nitrate @ 2 g/L",
        "how": "Light foliar mist during flowering stage.",
        "when": "Every 15-20 days during flowering and fruit set.",
        "prevention": "Preventative neem oil spray (3 ml/L) for thrips and mite deterrence.",
        "favorable_environment": {
            "min_temp": 18, "max_temp": 30, "min_humidity": 60,
            "condition": "Moderate warm climate with balanced sunlight."
        }
    },

    # ------------------ BACKGROUND / NON-CROP REJECTION ------------------
    "Background_without_leaves": {
        "crop": "Non-Agricultural / Background",
        "disease": "Non-Leaf / Unsupported Subject",
        "scientific_name": "N/A",
        "pathogen_type": "None",
        "hindi_name": "अमान्य फोटो (कोई फसल/पत्ती नहीं पहचानी गई)",
        "why": "The uploaded photo does not contain a recognized agricultural crop leaf or foliage. The system detected an arbitrary background, non-plant object, or unsupported image.",
        "why_hi": "अपलोड की गई तस्वीर में कोई मान्यता प्राप्त फसल या पत्ती नहीं मिली। कृपया फसल की स्पष्ट पत्ती की फोटो अपलोड करें।",
        "severity": "N/A",
        "treatment": "Please re-upload a clear, close-up photograph of an affected crop leaf in adequate natural lighting.",
        "quantity": "N/A",
        "how": "N/A",
        "when": "N/A",
        "prevention": "Hold camera 15-30 cm away from the leaf, ensuring the leaf blade occupies the majority of the frame.",
        "favorable_environment": None
    }
}

# Fallback generic template for any unlisted class
DEFAULT_RECOMMENDATION = {
    "crop": "Crop Foliage",
    "disease": "Unspecified Leaf Condition",
    "scientific_name": "Pathogen Under Review",
    "pathogen_type": "Unknown",
    "hindi_name": "अज्ञात फसल लक्षण",
    "why": "Leaf shows visible signs of chlorosis or cellular stress requiring agronomist verification.",
    "why_hi": "पत्ती पर असामान्य लक्षण दिख रहे हैं।",
    "severity": "Moderate",
    "treatment": "Neem Oil 1500 ppm (organic deterrent) + Saaf Fungicide (Carbendazim 12% + Mancozeb 63% WP)",
    "quantity": "Saaf: 2 g/L + Neem Oil: 3 ml/L",
    "how": "Foliar spray wetting both upper and lower leaf surfaces.",
    "when": "Early morning spray before direct sunlight.",
    "prevention": "Remove infected foliage, ensure proper drainage, and avoid touching healthy crops after handling diseased tissue.",
    "favorable_environment": None
}




def get_recommendation(class_name: str, confidence: float = 1.0, env_data: dict = None) -> dict:
    """
    Returns agronomic recommendation enriched with:
    1. Multi-factor Weather alignment
    2. Soil & Season Pathological Correlation
    3. Economic Loss Analysis & Chemical Treatment Cost-Benefit (ETL)
    """
    rec = DISEASE_KNOWLEDGE_BASE.get(class_name, DEFAULT_RECOMMENDATION).copy()
    rec["class_key"] = class_name
    rec["confidence"] = round(confidence * 100, 2)
    crop_name = rec.get("crop", "Tomato")

    env_data = env_data or {}
    temp = env_data.get("temperature")
    humidity = env_data.get("humidity")
    season = env_data.get("season", "Kharif (Monsoon)")
    soil_type = env_data.get("soil_type", "Alluvial Soil")
    nitrogen_status = env_data.get("nitrogen_status", "Balanced NPK")

    # ---------------- 1. WEATHER & ENVIRONMENTAL EVALUATION ----------------
    env_note = None
    if rec.get("favorable_environment"):
        fav = rec["favorable_environment"]
        weather_alerts = []

        if temp is not None:
            if fav["min_temp"] <= temp <= fav["max_temp"]:
                weather_alerts.append(f"Current temperature ({temp}°C) is in the high-risk incubation range ({fav['min_temp']}-{fav['max_temp']}°C).")
            else:
                weather_alerts.append(f"Current temperature ({temp}°C) is outside the peak epidemic temperature window.")

        if humidity is not None:
            if humidity >= fav["min_humidity"]:
                weather_alerts.append(f"Elevated relative humidity ({humidity}%) strongly accelerates spore germination (critical threshold: {fav['min_humidity']}%).")
            else:
                weather_alerts.append(f"Moderate humidity ({humidity}%) provides resistance against rapid secondary sporulation.")

        if weather_alerts:
            env_note = {
                "risk_correlation": "High Environmental Alignment" if (humidity and humidity >= fav["min_humidity"]) else "Moderate Alignment",
                "details": " ".join(weather_alerts),
                "scientific_basis": fav["condition"]
            }

    # ---------------- 2. SOIL & SEASON MULTI-FACTOR CORRELATION ----------------
    soil_season_notes_en = []
    soil_season_notes_hi = []

    if "healthy" not in class_name.lower():
        # Nitrogen & Soil Health impact
        if "Excess" in str(nitrogen_status) or "High" in str(nitrogen_status):
            soil_season_notes_en.append("Excess Nitrogen fertilizer creates soft, thin leaf cuticles, increasing fungal penetration and bacterial ooze by 2.5x. Halt urea top-dressing immediately.")
            soil_season_notes_hi.append("अत्यधिक नाइट्रोजन खाद (Excess Urea) के कारण पत्तियों की बाहरी परत कोमल हो गई है, जिससे संक्रमण 2.5 गुना तेजी से फैल रहा है। यूरिया तुरंत रोकें।")
        elif "Deficient" in str(nitrogen_status) or "Low" in str(nitrogen_status):
            soil_season_notes_en.append("Low potassium/micronutrient reserves reduce systemic plant vigor and defense lignin synthesis.")
            soil_season_notes_hi.append("पोषक तत्वों (Potassium/Micronutrients) की कमी से पौधे की प्राकृतिक रोग प्रतिरोधक क्षमता घट गई है।")

        # Season impact
        if "Kharif" in str(season) or "Monsoon" in str(season):
            soil_season_notes_en.append("Kharif monsoon rains cause severe water-splash dispersal, propelling soil-borne fungal spores onto upper foliage.")
            soil_season_notes_hi.append("खरीफ/मानसून मौसम में बारिश की बूंदों से फंगस के स्पोर्स जमीन से उछलकर (Splash Dispersal) पत्तियों पर चिपकते हैं।")
        elif "Rabi" in str(season) or "Winter" in str(season):
            soil_season_notes_en.append("Rabi winter morning fog and prolonged leaf dew create persistent moisture films ideal for Late Blight and Rusts.")
            soil_season_notes_hi.append("रबी (सर्दियों) में सुबह का कोहरा और ओस (Dew) पत्तियों पर पानी की परत बना देते हैं, जिससे ब्लाइट और रतुआ तेजी से पनपता है।")
        elif "Zaid" in str(season) or "Summer" in str(season):
            soil_season_notes_en.append("Zaid summer dry heat promotes explosive Whitefly & aphid vector proliferation, compounding viral leaf curl risks.")
            soil_season_notes_hi.append("जायद (गर्मी) के सूखे मौसम में सफेद मक्खी जैसे रसचूसक कीटों की आबादी तेजी से बढ़ती है, जिससे लीफ कर्ल वायरस फैलता है।")

        # Soil type impact
        if "Black" in str(soil_type) or "Clay" in str(soil_type):
            soil_season_notes_en.append(f"{soil_type} has high water retention; waterlogging around roots promotes collar rot and vascular wilts.")
            soil_season_notes_hi.append(f"{soil_type} में जल भराव (Waterlogging) रहने से जड़ सड़न और झुलसा रोग का खतरा बढ़ जाता है।")

        # ---------------- DYNAMIC RECOMMENDATION MODIFICATION ----------------
        # 1. Soil Nitrogen / Nutrient Adjustment
        if "Excess" in str(nitrogen_status) or "High" in str(nitrogen_status):
            rec["treatment"] += " + [SOIL ADJUSTMENT: Spray Sulphate of Potash (0:0:50 @ 10g/L); halt urea immediately]"
            rec["how"] += " (Crucial: Halt nitrogen/urea top-dressing to stop soft tissue proliferation that feeds the pathogen)."
            rec["prevention"] += " Avoid excess nitrogen in subsequent crop splits; balance with basal potash."
        elif "Deficient" in str(nitrogen_status) or "Low" in str(nitrogen_status):
            rec["treatment"] += " + [SOIL TONIC: Micronutrient Foliar Spray (Zinc 0.5% + Borax 0.2%)]"
            rec["quantity"] += " (+ Chelated Micronutrient mix @ 2 g/L)"

        # 2. Season Factor in Application Technique & Timing
        if "Kharif" in str(season) or "Monsoon" in str(season):
            rec["how"] += " [MONSOON METHOD: Always mix Sticker/Adjuvant (0.5 ml/L) to prevent rain wash-off within 2 hours]."
            rec["when"] += " [SEASON TIMING: Spray during clear rain-free sunny break; ensure 3-4 hours of dry foliage]."
        elif "Rabi" in str(season) or "Winter" in str(season):
            rec["when"] += " [SEASON TIMING: Spray only between 10:30 AM - 1:30 PM after morning dew dries completely]."
        elif "Zaid" in str(season) or "Summer" in str(season):
            rec["when"] += " [SEASON TIMING: Spray before 8:30 AM or after 5:00 PM to avoid leaf scorch in midday summer heat]."

        # 3. Soil Type in Drainage & Cultural Prevention
        if "Black" in str(soil_type) or "Clay" in str(soil_type):
            rec["prevention"] += f" [{soil_type.upper()} DRAINAGE: Construct 15cm raised beds and clearance trenches to stop root waterlogging]."
        elif "Sandy" in str(soil_type):
            rec["prevention"] += f" [{soil_type.upper()} MULCHING: Add organic straw mulch to retain moisture and prevent fertilizer leaching]."
    else:
        soil_season_notes_en.append(f"{season} conditions with balanced {soil_type} nutrients support optimal vegetative vigor.")
        soil_season_notes_hi.append(f"{season} मौसम में संतुलित {soil_type} मिट्टी फसल को स्वस्थ रखने में सहायक है।")

    rec["environmental_risk"] = env_note
    rec["agronomic_context"] = {
        "season_selected": season,
        "soil_type_selected": soil_type,
        "nitrogen_status_selected": nitrogen_status,
        "correlation_notes_en": soil_season_notes_en,
        "correlation_notes_hi": soil_season_notes_hi
    }

    return rec

// ==========================================================================
// AGRO-HAAT 2.0 - CORE INTERACTIVE SCRIPT
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fixed Header on Scroll (Glassmorphism effect)
    const header = document.getElementById('mainNavbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // 3. Smooth scrolling for internal anchors & close mobile nav on click
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = mobileMenuBtn?.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-xmark');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });
    });

    // 4. Active Nav Link on Scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const navItems = document.querySelectorAll('.nav-links a');
        let currentId = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentId = '#' + section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === currentId) {
                item.classList.add('active');
            }
        });
    });

    // 5. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('active'));
    }
});

// 6. Interactive Demo Modules
function showDemo(type) {
    const demoContent = document.getElementById('demoContent');
    const buttons = document.querySelectorAll('.demo-tab-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    const demos = {
        weather: `
            <h3><i class="fa-solid fa-cloud-sun text-emerald"></i> Real-Time Weather Forecasting</h3>
            <p><strong>Today's Agricultural Weather:</strong> Sunny, 28°C | Wind: 8 km/h NW | Humidity: 54%</p>
            <p><strong>7-Day Outlook:</strong> Light pre-monsoon showers expected on Day 3</p>
            <p><strong>AI Irrigation Alert:</strong> 🟡 Moderate rainfall expected. Hold heavy irrigation for 48 hours to conserve groundwater.</p>
            <p><strong>Sowing Recommendation:</strong> Soil moisture is optimum for mustard and wheat preparation.</p>
            
            <div class="weather-search-bar">
                <input type="text" id="weatherQuickCity" placeholder="Enter your city (e.g., Delhi, Karnal, Jaipur)">
                <button onclick="getQuickWeather()"><i class="fa-solid fa-magnifying-glass"></i> Check City</button>
            </div>
            <div id="quickWeatherResult" style="margin-top: 15px; font-weight: 600;"></div>
        `,
        crops: `
            <h3><i class="fa-solid fa-virus-slash text-emerald"></i> AI-Powered Crop Disease Diagnosis</h3>
            <p><strong>Diagnostic Pipeline:</strong> Multi-spectral leaf visual analysis via deep learning computer vision.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 15px 0;">
                <p><strong>Diagnostic Result:</strong> ⚠️ <span style="color: #b45309; font-weight: bold;">Early Blight (Alternaria solani)</span> detected on tomato leaves (Confidence: 94.2%).</p>
                <p><strong>Recommended Action:</strong> Apply recommended copper hydroxide spray (2g/L). Prune lower leaves with dark target-like spots.</p>
            </div>
            <p>🌱 <em>Log in to your Farmer Dashboard to upload your crop photos for instant live scans!</em></p>
        `,
        machinery: `
            <h3><i class="fa-solid fa-tractor text-emerald"></i> Community Farm Machinery Rental</h3>
            <p><strong>Verified Equipment Available In Your Block:</strong></p>
            <ul style="margin: 12px 0 16px 20px; line-height: 1.8; color: #334155;">
                <li>🚜 <strong>Mahindra 575 DI Tractor (45 HP)</strong> - ₹750/day - 4.2 km away</li>
                <li>🌾 <strong>Claas Combine Harvester</strong> - ₹1,600/day - 7.5 km away</li>
                <li>💧 <strong>Solar Power Battery Sprayer</strong> - ₹250/day - 2.8 km away</li>
            </ul>
            <p><strong>Zero Deposit Booking:</strong> Confirm rental dates with verified local owners through the Farmer Portal.</p>
        `,
        marketplace: `
            <h3><i class="fa-solid fa-basket-shopping text-emerald"></i> Direct Farm-to-Consumer Marketplace</h3>
            <p><strong>Fresh Harvest Live From Nearby Farms:</strong></p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 15px 0;">
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px;">
                    <strong>🥔 Organic Potatoes</strong><br>
                    <span style="color: #15803d; font-size: 1.1rem; font-weight: bold;">₹18 / kg</span><br>
                    <small style="color: #64748b;">Ramesh Farm (18 km)</small>
                </div>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px;">
                    <strong>🍅 Vine Ripe Tomatoes</strong><br>
                    <span style="color: #15803d; font-size: 1.1rem; font-weight: bold;">₹24 / kg</span><br>
                    <small style="color: #64748b;">Krishna Farm (12 km)</small>
                </div>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px;">
                    <strong>🥬 Fresh Palak (Spinach)</strong><br>
                    <span style="color: #15803d; font-size: 1.1rem; font-weight: bold;">₹28 / kg</span><br>
                    <small style="color: #64748b;">Lakshmi Organic (9 km)</small>
                </div>
            </div>
            <p><strong>Packaging:</strong> 5kg, 10kg, 25kg standard eco-crates | <strong>Dispatch:</strong> Same-day doorstep delivery.</p>
        `
    };

    demoContent.innerHTML = demos[type] || demos.weather;
}

// 7. Quick City Weather Checker
const WEATHER_API_KEY = "ca42603bf7320cf4ca0a7623b37ed4e4";

function getQuickWeather() {
    const input = document.getElementById("weatherQuickCity");
    const resultBox = document.getElementById("quickWeatherResult");
    if (!input || !resultBox) return;

    const city = input.value.trim();
    if (!city) {
        resultBox.innerHTML = "<span style='color: #ea580c;'>⚠️ Please enter a city name!</span>";
        return;
    }

    resultBox.innerHTML = "<span style='color: #16a34a;'>⏳ Fetching live weather radar...</span>";

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`)
        .then(res => res.json())
        .then(data => {
            if (data.cod !== 200) {
                resultBox.innerHTML = `<span style="color: #ef4444;">❌ City "${city}" not found. Please try another city.</span>`;
                return;
            }

            resultBox.innerHTML = `
                <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 14px; margin-top: 10px;">
                    <p style="color: #0f3822; margin-bottom: 4px;"><strong>📍 ${data.name}, ${data.sys.country}</strong></p>
                    <p style="color: #15803d; font-size: 1.25rem; font-weight: 800; margin-bottom: 4px;">🌡️ ${Math.round(data.main.temp)}°C (${data.weather[0].description})</p>
                    <p style="color: #334155; font-size: 0.92rem; margin: 0;">💧 Humidity: ${data.main.humidity}% | 💨 Wind Speed: ${data.wind.speed} m/s</p>
                </div>
            `;
        })
        .catch(err => {
            resultBox.innerHTML = "<span style='color: #ef4444;'>❌ Weather service temporarily unavailable. Please try again.</span>";
        });
}

// 8. Cultivation Stage Filtering
function filterStage(stage) {
    const stageBlocks = document.querySelectorAll('.cultivation-stage-block');
    const filterButtons = document.querySelectorAll('.stage-tab-btn');

    filterButtons.forEach(btn => btn.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    stageBlocks.forEach(block => {
        if (stage === 'all' || block.getAttribute('data-stage') === stage) {
            block.classList.remove('hidden-stage');
        } else {
            block.classList.add('hidden-stage');
        }
    });
}


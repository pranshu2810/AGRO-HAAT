const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const db = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// View engine configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser & Session middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'agrohaat_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  })
);

// Serve Static Files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Ensure upload directories exist on startup
const uploadDirs = [
  path.join(__dirname, 'public/uploads/profile_pictures'),
  path.join(__dirname, 'public/uploads/farm_products'),
  path.join(__dirname, 'public/uploads/machinery'),
  path.join(__dirname, 'public/uploads/pest_scans')
];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Seed default subscription plans if table is empty
async function seedSubscriptionPlans() {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM subscription_plans');
    if (rows[0].count === 0) {
      await db.query(`
        INSERT INTO subscription_plans (plan_name, duration_days, price, description) VALUES
        ('Daily Pack', 1, 49.00, 'Fresh vegetables daily, Perfect for daily cooking, Ultra-fresh produce, Free Home delivery, Cancel anytime'),
        ('Weekly Pack', 7, 99.00, '5-7 seasonal vegetables, Delivered twice a week, Fixed price guarantee, Family-friendly portions, Priority support'),
        ('Family Pack', 30, 999.00, 'Higher quantity for families, Weekly delivery, Customizable Basket, Dedicated support, Free Home Delivery')
      `);
    }
  } catch (e) {
    // Table might not exist yet
  }
}
seedSubscriptionPlans();

// Make user session globally available to EJS templates
app.use((req, res, next) => {
  res.locals.user = req.session.user_id ? req.session : null;
  res.locals.cart = req.session.cart || {};
  next();
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatRoutes = require('./routes/chatRoutes');
const machineryRoutes = require('./routes/machineryRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const marketRoutes = require('./routes/marketRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const soilRoutes = require('./routes/soilRoutes');
const cropRoutes = require('./routes/cropRoutes');
const voiceRoutes = require('./routes/voiceRoutes');

// Mount Routes
app.use('/', authRoutes);
app.use('/', productRoutes);
app.use('/', orderRoutes);
app.use('/', soilRoutes);
app.use('/', cropRoutes);
app.use('/', voiceRoutes);
app.use('/', aiRoutes);
app.use('/', chatRoutes);
app.use('/', machineryRoutes);
app.use('/', subscriptionRoutes);
app.use('/', marketRoutes);
app.use('/', weatherRoutes);

// Landing / Home Page
app.get(['/', '/index.php', '/index2.php'], (req, res) => {
  res.render('index', { user: req.session });
});

// Developer / Quick Farmer Session Route
app.get('/dev-farmer-login', (req, res) => {
  req.session.user_id = 4;
  req.session.role = 'Farmer';
  req.session.fullname = 'Suraj Sahni';
  res.redirect('/farmer/dashboard');
});

// Developer / Quick Customer Session Route
app.get('/dev-customer-login', (req, res) => {
  req.session.user_id = 6;
  req.session.role = 'Customer';
  req.session.fullname = 'Pranshu';
  res.redirect('/customer/dashboard');
});

// Farmer Dashboard Route
app.get(['/farmer/dashboard', '/farmer/dashboard.php', '/farmer_dashboard.php'], async (req, res) => {
  if (!req.session || !req.session.user_id || req.session.role !== 'Farmer') {
    return res.redirect('/login');
  }

  const farmerId = req.session.user_id;
  let active_products = 0;
  let total_orders = 0;
  let monthly_revenue = 0;
  let products_sold = 0;

  try {
    const [pRes] = await db.query('SELECT COUNT(*) AS count FROM farm_products WHERE farmer_id = ?', [farmerId]);
    active_products = pRes[0]?.count || 0;

    const [oRes] = await db.query('SELECT COUNT(*) AS count FROM orders WHERE farmer_id = ?', [farmerId]);
    total_orders = oRes[0]?.count || 0;

    const [rRes] = await db.query(
      'SELECT SUM(total_price) AS sum FROM orders WHERE farmer_id = ? AND MONTH(order_date) = MONTH(CURRENT_DATE()) AND YEAR(order_date) = YEAR(CURRENT_DATE())',
      [farmerId]
    );
    monthly_revenue = rRes[0]?.sum || 0;

    try {
      const [sRes] = await db.query(
        "SELECT SUM(quantity) AS sum FROM orders WHERE farmer_id = ? AND status = 'Delivered'",
        [farmerId]
      );
      products_sold = sRes[0]?.sum || 0;
    } catch (e) {
      products_sold = 0;
    }
  } catch (err) {
    console.error(err);
  }

  res.render('farmer/dashboard', {
    active_products,
    total_orders,
    monthly_revenue,
    products_sold,
    user: req.session
  });
});

// Customer Dashboard Route
app.get(['/customer/dashboard', '/customer/dashboard.php', '/customer_dashboard.php'], async (req, res) => {
  if (!req.session || !req.session.user_id || req.session.role !== 'Customer') {
    return res.redirect('/login');
  }

  const customerId = req.session.user_id;
  let total_products = 0;
  let total_orders = 0;

  try {
    const [pRes] = await db.query('SELECT COUNT(*) as total FROM farm_products WHERE quantity_available > 0');
    total_products = pRes[0]?.total || 0;

    const [oRes] = await db.query('SELECT COUNT(*) as total FROM orders WHERE customer_id = ?', [customerId]);
    total_orders = oRes[0]?.total || 0;
  } catch (err) {
    console.error(err);
  }

  res.render('customer/dashboard', {
    total_products,
    total_orders,
    user: req.session,
    cart: req.session.cart
  });
});

// Agricultural Weather routes are now managed by routes/weatherRoutes.js

// Farmer Crop Recommendation is now fully managed by routes/cropRoutes.js

// Soil health analysis is now fully handled by soilRoutes.js

// Farmer Pest Detection Page
app.get(['/farmer/pest_detection', '/farmer/pest_detection.php'], async (req, res) => {
  if (!req.session || !req.session.user_id || req.session.role !== 'Farmer') return res.redirect('/login');
  const userId = req.session.user_id;

  try {
    const [history] = await db.query(
      "SELECT * FROM ai_recommendations WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 5",
      [userId]
    );
    res.render('farmer/pest_detection', { history, user: req.session });
  } catch (err) {
    res.render('farmer/pest_detection', { history: [], user: req.session });
  }
});

// Hackathon Judge Test Mode
app.get(['/farmer/judge_test', '/judge_test', '/judge-test'], (req, res) => {
  res.render('farmer/judge_test', { user: req.session || {} });
});

// Model Evaluation & Unseen Test Dashboard
app.get(['/farmer/model_evaluation', '/model_evaluation', '/model-evaluation'], (req, res) => {
  res.render('farmer/model_evaluation', { user: req.session || {} });
});

// Market Intelligence and live Mandi Prices are handled by marketRoutes ('/farmer/market_prices')

// Start Node.js express server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Agro-Haat AI server running on port ${PORT}`);
});

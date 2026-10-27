const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/db');

async function initSoilDatabase() {
  try {
    console.log('Creating soil health and plot tables if not exist...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS farm_plots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmer_id INT NOT NULL,
        plot_name VARCHAR(100) NOT NULL,
        survey_number VARCHAR(50) DEFAULT NULL,
        area_acres DECIMAL(8, 2) DEFAULT 1.00,
        state VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        block_tehsil VARCHAR(100) DEFAULT NULL,
        village VARCHAR(100) DEFAULT NULL,
        latitude DECIMAL(10, 7) DEFAULT NULL,
        longitude DECIMAL(10, 7) DEFAULT NULL,
        soil_type VARCHAR(50) DEFAULT 'Loamy Soil',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_farmer (farmer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS soil_health_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmer_id INT NOT NULL,
        plot_id INT DEFAULT NULL,
        plot_name VARCHAR(100) DEFAULT NULL,
        sample_date DATE DEFAULT NULL,
        sample_depth VARCHAR(50) DEFAULT '0-15 cm',
        data_source VARCHAR(50) DEFAULT 'Laboratory Report',
        shc_sample_number VARCHAR(100) DEFAULT NULL,
        crop_name VARCHAR(100) NOT NULL,
        season VARCHAR(50) DEFAULT 'Rabi',
        growth_stage VARCHAR(50) DEFAULT 'Pre-sowing',
        irrigation_type VARCHAR(50) DEFAULT 'Irrigated',
        target_yield DECIMAL(8, 2) DEFAULT NULL,
        target_yield_unit VARCHAR(20) DEFAULT 'q/ha',
        n_value DECIMAL(8, 2) NOT NULL,
        n_unit VARCHAR(20) DEFAULT 'kg/ha',
        p_value DECIMAL(8, 2) NOT NULL,
        p_unit VARCHAR(20) DEFAULT 'kg/ha',
        k_value DECIMAL(8, 2) NOT NULL,
        k_unit VARCHAR(20) DEFAULT 'kg/ha',
        ph_value DECIMAL(4, 2) NOT NULL,
        ec_value DECIMAL(6, 3) DEFAULT NULL,
        oc_value DECIMAL(5, 2) DEFAULT NULL,
        s_value DECIMAL(8, 2) DEFAULT NULL,
        zn_value DECIMAL(8, 2) DEFAULT NULL,
        fe_value DECIMAL(8, 2) DEFAULT NULL,
        cu_value DECIMAL(8, 2) DEFAULT NULL,
        mn_value DECIMAL(8, 2) DEFAULT NULL,
        b_value DECIMAL(8, 2) DEFAULT NULL,
        overall_rating VARCHAR(50) DEFAULT 'Moderately Fertile',
        analysis_json LONGTEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_farmer_rec (farmer_id),
        INDEX idx_plot_rec (plot_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Tables farm_plots and soil_health_records created successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to initialize soil DB tables:', err);
    process.exit(1);
  }
}

initSoilDatabase();

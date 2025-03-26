// backend/schema.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createSchema() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Status Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS status (
        status_id SERIAL PRIMARY KEY,
        status_term VARCHAR(50) NOT NULL,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      INSERT INTO status (status_term) VALUES
        ('Pending'),
        ('In-transit'),
        ('Delivered'),
        ('Cancelled')
      ON CONFLICT DO NOTHING;
    `);

    // Organization Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization (
        organization_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        buyer_type INTEGER CHECK (buyer_type IN (1, 2, 3)),
        email VARCHAR(255),
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Organization Required Email Domain Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_required_email_domain (
        organization_required_email_domain_id SERIAL PRIMARY KEY,
        email_domain VARCHAR(255) NOT NULL,
        organization_id INTEGER NOT NULL,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_email_domain_per_organization UNIQUE (email_domain, organization_id)
      );
    `);

    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        position VARCHAR(100),
        phone VARCHAR(20),
        user_active BOOLEAN DEFAULT TRUE,
        verification_code VARCHAR(20),
        verification BOOLEAN DEFAULT TRUE,
        location_id INTEGER,
        group_id INTEGER,
        permissions_id INTEGER,
        organization_id INTEGER,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date_time TIMESTAMP,
        CONSTRAINT unique_users_email UNIQUE (email)
      );
    `);

    // Login History Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS login_history (
        login_history_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        ip_address VARCHAR(45),
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Permissions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        permissions_id SERIAL PRIMARY KEY,
        term VARCHAR(255),
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Branding Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS branding (
        branding_id SERIAL PRIMARY KEY,
        url VARCHAR(255),
        organization_id INTEGER,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date_time TIMESTAMP
      );
    `);

    // Group Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "group" (
        group_id SERIAL PRIMARY KEY,
        term VARCHAR(255) NOT NULL,
        organization_id INTEGER,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date_time TIMESTAMP
      );
    `);

    // Locations Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        location_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address_1 VARCHAR(255),
        address_2 VARCHAR(255),
        city VARCHAR(100),
        state_province_region VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100),
        latitude DECIMAL(9,6),
        longitude DECIMAL(9,6),
        location_status BOOLEAN DEFAULT TRUE,
        user_id INTEGER,
        organization_id INTEGER,
        group_id INTEGER,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date_time TIMESTAMP
      );
    `);

    // Rating Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rating (
        rating_id SERIAL PRIMARY KEY,
        number_of_stars INTEGER CHECK (number_of_stars BETWEEN 1 AND 5),
        location_id INTEGER NOT NULL,
        group_id INTEGER,
        organization_id INTEGER,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date_time TIMESTAMP
      );
    `);

    // Wallets Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        wallet_id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        wallet_r VARCHAR(255),
        wallet_s VARCHAR(255),
        group_id INTEGER,
        organization_id INTEGER,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date_time TIMESTAMP
      );
    `);

    // Transactions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        transaction_id SERIAL PRIMARY KEY,
        xrpl_hash VARCHAR(255),
        barrels INTEGER,
        note TEXT,
        status_id INTEGER NOT NULL,
        archived BOOLEAN DEFAULT FALSE,
        wallet_id INTEGER,
        user_id INTEGER,
        group_id INTEGER,
        organization_id INTEGER,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date_time TIMESTAMP
      );
    `);

    // Inventory Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        inventory_id SERIAL PRIMARY KEY,
        quantity INTEGER,
        grade VARCHAR(50),
        price_per_barrel DECIMAL(10,2),
        qty_min_for_purchase INTEGER,
        closed_out BOOLEAN DEFAULT FALSE,
        closed_out_date_time TIMESTAMP,
        user_id INTEGER,
        location_id INTEGER,
        group_id INTEGER,
        organization_id INTEGER,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date_time TIMESTAMP
      );
    `);

    // Favorites Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        favorite_id SERIAL PRIMARY KEY,
        location_id INTEGER,
        user_id INTEGER,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date_time TIMESTAMP
      );
    `);

    // History Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS history (
        history_id SERIAL PRIMARY KEY,
        location_id INTEGER,
        user_id INTEGER,
        transaction_id INTEGER,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ads Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ads (
        ad_id SERIAL PRIMARY KEY,
        image_file VARCHAR(255),
        title VARCHAR(255),
        user_id INTEGER,
        location_id INTEGER,
        group_id INTEGER,
        organization_id INTEGER,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date_time TIMESTAMP
      );
    `);

    // Messaging Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messaging (
        message_id SERIAL PRIMARY KEY,
        subject VARCHAR(255),
        message TEXT,
        from_user_id INTEGER,
        to_user_id INTEGER,
        archive BOOLEAN DEFAULT FALSE,
        organization_id INTEGER,
        created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Foreign Keys
    await client.query(`
      ALTER TABLE users
      ADD CONSTRAINT fk_users_location_id FOREIGN KEY (location_id) REFERENCES locations(location_id),
      ADD CONSTRAINT fk_users_permissions_id FOREIGN KEY (permissions_id) REFERENCES permissions(permissions_id),
      ADD CONSTRAINT fk_users_organization_id FOREIGN KEY (organization_id) REFERENCES organization(organization_id),
      ADD CONSTRAINT fk_users_group_id FOREIGN KEY (group_id) REFERENCES "group"(group_id);
    `);

    await client.query(`
      ALTER TABLE organization_required_email_domain
      ADD CONSTRAINT fk_organization_required_email_domain_organization_id FOREIGN KEY (organization_id) REFERENCES organization(organization_id);
    `);

    await client.query(`
      ALTER TABLE login_history
      ADD CONSTRAINT fk_login_history_user_id FOREIGN KEY (user_id) REFERENCES users(user_id);
    `);

    await client.query(`
      ALTER TABLE branding
      ADD CONSTRAINT fk_branding_organization_id FOREIGN KEY (organization_id) REFERENCES organization(organization_id);
    `);

    await client.query(`
      ALTER TABLE "group"
      ADD CONSTRAINT fk_group_organization_id FOREIGN KEY (organization_id) REFERENCES organization(organization_id);
    `);

    await client.query(`
      ALTER TABLE locations
      ADD CONSTRAINT fk_locations_user_id FOREIGN KEY (user_id) REFERENCES users(user_id),
      ADD CONSTRAINT fk_locations_organization_id FOREIGN KEY (organization_id) REFERENCES organization(organization_id),
      ADD CONSTRAINT fk_locations_group_id FOREIGN KEY (group_id) REFERENCES "group"(group_id);
    `);

    await client.query(`
      ALTER TABLE rating
      ADD CONSTRAINT fk_rating_location_id FOREIGN KEY (location_id) REFERENCES locations(location_id),
      ADD CONSTRAINT fk_rating_organization_id FOREIGN KEY (organization_id) REFERENCES organization(organization_id),
      ADD CONSTRAINT fk_rating_group_id FOREIGN KEY (group_id) REFERENCES "group"(group_id);
    `);

    await client.query(`
      ALTER TABLE wallets
      ADD CONSTRAINT fk_wallets_group_id FOREIGN KEY (group_id) REFERENCES "group"(group_id),
      ADD CONSTRAINT fk_wallets_organization_id FOREIGN KEY (organization_id) REFERENCES organization(organization_id);
    `);

    await client.query(`
      ALTER TABLE transactions
      ADD CONSTRAINT fk_transactions_wallet_id FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id),
      ADD CONSTRAINT fk_transactions_user_id FOREIGN KEY (user_id) REFERENCES users(user_id),
      ADD CONSTRAINT fk_transactions_group_id FOREIGN KEY (group_id) REFERENCES "group"(group_id),
      ADD CONSTRAINT fk_transactions_organization_id FOREIGN KEY (organization_id) REFERENCES organization(organization_id),
      ADD CONSTRAINT fk_transactions_status_id FOREIGN KEY (status_id) REFERENCES status(status_id);
    `);

    await client.query(`
      ALTER TABLE inventory
      ADD CONSTRAINT fk_inventory_location_id FOREIGN KEY (location_id) REFERENCES locations(location_id),
      ADD CONSTRAINT fk_inventory_user_id FOREIGN KEY (user_id) REFERENCES users(user_id),
      ADD CONSTRAINT fk_inventory_group_id FOREIGN KEY (group_id) REFERENCES "group"(group_id),
      ADD CONSTRAINT fk_inventory_organization_id FOREIGN KEY (organization_id) REFERENCES organization(organization_id);
    `);

    await client.query(`
      ALTER TABLE favorites
      ADD CONSTRAINT fk_favorites_user_id FOREIGN KEY (user_id) REFERENCES users(user_id),
      ADD CONSTRAINT fk_favorites_location_id FOREIGN KEY (location_id) REFERENCES locations(location_id);
    `);

    await client.query(`
      ALTER TABLE history
      ADD CONSTRAINT fk_history_user_id FOREIGN KEY (user_id) REFERENCES users(user_id),
      ADD CONSTRAINT fk_history_location_id FOREIGN KEY (location_id) REFERENCES locations(location_id),
      ADD CONSTRAINT fk_history_transaction_id FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id);
    `);

    await client.query(`
      ALTER TABLE ads
      ADD CONSTRAINT fk_ads_user_id FOREIGN KEY (user_id) REFERENCES users(user_id),
      ADD CONSTRAINT fk_ads_location_id FOREIGN KEY (location_id) REFERENCES locations(location_id),
      ADD CONSTRAINT fk_ads_group_id FOREIGN KEY (group_id) REFERENCES "group"(group_id),
      ADD CONSTRAINT fk_ads_organization_id FOREIGN KEY (organization_id) REFERENCES organization(organization_id);
    `);

    await client.query(`
      ALTER TABLE messaging
      ADD CONSTRAINT fk_messaging_from_user_id FOREIGN KEY (from_user_id) REFERENCES users(user_id),
      ADD CONSTRAINT fk_messaging_to_user_id FOREIGN KEY (to_user_id) REFERENCES users(user_id),
      ADD CONSTRAINT fk_messaging_organization_id FOREIGN KEY (organization_id) REFERENCES organization(organization_id);
    `);

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_transactions_xrpl_hash ON transactions(xrpl_hash);
      CREATE INDEX IF NOT EXISTS idx_messaging_from_user_id ON messaging(from_user_id);
      CREATE INDEX IF NOT EXISTS idx_messaging_to_user_id ON messaging(to_user_id);
    `);

    await client.query('COMMIT');
    console.log('Database schema created successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating schema:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

createSchema();

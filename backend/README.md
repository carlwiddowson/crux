├── backend/                # New backend folder for PostgreSQL integration
│   ├── config/             # Configuration files
│   │   └── db.js           # Database connection setup
│   ├── routes/             # API route handlers
│   │   └── api.js          # API endpoints (e.g., /deliveries, /transactions)
│   ├── models/             # Database models (schema definitions)
│   │   └── ads.js          # Model for ads table
│   │   └── branding.js     # Model for branding table
│   │   └── deliveries.js   # Model for deliveries table
│   │   └── favorites.js    # Model for favorites table
│   │   └── group.js        # Model for group table
│   │   └── history.js      # Model for history table
│   │   └── inventory.js    # Model for inventory table
│   │   └── locations.js    # Model for locations table
│   │   └── login_history.js # Model for login_history table
│   │   └── messaging.js    # Model for messaging table
│   │   └── organization.js # Model for organization table
│   │   └── permissions.js  # Model for permissions table
│   │   └── rating.js       # Model for rating table
│   │   └── status.js       # Model for status table
│   │   └── transactions.js # Model for transactions table
│   │   └── users.js        # Model for users table
│   │   └── wallets.js      # Model for wallets table
│   ├── package.json        # Backend dependencies (e.g., express, pg)
│   ├── server.js           # Main backend server file
│   └── .env                # Environment variables (e.g., database credentials)

SQL Structure:
-- Status Table
CREATE TABLE status (
    status_id SERIAL PRIMARY KEY,
    status_term VARCHAR(50) NOT NULL,
    created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial status values
INSERT INTO status (status_term) VALUES
  ('Pending'),
  ('In-transit'),
  ('Delivered'),
  ('Cancelled');

-- Organization Table
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    buyer_type INTEGER CHECK (buyer_type IN (1, 2, 3)), -- Example constraint
    email VARCHAR(255),
    created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organization Required Email Domain Table
CREATE TABLE organization_required_email_domain (
    organization_required_email_domain_id SERIAL PRIMARY KEY,
    email_domain VARCHAR(255) NOT NULL,
    organization_id INTEGER NOT NULL,
    created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_email_domain_per_organization UNIQUE (email_domain, organization_id)
);

-- Users Table
CREATE TABLE users (
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

-- Login History Table
CREATE TABLE login_history (
    login_history_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    ip_address VARCHAR(45), -- Changed to VARCHAR for IPv4/IPv6
    created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE permissions (
    permissions_id SERIAL PRIMARY KEY,
    term VARCHAR(255),
    created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branding Table
CREATE TABLE branding (
    branding_id SERIAL PRIMARY KEY,
    url VARCHAR(255),
    organization_id INTEGER,
    created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date_time TIMESTAMP
);

-- Group Table
CREATE TABLE "group" (
    group_id SERIAL PRIMARY KEY,
    term VARCHAR(255) NOT NULL,
    organization_id INTEGER,
    created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date_time TIMESTAMP
);

-- Locations Table
CREATE TABLE locations (
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

-- Rating Table
CREATE TABLE rating (
    rating_id SERIAL PRIMARY KEY,
    number_of_stars INTEGER CHECK (number_of_stars BETWEEN 1 AND 5),
    location_id INTEGER NOT NULL,
    group_id INTEGER,
    organization_id INTEGER,
    created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date_time TIMESTAMP
);

-- Wallets Table
CREATE TABLE wallets (
    wallet_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    wallet_r VARCHAR(255),
    wallet_s VARCHAR(255),
    group_id INTEGER,
    organization_id INTEGER,
    created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date_time TIMESTAMP
);

-- Transactions Table
CREATE TABLE transactions (
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

-- Inventory Table
CREATE TABLE inventory (
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

-- Favorites Table
CREATE TABLE favorites (
    favorite_id SERIAL PRIMARY KEY,
    location_id INTEGER,
    user_id INTEGER,
    created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date_time TIMESTAMP
);

-- History Table
CREATE TABLE history (
    history_id SERIAL PRIMARY KEY,
    location_id INTEGER,
    user_id INTEGER,
    transaction_id INTEGER,
    created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ads Table
CREATE TABLE ads (
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

-- Messaging Table
CREATE TABLE messaging (
    message_id SERIAL PRIMARY KEY,
    subject VARCHAR(255), -- Increased length
    message TEXT,
    from_user_id INTEGER,
    to_user_id INTEGER,
    archive BOOLEAN DEFAULT FALSE,
    organization_id INTEGER,
    created_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table Foreign Keys
ALTER TABLE users
ADD CONSTRAINT fk_users_location_id
FOREIGN KEY (location_id) REFERENCES locations(location_id);

ALTER TABLE users
ADD CONSTRAINT fk_users_permissions_id
FOREIGN KEY (permissions_id) REFERENCES permissions(permissions_id);

ALTER TABLE users
ADD CONSTRAINT fk_users_organization_id
FOREIGN KEY (organization_id) REFERENCES organization(organization_id);

ALTER TABLE users
ADD CONSTRAINT fk_users_group_id
FOREIGN KEY (group_id) REFERENCES "group"(group_id);

-- Organization Required Email Domain Table Foreign Key
ALTER TABLE organization_required_email_domain
ADD CONSTRAINT fk_organization_required_email_domain_organization_id
FOREIGN KEY (organization_id) REFERENCES organization(organization_id);

-- Login History Table Foreign Key
ALTER TABLE login_history
ADD CONSTRAINT fk_login_history_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id);

-- Branding Table Foreign Key
ALTER TABLE branding
ADD CONSTRAINT fk_branding_organization_id
FOREIGN KEY (organization_id) REFERENCES organization(organization_id);

-- Group Table Foreign Keys
ALTER TABLE "group"
ADD CONSTRAINT fk_group_organization_id
FOREIGN KEY (organization_id) REFERENCES organization(organization_id);

-- Locations Table Foreign Keys
ALTER TABLE locations
ADD CONSTRAINT fk_locations_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id);

ALTER TABLE locations
ADD CONSTRAINT fk_locations_organization_id
FOREIGN KEY (organization_id) REFERENCES organization(organization_id);

ALTER TABLE locations
ADD CONSTRAINT fk_locations_group_id
FOREIGN KEY (group_id) REFERENCES "group"(group_id);

-- Rating Table Foreign Keys
ALTER TABLE rating
ADD CONSTRAINT fk_rating_location_id
FOREIGN KEY (location_id) REFERENCES locations(location_id);

ALTER TABLE rating
ADD CONSTRAINT fk_rating_organization_id
FOREIGN KEY (organization_id) REFERENCES organization(organization_id);

ALTER TABLE rating
ADD CONSTRAINT fk_rating_group_id
FOREIGN KEY (group_id) REFERENCES "group"(group_id);

-- Wallets Table Foreign Keys
ALTER TABLE wallets
ADD CONSTRAINT fk_wallets_group_id
FOREIGN KEY (group_id) REFERENCES "group"(group_id);

ALTER TABLE wallets
ADD CONSTRAINT fk_wallets_organization_id
FOREIGN KEY (organization_id) REFERENCES organization(organization_id);

-- Transactions Table Foreign Keys
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_wallet_id
FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id);

ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id);

ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_group_id
FOREIGN KEY (group_id) REFERENCES "group"(group_id);

ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_organization_id
FOREIGN KEY (organization_id) REFERENCES organization(organization_id);

ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_status_id
FOREIGN KEY (status_id) REFERENCES status(status_id);

-- Inventory Table Foreign Keys
ALTER TABLE inventory
ADD CONSTRAINT fk_inventory_location_id
FOREIGN KEY (location_id) REFERENCES locations(location_id);

ALTER TABLE inventory
ADD CONSTRAINT fk_inventory_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id);

ALTER TABLE inventory
ADD CONSTRAINT fk_inventory_group_id
FOREIGN KEY (group_id) REFERENCES "group"(group_id);

ALTER TABLE inventory
ADD CONSTRAINT fk_inventory_organization_id
FOREIGN KEY (organization_id) REFERENCES organization(organization_id);

-- Favorites Table Foreign Keys
ALTER TABLE favorites
ADD CONSTRAINT fk_favorites_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id);

ALTER TABLE favorites
ADD CONSTRAINT fk_favorites_location_id
FOREIGN KEY (location_id) REFERENCES locations(location_id);

-- History Table Foreign Keys
ALTER TABLE history
ADD CONSTRAINT fk_history_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id);

ALTER TABLE history
ADD CONSTRAINT fk_history_location_id
FOREIGN KEY (location_id) REFERENCES locations(location_id);

ALTER TABLE history
ADD CONSTRAINT fk_history_transaction_id
FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id);

-- Ads Table Foreign Keys
ALTER TABLE ads
ADD CONSTRAINT fk_ads_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id);

ALTER TABLE ads
ADD CONSTRAINT fk_ads_location_id
FOREIGN KEY (location_id) REFERENCES locations(location_id);

ALTER TABLE ads
ADD CONSTRAINT fk_ads_group_id
FOREIGN KEY (group_id) REFERENCES "group"(group_id);

ALTER TABLE ads
ADD CONSTRAINT fk_ads_organization_id
FOREIGN KEY (organization_id) REFERENCES organization(organization_id);

-- Messaging Table Foreign Keys
ALTER TABLE messaging
ADD CONSTRAINT fk_messaging_from_user_id
FOREIGN KEY (from_user_id) REFERENCES users(user_id);

ALTER TABLE messaging
ADD CONSTRAINT fk_messaging_to_user_id
FOREIGN KEY (to_user_id) REFERENCES users(user_id);

ALTER TABLE messaging
ADD CONSTRAINT fk_messaging_organization_id
FOREIGN KEY (organization_id) REFERENCES organization(organization_id);

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_transactions_xrpl_hash ON transactions(xrpl_hash);
CREATE INDEX idx_messaging_from_user_id ON messaging(from_user_id);
CREATE INDEX idx_messaging_to_user_id ON messaging(to_user_id);
const express = require('express');
const pool = require('../config/db');
const bcrypt = require('bcrypt'); // Add bcrypt
const router = express.Router();

// Import models
const Organization = require('../models/organization');
const User = require('../models/users');
const Delivery = require('../models/deliveries');
const Transaction = require('../models/transactions');
const LoginHistory = require('../models/login_history');
const Permission = require('../models/permissions');
const Branding = require('../models/branding');
const Group = require('../models/group');
const Location = require('../models/locations');
const Rating = require('../models/rating');
const Wallet = require('../models/wallets');
const Status = require('../models/status');
const Inventory = require('../models/inventory');
const Favorite = require('../models/favorites');
const History = require('../models/history');
const Ad = require('../models/ads');
const Message = require('../models/messaging');

// Organizations
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await Organization.findAll();
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/organizations', async (req, res) => {
  try {
    const organization = await Organization.create(req.body);
    res.status(201).json(organization);
  } catch (error) {
    console.error('Error creating organization:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Register (updated to hash password)
router.post('/register', async (req, res) => {
  const { organization, user, emailDomain } = req.body;

  try {
    // Step 1: Create the organization
    console.log('Creating organization:', organization);
    const newOrganization = await Organization.create({
      name: organization.name,
      buyer_type: organization.buyer_type,
      email: organization.email,
    });
    console.log('Created organization:', newOrganization);

    // Step 2: Save the email domain to organization_required_email_domain
    const emailDomainQuery = `
      INSERT INTO organization_required_email_domain (email_domain, organization_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const emailDomainValues = [emailDomain, newOrganization.organization_id];
    const emailDomainResult = await pool.query(emailDomainQuery, emailDomainValues);
    console.log('Created email domain entry:', emailDomainResult.rows[0]);

    // Step 3: Hash the password
    const saltRounds = 10; // Number of salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    console.log('Hashed password:', hashedPassword);

    // Step 4: Create the user with the hashed password and organization ID
    const newUser = await User.create({
      ...user,
      password: hashedPassword, // Use the hashed password
      organization_id: newOrganization.organization_id,
    });
    console.log('Created user:', newUser);

    res.status(201).json({ organization: newOrganization, user: newUser });
  } catch (error) {
    console.error('Error during registration:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Deliveries
router.get('/deliveries', async (req, res) => {
  try {
    console.log('Fetching all deliveries...');
    const deliveries = await Delivery.findAll();
    console.log('Fetched deliveries:', deliveries);
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/deliveries', async (req, res) => {
  try {
    console.log('Creating new delivery:', req.body);
    const delivery = await Delivery.create(req.body);
    console.log('Created delivery:', delivery);
    res.status(201).json(delivery);
  } catch (error) {
    console.error('Error creating delivery:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.get('/deliveries/:id', async (req, res) => {
  try {
    console.log('Fetching delivery with ID:', req.params.id);
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    console.log('Fetched delivery:', delivery);
    res.json(delivery);
  } catch (error) {
    console.error('Error fetching delivery by ID:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.put('/deliveries/:id', async (req, res) => {
  try {
    console.log('Updating delivery with ID:', req.params.id, 'Data:', req.body);
    const delivery = await Delivery.updateById(req.params.id, req.body);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    console.log('Updated delivery:', delivery);
    res.json(delivery);
  } catch (error) {
    console.error('Error updating delivery:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/deliveries/:id', async (req, res) => {
  try {
    console.log('Deleting delivery with ID:', req.params.id);
    const delivery = await Delivery.deleteById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    console.log('Deleted delivery:', delivery);
    res.json({ message: 'Delivery deleted successfully', delivery });
  } catch (error) {
    console.error('Error deleting delivery:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/transactions', async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Login History
router.get('/login_history', async (req, res) => {
  try {
    const loginHistory = await LoginHistory.findAll();
    res.json(loginHistory);
  } catch (error) {
    console.error('Error fetching login history:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login_history', async (req, res) => {
  try {
    const loginEntry = await LoginHistory.create(req.body);
    res.status(201).json(loginEntry);
  } catch (error) {
    console.error('Error creating login history:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Permissions
router.get('/permissions', async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/permissions', async (req, res) => {
  try {
    const permission = await Permission.create(req.body);
    res.status(201).json(permission);
  } catch (error) {
    console.error('Error creating permission:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Branding
router.get('/branding', async (req, res) => {
  try {
    const branding = await Branding.findAll();
    res.json(branding);
  } catch (error) {
    console.error('Error fetching branding:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/branding', async (req, res) => {
  try {
    const brandingEntry = await Branding.create(req.body);
    res.status(201).json(brandingEntry);
  } catch (error) {
    console.error('Error creating branding:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Groups
router.get('/groups', async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/groups', async (req, res) => {
  try {
    const group = await Group.create(req.body);
    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await Location.findAll();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/locations', async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json(location);
  } catch (error) {
    console.error('Error creating location:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Ratings
router.get('/ratings', async (req, res) => {
  try {
    const ratings = await Rating.findAll();
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/ratings', async (req, res) => {
  try {
    const rating = await Rating.create(req.body);
    res.status(201).json(rating);
  } catch (error) {
    console.error('Error creating rating:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Wallets
router.get('/wallets', async (req, res) => {
  try {
    const wallets = await Wallet.findAll();
    res.json(wallets);
  } catch (error) {
    console.error('Error fetching wallets:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/wallets', async (req, res) => {
  try {
    const wallet = await Wallet.create(req.body);
    res.status(201).json(wallet);
  } catch (error) {
    console.error('Error creating wallet:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Statuses
router.get('/statuses', async (req, res) => {
  try {
    const statuses = await Status.findAll();
    res.json(statuses);
  } catch (error) {
    console.error('Error fetching statuses:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/statuses', async (req, res) => {
  try {
    const status = await Status.create(req.body);
    res.status(201).json(status);
  } catch (error) {
    console.error('Error creating status:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Inventory
router.get('/inventory', async (req, res) => {
  try {
    const inventory = await Inventory.findAll();
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/inventory', async (req, res) => {
  try {
    const inventoryEntry = await Inventory.create(req.body);
    res.status(201).json(inventoryEntry);
  } catch (error) {
    console.error('Error creating inventory:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Favorites
router.get('/favorites', async (req, res) => {
  try {
    const favorites = await Favorite.findAll();
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/favorites', async (req, res) => {
  try {
    const favorite = await Favorite.create(req.body);
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Error creating favorite:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// History
router.get('/history', async (req, res) => {
  try {
    const history = await History.findAll();
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/history', async (req, res) => {
  try {
    const historyEntry = await History.create(req.body);
    res.status(201).json(historyEntry);
  } catch (error) {
    console.error('Error creating history:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Ads
router.get('/ads', async (req, res) => {
  try {
    const ads = await Ad.findAll();
    res.json(ads);
  } catch (error) {
    console.error('Error fetching ads:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/ads', async (req, res) => {
  try {
    const ad = await Ad.create(req.body);
    res.status(201).json(ad);
  } catch (error) {
    console.error('Error creating ad:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.findAll();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
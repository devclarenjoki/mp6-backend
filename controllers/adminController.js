const { secretKey } = require('../config');
const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminModel');
const Purchase = require('../models/PurchaseModel');
const Product = require('../models/ProductModel');

function generateAuthToken(userId) {
  return jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
}

// Admin login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the admin user
    const admin = await Admin.findOne({ username });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate and return an authentication token
    const token = generateAuthToken();
    res.json({ token });
  } catch (error) {
    console.log(error, 'error')
    res.status(500).json({ error: 'An error occurred while logging in' });
  }
};

// Get platform statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalSales = await Purchase.countDocuments();
    const topSellingContent = await Product.find()
      .sort('-salesCount')
      .limit(10)
      .select('title salesCount');

    // Implement additional statistics calculations if needed
    // ...

    res.json({ totalSales, topSellingContent });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching statistics' });
  }
};

// Manage user accounts, disputes, and content
exports.managePlatform = async (req, res) => {
  try {
    // Implement admin management functionality
    // ...

    res.json({ message: 'Platform management performed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while managing the platform' });
  }
};

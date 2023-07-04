const Seller = require('../models/SellerModel');

// Upgrade seller's account
exports.upgradeAccount = async (req, res) => {
  try {
    const { sellerId, subscription } = req.body;

    // Find the seller
    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    // Update the seller's subscription
    seller.subscription = subscription;
    await seller.save();

    res.json({ message: 'Account upgraded successfully', seller });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while upgrading the account' });
  }
};

// Manage uploaded content
exports.manageContent = async (req, res) => {
  try {
    const { sellerId, content } = req.body;

    // Find the seller
    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    // Update the seller's uploaded content
    seller.uploadedContent = content;
    await seller.save();

    res.json({ message: 'Content updated successfully', seller });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while managing the content' });
  }
};

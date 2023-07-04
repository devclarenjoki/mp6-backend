const Purchase = require('../models/PurchaseModel');
const moment = require('moment');
const jwt = require('jsonwebtoken');

// Handle successful purchase
exports.handlePurchase = async (req, res) => {
  try {
    const { customerId, productId } = req.body;

    // Save the purchase details in the database
    const purchase = await Purchase.create({
      customerId,
      productId,
      downloadLink: generateDownloadLink(productId),
      expiresAt: moment().add(24, 'hours').toDate(), // Set the expiration time
    });

    res.json({ message: 'Purchase completed successfully', purchase });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing the purchase' });
  }
};

// Generate a secure download link
function generateDownloadLink(productId) {
  const token = jwt.sign({ productId }, process.env.JWT_SECRET); // Generate a unique token
  // Create a download link with the token, e.g., '/download/:token'
  return `/download/${token}`;
}

// Verify the download link and provide access to the purchased content
exports.downloadContent = async (req, res) => {
  try {
    const token = req.params.token;

    // Verify the token and extract the productId
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const productId = decodedToken.productId;

    // Find the purchase record associated with the productId
    const purchase = await Purchase.findOne({ productId });

    if (!purchase) {
      return res.status(404).json({ error: 'Invalid download link' });
    }

    // Check if the download link has expired
    if (moment().isAfter(purchase.expiresAt)) {
      return res.status(403).json({ error: 'Download link has expired' });
    }

    // Implement additional access control mechanisms if needed
    // ...

    // Provide access to the purchased content
    res.json({ message: 'Access granted. Start downloading the content.' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing the download' });
  }
};

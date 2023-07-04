const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/', authenticate, purchaseController.handlePurchase);
router.get('/download/:token', purchaseController.downloadContent);

module.exports = router;

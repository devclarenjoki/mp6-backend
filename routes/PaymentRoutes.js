const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/PaymentController');

router.post('/', authenticate, paymentController.createPayment);
router.get('/paypal/success', paymentController.processPayment);

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const orderController = require('../controllers/orderController');

router.post('/', authenticate, orderController.createOrder);
router.post('/payment', authenticate, orderController.processPayment);
router.get('/payment/success', orderController.paymentSuccess);

module.exports = router;

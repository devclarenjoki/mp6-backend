const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/', authenticate, cartController.addToCart);
router.get('/', authenticate, cartController.listCartItems);
router.get('/:cartId/payment', authenticate, cartController.initiatePayment);
router.get('/:cartId/payment/complete', authenticate, cartController.completePayment);

module.exports = router;

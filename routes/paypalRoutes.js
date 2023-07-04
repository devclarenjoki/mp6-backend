const express = require('express');
const router = express.Router();
const { createOrder, capturePayment, createPayment } = require('../controllers/paypal-api');


router.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));
router.post('/create-order', createOrder);
router.get('/capture-order', capturePayment);

module.exports = router;

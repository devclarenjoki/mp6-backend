const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { authenticate } = require('../middlewares/authMiddleware');

router.put('/upgrade', authenticate, sellerController.upgradeAccount);
router.put('/manage', authenticate, sellerController.manageContent);

module.exports = router;

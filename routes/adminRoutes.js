const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.login);
router.get('/statistics', adminController.getStatistics);
router.put('/manage', adminController.managePlatform);

module.exports = router;

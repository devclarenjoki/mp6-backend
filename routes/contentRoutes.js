const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/upload', authenticate, contentController.uploadContent);

module.exports = router;

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/authMiddleware');

router.get('/seller', auth(['seller', 'admin']), analyticsController.getSellerAnalytics);

module.exports = router;

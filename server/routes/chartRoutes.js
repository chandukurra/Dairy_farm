const express = require('express');
const { getMilkTrend } = require('../controllers/chartController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Route: /api/charts/milk-trend
router.get('/milk-trend', protect, authorize('ADMIN', 'FARM_MANAGER'), getMilkTrend);

module.exports = router;
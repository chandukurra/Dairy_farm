const express = require('express');
const { getProfitLoss } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Financial reports are highly sensitive, restricted to Admin only
router.get('/profit', authorize('ADMIN'), getProfitLoss);

module.exports = router;
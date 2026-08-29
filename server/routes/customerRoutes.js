const express = require('express');
const { getCustomers } = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, authorize('ADMIN', 'FARM_MANAGER'), getCustomers);

module.exports = router;
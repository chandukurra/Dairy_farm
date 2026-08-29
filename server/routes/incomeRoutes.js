const express = require('express');
const { createIncome, getIncome } = require('../controllers/incomeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.route('/')
    .get(authorize('ADMIN', 'FARM_MANAGER'), getIncome)
    .post(authorize('ADMIN', 'FARM_MANAGER'), createIncome);

module.exports = router;
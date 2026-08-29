const express = require('express');
const { createExpense, getExpenses } = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.route('/')
    .get(authorize('ADMIN', 'FARM_MANAGER'), getExpenses)
    .post(authorize('ADMIN', 'FARM_MANAGER'), createExpense);

module.exports = router;
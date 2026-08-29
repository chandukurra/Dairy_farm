const express = require('express');
const { createTransaction, getTransactions } = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.route('/')
    .get(authorize('ADMIN', 'FARM_MANAGER'), getTransactions)
    .post(authorize('ADMIN', 'FARM_MANAGER'), createTransaction);

module.exports = router;
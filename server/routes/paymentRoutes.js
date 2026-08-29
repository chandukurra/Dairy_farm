const express = require('express');
const { createPayment, getPayments, verifyPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.route('/')
    .get(getPayments) // Protect handles role mapping inside controller
    .post(authorize('ADMIN', 'FARM_MANAGER', 'CUSTOMER'), createPayment);

router.put('/:id/verify', authorize('ADMIN', 'FARM_MANAGER'), verifyPayment);

module.exports = router;

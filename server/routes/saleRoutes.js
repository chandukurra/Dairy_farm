const express = require('express');
const { createSale, getSales, getSaleById } = require('../controllers/saleController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.route('/')
    .get(authorize('ADMIN', 'FARM_MANAGER','CUSTOMER'), getSales)
    .post(authorize('ADMIN', 'FARM_MANAGER'), createSale);

router.get('/:id', authorize('ADMIN', 'FARM_MANAGER', 'CUSTOMER'), getSaleById);

module.exports = router;

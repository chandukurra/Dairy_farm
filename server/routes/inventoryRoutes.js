const express = require('express');
const { 
    getInventory, 
    createItem, 
    addStock 
} = require('../controllers/inventoryController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection middleware to all inventory routes
router.use(protect);

// Standard GET and POST routes
router
    .route('/')
    .get(authorize('ADMIN', 'FARM_MANAGER'), getInventory)
    .post(authorize('ADMIN', 'FARM_MANAGER'), createItem);

// The new route to update the stock quantities!
router
    .route('/:id/add-stock')
    .put(authorize('ADMIN', 'FARM_MANAGER'), addStock);

module.exports = router;
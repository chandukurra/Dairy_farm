const express = require('express');
const { 
    getMilkLogs, 
    createMilkLog, 
    getAnimalMilkLogs 
} = require('../controllers/milkController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection middleware to all milk routes
router.use(protect);

router
    .route('/')
    .get(authorize('ADMIN', 'FARM_MANAGER'), getMilkLogs)
    .post(authorize('ADMIN', 'FARM_MANAGER', 'WORKER'), createMilkLog);

router
    .route('/animal/:animalId')
    .get(authorize('ADMIN', 'FARM_MANAGER'), getAnimalMilkLogs);

module.exports = router;
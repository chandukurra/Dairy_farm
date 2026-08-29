const express = require('express');
const { getAdminDashboard, getManagerDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/admin', authorize('ADMIN'), getAdminDashboard);
router.get('/manager', authorize('FARM_MANAGER', 'ADMIN'), getManagerDashboard);

module.exports = router;
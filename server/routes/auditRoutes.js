const express = require('express');

const router = express.Router();

const {
    getAuditLogs
} = require('../controllers/auditController');

const { protect, authorize } = require('../middleware/auth');


// Admin only
router.get(
    '/',
    protect,
    authorize('ADMIN'),
    getAuditLogs
);

module.exports = router;
const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin Only)
exports.getAuditLogs = async (req, res, next) => {
    try {
        const logs = await AuditLog.find()
            .populate('user', 'name role email')
            .sort({ createdAt: -1 })
            .limit(1000); // Prevent massive payloads

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        next(error);
    }
};

// Internal Helper to create logs from other controllers
exports.logAction = async (userId, action, module, recordId, ipAddress, oldValue = null, newValue = null) => {
    try {
        await AuditLog.create({ user: userId, action, module, recordId, ipAddress, oldValue, newValue });
    } catch (error) {
        console.error('Audit Log Error:', error); // Do not crash the app if logging fails
    }
};
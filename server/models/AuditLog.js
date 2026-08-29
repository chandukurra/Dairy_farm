const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VERIFY', 'REJECT', 'PASSWORD_CHANGE', 'USER_STATUS_CHANGE'],
        required: true
    },
    module: {
        type: String,
        required: true // e.g., 'ANIMALS', 'MILK', 'USERS', 'FINANCE'
    },
    recordId: {
        type: mongoose.Schema.ObjectId
    },
    oldValue: {
        type: mongoose.Schema.Types.Mixed
    },
    newValue: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
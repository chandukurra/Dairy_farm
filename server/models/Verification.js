const mongoose = require('mongoose');
const { notifyRoles } = require('../services/notificationService');

const verificationSchema = new mongoose.Schema({
    recordType: {
        type: String,
        enum: ['MILK_PRODUCTION', 'MILK_SALE', 'EXPENSE', 'PAYMENT', 'INVENTORY', 'INCOME'],
        required: true
    },
    recordId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        // Using refPath allows dynamic referencing if needed later
    },
    submittedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    checkedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    status: {
    type: String,
    // Add 'APPROVED' to this list!
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'VERIFIED'], 
    default: 'PENDING'
},
    remarks: {
        type: String,
        trim: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    checkedAt: {
        type: Date
    }
});

const verificationLabels = {
    MILK_PRODUCTION: 'Milk log',
    MILK_SALE: 'Milk sale',
    EXPENSE: 'Expense',
    PAYMENT: 'Payment',
    INVENTORY: 'Inventory change',
    INCOME: 'Income'
};

// Every submitted verification follows this one path, so an admin alert cannot be
// missed when new approval-required features are added later.
verificationSchema.post('save', (verification) => {
    if (verification.status !== 'PENDING') return;
    const label = verificationLabels[verification.recordType] || 'Farm record';
    notifyRoles(['ADMIN'], {
        title: `${label} needs review`,
        message: `A new ${label.toLowerCase()} was submitted for verification.`,
        type: 'ACTION',
        link: '/admin/verifications'
    }).catch((error) => console.error('Notification delivery failed:', error.message));
});

module.exports = mongoose.model('Verification', verificationSchema);

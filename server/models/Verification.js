const mongoose = require('mongoose');

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

module.exports = mongoose.model('Verification', verificationSchema);
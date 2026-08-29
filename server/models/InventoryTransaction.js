const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.ObjectId,
        ref: 'Inventory',
        required: true
    },
    transactionType: {
        type: String,
        enum: ['PURCHASE', 'USAGE', 'ADJUSTMENT'],
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'Please specify the quantity'],
        // Positive for PURCHASE, Negative for USAGE
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: [true, 'Please provide a reason or description for this transaction'],
        trim: true
    },
    enteredBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    verificationStatus: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'REJECTED'],
        default: 'PENDING'
    }
}, { timestamps: true });

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
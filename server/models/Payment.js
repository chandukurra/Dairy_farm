const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    sale: {
        type: mongoose.Schema.ObjectId,
        ref: 'Sale' // Optional: Link payment to a specific sale, or leave blank for account balance
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: mongoose.Types.Decimal128,
        required: [true, 'Please specify the payment amount']
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'OTHER'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['PAID', 'PARTIAL', 'PENDING', 'VERIFIED', 'REJECTED'],
        default: 'PENDING'
    },
    referenceNumber: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    incomeDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    category: {
        type: String,
        enum: ['MANURE_SALES', 'ANIMAL_SALES', 'OTHER'],
        required: [true, 'Please specify an income category']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        trim: true
    },
    amount: {
        type: mongoose.Types.Decimal128,
        required: [true, 'Please provide the income amount']
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

module.exports = mongoose.model('Income', incomeSchema);
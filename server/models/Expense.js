const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    expenseDate: {
        type: Date,
        required: [true, 'Please add an expense date'],
        default: Date.now
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['SALARY', 'FEED', 'TRANSPORTATION', 'MEDICAL', 'MAINTENANCE', 'OTHER'] 
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add the amount']
    },
    paymentMethod: {
        type: String,
        required: [true, 'Please select a payment method'],
        enum: ['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE'] 
    },
    // Matches the controller exactly so populate('enteredBy') works!
    enteredBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Allows the frontend to switch between PENDING and SETTLED
    status: {
        type: String,
        enum: ['PENDING', 'SETTLED', 'REJECTED'],
        default: 'PENDING'
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Expense', expenseSchema);
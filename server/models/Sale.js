const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    saleDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'Please add a quantity in litres']
    },
    pricePerLitre: {
        type: Number,
        required: [true, 'Please add the price per litre']
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'PAID', 'REJECTED'],
        default: 'PENDING'
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
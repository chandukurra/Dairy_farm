const mongoose = require('mongoose');

const milkSaleSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: [true, 'Please specify the customer']
    },
    saleDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'Please specify the quantity in litres'],
        min: [0.1, 'Quantity must be greater than zero']
    },
    pricePerLitre: {
        type: mongoose.Types.Decimal128,
        required: [true, 'Please specify the price per litre']
    },
    totalAmount: {
        type: mongoose.Types.Decimal128
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

// Automatically calculate totalAmount before saving to avoid floating-point errors
milkSaleSchema.pre('save', function() {
    const qty = this.quantity;
    const price = parseFloat(this.pricePerLitre.toString());
    
    // Calculate and convert back to Decimal128
    const total = (qty * price).toFixed(2);
    this.totalAmount = mongoose.Types.Decimal128.fromString(total);
    
});

module.exports = mongoose.model('MilkSale', milkSaleSchema);

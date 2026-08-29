const mongoose = require('mongoose');

const milkProductionSchema = new mongoose.Schema({
    animal: {
        type: mongoose.Schema.ObjectId,
        ref: 'Animal',
        required: [true, 'Please specify the animal']
    },
    productionDate: {
        type: Date,
        required: [true, 'Please specify the production date'],
        default: Date.now
    },
    morningQuantity: {
        type: Number,
        default: 0,
        min: [0, 'Milk quantity cannot be negative']
    },
    eveningQuantity: {
        type: Number,
        default: 0,
        min: [0, 'Milk quantity cannot be negative']
    },
    totalQuantity: {
        type: Number,
        default: 0
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

// Prevent duplicate entries for the same animal on the same day
milkProductionSchema.index({ animal: 1, productionDate: 1 }, { unique: true });

// Calculate total before saving
milkProductionSchema.pre('save', function() {
    this.totalQuantity = this.morningQuantity + this.eveningQuantity;
});

module.exports = mongoose.model('MilkProduction', milkProductionSchema);

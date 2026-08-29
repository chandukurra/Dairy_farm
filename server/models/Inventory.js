const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: [true, 'Please add an item name'],
        trim: true,
        unique: true
    },
    category: {
        type: String,
        enum: ['COW_FEED', 'BUFFALO_FEED', 'FODDER', 'HAY', 'MEDICINE', 'VACCINE', 'EQUIPMENT', 'OTHER'],
        required: true
    },
    unit: {
        type: String,
        enum: ['KG', 'LITRE', 'PIECE', 'BOTTLE', 'BUNDLE'],
        required: true
    },
    currentQuantity: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative without authorization']
    },
    minimumStock: {
        type: Number,
        default: 10
    },
    price: {
        type: mongoose.Types.Decimal128, // Default or average price per unit
        default: 0.00
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    }
}, { timestamps: true });

// Virtual field to easily check if stock is low
inventorySchema.virtual('isLowStock').get(function() {
    return this.currentQuantity <= this.minimumStock;
});

// Ensure virtuals are included when converting to JSON
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
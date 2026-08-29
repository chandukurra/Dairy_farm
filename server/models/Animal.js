const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
    animalCode: {
        type: String,
        required: [true, 'Please provide an animal code (e.g., C001)'],
        unique: true,
        trim: true
    },
    name: { type: String, trim: true },
    species: {
        type: String,
        required: true,
        enum: ['COW', 'BUFFALO']
    },
    breed: { type: String },
    gender: {
        type: String,
        required: true,
        enum: ['MALE', 'FEMALE']
    },
    dateOfBirth: { type: Date },
    purchaseDate: { type: Date },
    purchaseCost: { type: mongoose.Types.Decimal128 },
    weight: { type: Number }, // in kg
    healthStatus: {
        type: String,
        enum: ['HEALTHY', 'SICK', 'UNDER_TREATMENT', 'PREGNANT'],
        default: 'HEALTHY'
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'SOLD', 'DEAD', 'TRANSFERRED', 'INACTIVE'],
        default: 'ACTIVE'
    },
    image: {
        url: { type: String },
        publicId: { type: String }
    },
    notes: { type: String },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Animal', animalSchema);
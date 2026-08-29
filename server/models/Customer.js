const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Please add a customer name'],
        trim: true
    },
    email: { 
        type: String, 
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    phone: { 
        type: String, 
        required: [true, 'Please add a phone number'] 
    },
    address: { 
        type: String,
        required: [true, 'Please add an address']
    },
    customerType: {
        type: String,
        enum: ['DAILY_CUSTOMER', 'SHOP', 'HOTEL', 'RESTAURANT', 'OTHER'],
        default: 'DAILY_CUSTOMER'
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
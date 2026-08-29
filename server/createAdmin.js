const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');

// Load .env from the server folder
require('dotenv').config({
    path: path.join(__dirname, '.env')
});

const createAdmin = async () => {
    try {

        // Check whether MongoDB URI exists
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not loaded from .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);

        console.log('MongoDB connected');

        // Check if admin already exists
        const adminExists = await User.findOne({
            email: 'admin@kurradairy.com'
        });

        if (adminExists) {
            console.log('Admin already exists');
            await mongoose.connection.close();
            process.exit(0);
        }

        // Create admin
        const admin = await User.create({
            name: 'Kurra Dairy Admin',
            email: 'admin@kurradairy.com',
            phone: '9999999999',
            password: 'admin123',
            address: 'Kurra Dairy',
            role: 'ADMIN',
            status: 'ACTIVE'
        });

        console.log('');
        console.log('==============================');
        console.log('ADMIN CREATED SUCCESSFULLY');
        console.log('==============================');
        console.log('Email:', admin.email);
        console.log('Password: admin123');
        console.log('Role:', admin.role);
        console.log('==============================');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {

        console.error('Error:', error.message);

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        process.exit(1);
    }
};

createAdmin();
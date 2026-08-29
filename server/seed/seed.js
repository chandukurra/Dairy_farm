require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Animal = require('../models/Animal');
const Customer = require('../models/Customer');

mongoose.connect(process.env.MONGODB_URI);

const importData = async () => {
    try {
        console.log('Clearing database...');
        await User.deleteMany();
        await Animal.deleteMany();
        await Customer.deleteMany();

        console.log('Creating Admin & Manager...');
        const admin = await User.create({
            name: 'Farm Admin',
            email: 'admin@kurrasdairy.com',
            phone: '9999999999',
            password: 'password123', // Will be hashed by pre-save hook
            address: 'Main Farm House',
            role: 'ADMIN'
        });

        await User.create({
            name: 'Operations Manager',
            email: 'manager@kurrasdairy.com',
            phone: '8888888888',
            password: 'password123',
            address: 'Staff Quarters',
            role: 'FARM_MANAGER'
        });

        console.log('Creating 70 Female Cows...');
        const animals = [];
        for (let i = 1; i <= 70; i++) {
            animals.push({
                animalCode: `C${i.toString().padStart(3, '0')}`,
                species: 'COW',
                gender: 'FEMALE',
                createdBy: admin._id
            });
        }

        console.log('Creating 20 Female Buffaloes...');
        for (let i = 1; i <= 20; i++) {
            animals.push({
                animalCode: `B${i.toString().padStart(3, '0')}`,
                species: 'BUFFALO',
                gender: 'FEMALE',
                createdBy: admin._id
            });
        }

        console.log('Creating 10 Male Animals...');
        for (let i = 1; i <= 10; i++) {
            animals.push({
                animalCode: `M${i.toString().padStart(3, '0')}`,
                species: 'COW', // Defaulting males to cow species
                gender: 'MALE',
                createdBy: admin._id
            });
        }

        await Animal.insertMany(animals);

        console.log('Data Imported Successfully!');
        console.log('Total Animals Seeded:', animals.length);
        process.exit();
    } catch (error) {
        console.error('Error with data import', error);
        process.exit(1);
    }
};

if (process.argv[2] === '-i') {
    importData();
} else {
    console.log('Please pass -i flag to run the seed (e.g., node seed.js -i)');
    process.exit();
}
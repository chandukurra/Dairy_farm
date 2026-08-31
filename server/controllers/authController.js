const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { notifyRoles } = require('../services/notificationService');

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password, address } = req.body;

        // Force role to CUSTOMER regardless of what the client sends.
        // Admins/Managers must be created through a protected admin route later.
        const user = await User.create({
            name,
            email,
            phone,
            password,
            address,
            role: 'CUSTOMER' 
        });

        const token = generateToken(user._id);

        await notifyRoles(['ADMIN'], {
            title: 'New customer registration',
            message: `${user.name} created a customer account.`,
            type: 'INFO',
            link: '/admin/customers'
        });

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (error) {
        next(error); // Passes to centralized error handler from Phase 1
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        // Add '+password' because it is hidden by default in the schema
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ success: false, message: 'Account has been deactivated' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

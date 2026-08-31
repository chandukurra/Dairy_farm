const express = require('express');
const User = require('../models/User');
const { notifyUser } = require('../services/notificationService');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

// GET all users
router.get('/', async (req, res, next) => {
    try {
        const query = req.query.role ? { role: req.query.role } : {};
        const users = await User.find(query).select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (error) { next(error); }
});

// POST new user (Manager)
router.post('/', async (req, res, next) => {
    try {
        const { name, email, phone, password, address } = req.body;
        const user = await User.create({
            name,
            email,
            phone,
            password,
            address,
            role: 'FARM_MANAGER',
            status: 'ACTIVE'
        });
        await notifyUser(user._id, {
            title: 'Farm manager account ready',
            message: 'Your account has been created. You can now manage daily farm operations.',
            type: 'SUCCESS',
            link: '/manager/dashboard'
        });
        res.status(201).json({ success: true, data: user });
    } catch (error) { next(error); }
});

// PUT update user status
router.put('/:id/status', async (req, res, next) => {
    try {
        if (!['ACTIVE', 'INACTIVE'].includes(req.body.status)) {
            return res.status(400).json({ success: false, message: 'Status must be ACTIVE or INACTIVE' });
        }
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot change your own account status' });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (error) { next(error); }
});

module.exports = router;

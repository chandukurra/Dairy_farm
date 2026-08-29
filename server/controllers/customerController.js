const User = require('../models/User'); // ✨ We are now looking at the User model!

// @desc    Get all customers for the dropdown
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res, next) => {
    try {
        // Find all users who are registered with the role of 'CUSTOMER'
        const customers = await User.find({ role: 'CUSTOMER' }).select('name email phone address status');
        
        res.status(200).json({ success: true, count: customers.length, data: customers });
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

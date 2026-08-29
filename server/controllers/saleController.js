const Sale = require('../models/Sale'); // (Ensure this matches your actual Sale model filename)
const User = require('../models/User');
const Verification = require('../models/Verification');

// @desc    Get all milk sales
// @route   GET /api/milk-sales
// @access  Private
exports.getSales = async (req, res) => {
    try {
        let query = {};
        
        // 🔒 SECURITY: If a customer logs in, they can ONLY see their own purchases
        if (req.user.role === 'CUSTOMER') {
            query.customer = req.user.id;
        }

        const sales = await Sale.find(query)
            .populate('customer', 'name email phone') // Fetch customer details
            .populate('recordedBy', 'name') // Fetch admin/manager details
            .sort({ saleDate: -1, createdAt: -1 });

        res.status(200).json({ success: true, count: sales.length, data: sales });
    } catch (error) {
        console.error("🚨 Get Sales Error:", error.message);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

// @desc    Record a new milk sale
// @route   POST /api/milk-sales
// @access  Private (Admin, Farm Manager)
exports.createSale = async (req, res) => {
    try {
        const { customer, saleDate, quantity, pricePerLitre } = req.body;

        // 1. ✨ THE FIX: Verify the customer actually exists in the User database
        const validCustomer = await User.findOne({ _id: customer, role: 'CUSTOMER', status: 'ACTIVE' });
        
        if (!validCustomer) {
            return res.status(400).json({ success: false, message: 'Invalid or inactive customer' });
        }

        // 2. Auto-calculate total server-side (Prevents frontend manipulation)
        const numericQuantity = Number(quantity);
        const numericPrice = Number(pricePerLitre);
        if (!Number.isFinite(numericQuantity) || numericQuantity <= 0 || !Number.isFinite(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ success: false, message: 'Quantity and price must be greater than zero' });
        }
        const totalAmount = Number((numericQuantity * numericPrice).toFixed(2));

        // 3. Create the sale record
        const sale = await Sale.create({
            customer,
            saleDate: saleDate || Date.now(),
            quantity: numericQuantity,
            pricePerLitre: numericPrice,
            totalAmount,
            recordedBy: req.user.id,
            status: 'PENDING' // Requires admin verification
        });

        // 4. Automatically generate a Verification Ticket
        await Verification.create({
            recordType: 'MILK_SALE',
            recordId: sale._id,
            submittedBy: req.user.id,
            status: 'PENDING'
        });

        res.status(201).json({ success: true, data: sale });
    } catch (error) {
        console.error("🚨 Sale Creation Error:", error.message);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

// @desc    Get a single sale by ID
// @route   GET /api/milk-sales/:id
// @access  Private
exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('recordedBy', 'name');

        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale record not found' });
        }

        // 🔒 SECURITY: Customers can only view their own specific sale record
        if (req.user.role === 'CUSTOMER' && sale.customer._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this record' });
        }

        res.status(200).json({ success: true, data: sale });
    } catch (error) {
        console.error("🚨 Get Single Sale Error:", error.message);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

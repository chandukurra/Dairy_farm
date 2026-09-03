const Payment = require('../models/Payment');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Verification = require('../models/Verification');
const { notifyRoles, notifyUser } = require('../services/notificationService');

// @desc    Record a payment
// @route   POST /api/payments
// @access  Private (Admin, Farm Manager, Customer)
exports.createPayment = async (req, res, next) => {
    try {
        const { sale, amount, referenceNumber } = req.body;
        const customer = req.user.role === 'CUSTOMER' ? req.user.id : req.body.customer;
        if (req.user.role === 'CUSTOMER' && !referenceNumber?.trim()) {
            return res.status(400).json({ success: false, message: 'Please provide your payment reference number' });
        }
        if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
        }
        const validCustomer = await User.exists({ _id: customer, role: 'CUSTOMER', status: 'ACTIVE' });
        if (!validCustomer) {
            return res.status(400).json({ success: false, message: 'Please select an active customer' });
        }
        if (sale) {
            const validSale = await Sale.exists({ _id: sale, customer });
            if (!validSale) return res.status(400).json({ success: false, message: 'Sale does not belong to this customer' });
        }
        const payment = await Payment.create({ ...req.body, customer, amount: Number(amount), createdBy: req.user.id, paymentStatus: 'PENDING' });

        // Generate Verification Ticket so it appears in the Central Audit Center
        await Verification.create({
            recordType: 'PAYMENT',
            recordId: payment._id,
            submittedBy: req.user.id,
            status: 'PENDING'
        });

        await notifyRoles(['ADMIN', 'FARM_MANAGER'], { title: 'Payment submitted', message: `A payment of ₹${payment.amount} is waiting for review.`, type: 'ACTION', link: '/admin/payments' });
        
        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        next(error);
    }
};

// @desc    Get payments (Customers can only see their own)
// @route   GET /api/payments
// @access  Private (Admin, Farm Manager, Customer)
exports.getPayments = async (req, res, next) => {
    try {
        let query = {};
        
        // If user is a customer, lock the query to their ID
        if (req.user.role === 'CUSTOMER') {
            query.customer = req.user.id; 
        }

        const payments = await Payment.find(query)
            .populate('customer', 'name')
            .sort({ paymentDate: -1 });

        const formattedPayments = payments.map(payment => ({
            ...payment._doc,
            amount: parseFloat(payment.amount.toString())
        }));

        res.status(200).json({ success: true, count: formattedPayments.length, data: formattedPayments });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify or Reject payment
// @route   PUT /api/payments/:id/verify
// @access  Private (Admin, Farm Manager)
exports.verifyPayment = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['VERIFIED', 'REJECTED'].includes(status)) return res.status(400).json({ success: false, message: 'Status must be VERIFIED or REJECTED' });
        const payment = await Payment.findOneAndUpdate({ _id: req.params.id, paymentStatus: 'PENDING' }, { paymentStatus: status }, { new: true, runValidators: true });
        if (!payment) return res.status(404).json({ success: false, message: 'Pending payment not found' });

        // Also update any matching Verification ticket
        await Verification.findOneAndUpdate(
            { recordId: payment._id, recordType: 'PAYMENT', status: 'PENDING' },
            { status: status === 'VERIFIED' ? 'APPROVED' : 'REJECTED', checkedBy: req.user.id, checkedAt: new Date() }
        );

        await notifyUser(payment.customer, { title: `Payment ${status.toLowerCase()}`, message: `Your payment of ₹${payment.amount} was ${status.toLowerCase()}.`, type: status === 'VERIFIED' ? 'SUCCESS' : 'WARNING', link: '/customer/payments' });
        res.json({ success: true, data: payment });
    } catch (error) { next(error); }
};

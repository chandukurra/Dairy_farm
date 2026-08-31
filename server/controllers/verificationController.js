const Verification = require('../models/Verification');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const MilkProduction = require('../models/MilkProduction');
const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');
const { notifyUser } = require('../services/notificationService');

exports.getPendingVerifications = async (req, res, next) => {
    try {
        const verifications = await Verification.find({ status: 'PENDING' })
            .populate('submittedBy', 'name email')
            .sort({ submittedAt: -1 });
        res.status(200).json({ success: true, count: verifications.length, data: verifications });
    } catch (error) {
        next(error);
    }
};

exports.updateVerificationStatus = async (req, res, next) => {
    try {
        const { status, remarks } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
        }

        const verification = await Verification.findOneAndUpdate(
            { _id: req.params.id, status: 'PENDING' },
            { status, remarks, checkedBy: req.user.id, checkedAt: new Date() },
            { new: true, runValidators: true }
        );
        if (!verification) {
            return res.status(404).json({ success: false, message: 'Pending verification ticket not found' });
        }

        if (verification.recordType === 'EXPENSE') {
            await Expense.findByIdAndUpdate(verification.recordId, { status: status === 'APPROVED' ? 'SETTLED' : 'REJECTED' });
        } else if (verification.recordType === 'INCOME') {
            await Income.findByIdAndUpdate(verification.recordId, { verificationStatus: status === 'APPROVED' ? 'VERIFIED' : 'REJECTED' });
        } else if (verification.recordType === 'MILK_PRODUCTION') {
            await MilkProduction.findByIdAndUpdate(verification.recordId, { verificationStatus: status === 'APPROVED' ? 'VERIFIED' : 'REJECTED' });
        } else if (verification.recordType === 'MILK_SALE') {
            await Sale.findByIdAndUpdate(verification.recordId, { status: status === 'APPROVED' ? 'VERIFIED' : 'REJECTED' });
        } else if (verification.recordType === 'INVENTORY') {
            const transaction = await InventoryTransaction.findByIdAndUpdate(
                verification.recordId,
                { verificationStatus: status === 'APPROVED' ? 'VERIFIED' : 'REJECTED' },
                { new: true }
            );
            if (!transaction) throw new Error('Inventory transaction not found');
            if (status === 'APPROVED') {
                const inventoryQuery = transaction.quantity < 0
                    ? { _id: transaction.item, currentQuantity: { $gte: Math.abs(transaction.quantity) } }
                    : { _id: transaction.item };
                const item = await Inventory.findOneAndUpdate(
                    inventoryQuery,
                    { $inc: { currentQuantity: transaction.quantity } },
                    { new: true, runValidators: true }
                );
                if (!item) throw new Error('Inventory item not found or stock is no longer sufficient');
            }
        }

        await notifyUser(verification.submittedBy, {
            title: `${verification.recordType.replace(/_/g, ' ')} ${status.toLowerCase()}`,
            message: status === 'APPROVED' ? 'Your submitted record has been approved.' : 'Your submitted record was rejected. Please review the remarks if provided.',
            type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
            link: verification.recordType === 'MILK_SALE' ? '/manager/sales' : '/manager/dashboard'
        });

        res.status(200).json({ success: true, data: verification });
    } catch (error) {
        next(error);
    }
};

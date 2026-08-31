const Income = require('../models/Income');
const Verification = require('../models/Verification');

// @desc    Create other income record
// @route   POST /api/income
// @access  Private (Admin, Farm Manager)
exports.createIncome = async (req, res, next) => {
    try {
        req.body.enteredBy = req.user.id;
        
        const income = await Income.create(req.body);

        // Auto-create Verification Ticket
        await Verification.create({
            recordType: 'INCOME',
            recordId: income._id,
            submittedBy: req.user.id,
            status: 'PENDING'
        });

        res.status(201).json({ success: true, data: income });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all other income
// @route   GET /api/income
// @access  Private (Admin, Farm Manager)
exports.getIncome = async (req, res, next) => {
    try {
        const incomeRecords = await Income.find()
            .populate('enteredBy', 'name')
            .sort({ incomeDate: -1 });

        const formattedIncome = incomeRecords.map(inc => ({
            ...inc._doc,
            amount: parseFloat(inc.amount.toString())
        }));

        res.status(200).json({ success: true, count: formattedIncome.length, data: formattedIncome });
    } catch (error) {
        next(error);
    }
};

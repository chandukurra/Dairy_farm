const Expense = require('../models/Expense');
const Verification = require('../models/Verification');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private (Admin, Farm Manager)
exports.getExpenses = async (req, res) => {
    try {
        // Fetch all expenses, populate the user who entered it, and sort by newest
        const expenses = await Expense.find()
            .populate('enteredBy', 'name') 
            .sort({ expenseDate: -1 });

        res.status(200).json({ success: true, count: expenses.length, data: expenses });
    } catch (error) {
        console.error("🚨 GET EXPENSES ERROR:", error.message);
        res.status(500).json({ success: false, message: error.message || 'Server Error fetching expenses' });
    }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private (Admin, Farm Manager)
exports.createExpense = async (req, res) => {
    try {
        // 1. Create the expense in the database
        const expense = await Expense.create({
            ...req.body,
            enteredBy: req.user.id // <-- Perfectly matching your Expense Model!
        });

        // 2. Automatically generate the Verification Ticket!
        await Verification.create({
            recordType: 'EXPENSE',
            recordId: expense._id,
            submittedBy: req.user.id,
            status: 'PENDING'
        });

        res.status(201).json({ success: true, data: expense });
    } catch (error) {
        console.error("🚨 EXPENSE CREATION ERROR:", error.message);
        res.status(500).json({ success: false, message: error.message || 'Server Error creating expense' });
    }
};

const Sale = require('../models/Sale');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

// @desc    Get Farm Financial Summary (Profit & Loss)
// @route   GET /api/reports/profit
// @access  Private (Admin Only)
exports.getProfitLoss = async (req, res, next) => {
    try {
        // 1. Calculate Total Verified Milk Sales
        const milkSales = await Sale.aggregate([
            { $match: { status: 'VERIFIED' } },
            { $group: { _id: null, totalMilkRevenue: { $sum: "$totalAmount" } } }
        ]);
        const milkRevenue = milkSales.length > 0 ? parseFloat(milkSales[0].totalMilkRevenue.toString()) : 0;

        // 2. Calculate Total Verified Other Income
        const otherIncome = await Income.aggregate([
            { $match: { verificationStatus: 'VERIFIED' } },
            { $group: { _id: null, totalOtherIncome: { $sum: "$amount" } } }
        ]);
        const additionalIncome = otherIncome.length > 0 ? parseFloat(otherIncome[0].totalOtherIncome.toString()) : 0;

        // 3. Calculate Total Verified Expenses
        const expenses = await Expense.aggregate([
            { $match: { status: 'SETTLED' } },
            { $group: { _id: null, totalExpense: { $sum: "$amount" } } }
        ]);
        const totalExpenses = expenses.length > 0 ? parseFloat(expenses[0].totalExpense.toString()) : 0;

        // 4. Calculate Net Profit
        const totalIncome = milkRevenue + additionalIncome;
        const netProfit = totalIncome - totalExpenses;

        res.status(200).json({
            success: true,
            data: {
                totalIncome,
                breakdown: { milkRevenue, additionalIncome },
                totalExpenses,
                netProfit
            }
        });
    } catch (error) {
        next(error);
    }
};

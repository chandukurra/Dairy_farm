const MilkProduction = require('../models/MilkProduction');

// @desc    Get Milk Production Trend (Last 7 Days)
// @route   GET /api/charts/milk-trend
// @access  Private (Admin, Farm Manager)
exports.getMilkTrend = async (req, res, next) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const trend = await MilkProduction.aggregate([
            { $match: { productionDate: { $gte: sevenDaysAgo } } },
            { 
                $group: { 
                    // Group by year-month-day string
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$productionDate" } },
                    totalMilk: { $sum: "$totalQuantity" }
                } 
            },
            { $sort: { _id: 1 } } // Sort chronologically
        ]);

        res.status(200).json({ success: true, data: trend });
    } catch (error) {
        next(error);
    }
};
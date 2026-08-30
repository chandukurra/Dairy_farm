const Animal = require('../models/Animal');
const MilkProduction = require('../models/MilkProduction');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Inventory = require('../models/Inventory');
const Verification = require('../models/Verification');
const User = require('../models/User');

// Date Helper Functions
const getStartOfDay = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

const getStartOfMonth = () => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
};

// @desc    Get Admin Dashboard KPIs
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res, next) => {
    try {
        const startOfDay = getStartOfDay();
        const startOfMonth = getStartOfMonth();

        // 1. Animal Statistics
        const animals = await Animal.aggregate([
            { $match: { status: 'ACTIVE' } },
            { $group: {
                _id: null,
                total: { $sum: 1 },
                cows: { $sum: { $cond: [{ $eq: ["$species", "COW"] }, { $cond: [{ $eq: ["$gender", "FEMALE"] }, 1, 0] }, 0] } },
                buffaloes: { $sum: { $cond: [{ $eq: ["$species", "BUFFALO"] }, { $cond: [{ $eq: ["$gender", "FEMALE"] }, 1, 0] }, 0] } },
                males: { $sum: { $cond: [{ $eq: ["$gender", "MALE"] }, 1, 0] } }
            }}
        ]);
        const animalStats = animals[0] || { total: 0, cows: 0, buffaloes: 0, males: 0 };

        // 2. Milk Production (Today & Month)
        const milkToday = await MilkProduction.aggregate([
            { $match: { productionDate: { $gte: startOfDay } } },
            { $group: { _id: null, total: { $sum: "$totalQuantity" } } }
        ]);
        
        const milkMonth = await MilkProduction.aggregate([
            { $match: { productionDate: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$totalQuantity" } } }
        ]);
        const milkInsights = await getMilkInsights();

        // 3. Financials - Sales (Today & Month) - Only Verified
        const salesToday = await Sale.aggregate([
            { $match: { saleDate: { $gte: startOfDay }, status: 'VERIFIED' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const salesMonth = await Sale.aggregate([
            { $match: { saleDate: { $gte: startOfMonth }, status: 'VERIFIED' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        // 4. Financials - Expenses (Today & Month) - Only Verified
        const expToday = await Expense.aggregate([
            { $match: { expenseDate: { $gte: startOfDay }, status: 'SETTLED' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const expMonth = await Expense.aggregate([
            { $match: { expenseDate: { $gte: startOfMonth }, status: 'SETTLED' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // 5. Operations & Alerts
        const totalCustomers = await User.countDocuments({ role: 'CUSTOMER', status: 'ACTIVE' });
        const pendingVerifications = await Verification.countDocuments({ status: 'PENDING' });
        
        // Find Low Stock Items directly via DB calculation
        const lowStockItems = await Inventory.aggregate([
            { $match: { status: 'ACTIVE', $expr: { $lte: ["$currentQuantity", "$minimumStock"] } } },
            { $count: "count" }
        ]);

        res.status(200).json({
            success: true,
            data: {
                animals: {
                    total: animalStats.total,
                    cows: animalStats.cows,
                    buffaloes: animalStats.buffaloes,
                    males: animalStats.males
                },
                milk: {
                    today: milkToday[0]?.total || 0,
                    month: milkMonth[0]?.total || 0,
                    morning: milkInsights.morning,
                    evening: milkInsights.evening,
                    history: milkInsights.history
                },
                finance: {
                    salesToday: salesToday[0]?.total ? parseFloat(salesToday[0].total.toString()) : 0,
                    salesMonth: salesMonth[0]?.total ? parseFloat(salesMonth[0].total.toString()) : 0,
                    expensesToday: expToday[0]?.total ? parseFloat(expToday[0].total.toString()) : 0,
                    expensesMonth: expMonth[0]?.total ? parseFloat(expMonth[0].total.toString()) : 0,
                },
                operations: {
                    totalCustomers,
                    pendingVerifications,
                    lowStockCount: lowStockItems[0]?.count || 0
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Manager Dashboard (Limited KPIs)
// @route   GET /api/dashboard/manager
// @access  Private (Farm Manager)
exports.getManagerDashboard = async (req, res, next) => {
    try {
        const startOfDay = getStartOfDay();
        const startOfMonth = getStartOfMonth();

        // Managers only need to see daily operational metrics, not monthly financial overviews
        const milkToday = await MilkProduction.aggregate([
            { $match: { productionDate: { $gte: startOfDay } } },
            { $group: { _id: null, total: { $sum: "$totalQuantity" } } }
        ]);
        const milkInsights = await getMilkInsights();

        const [milkMonth, totalAnimals] = await Promise.all([
            MilkProduction.aggregate([
                { $match: { productionDate: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$totalQuantity' } } }
            ]),
            Animal.countDocuments({ status: 'ACTIVE' })
        ]);

        const salesToday = await Sale.aggregate([
            { $match: { saleDate: { $gte: startOfDay } } }, // Can see pending sales too
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const pendingChecks = await Verification.countDocuments({ status: 'PENDING' });

        res.status(200).json({
            success: true,
            data: {
                totalAnimals,
                milkToday: milkToday[0]?.total || 0,
                milk: { ...milkInsights, month: milkMonth[0]?.total || 0 },
                salesToday: salesToday[0]?.total ? parseFloat(salesToday[0].total.toString()) : 0,
                pendingChecks
            }
        });
    } catch (error) {
        next(error);
    }
};

const getStartOfLastSevenDays = () => {
    const d = getStartOfDay();
    d.setDate(d.getDate() - 6);
    return d;
};

const getMilkInsights = async () => {
    const startOfDay = getStartOfDay();
    const startOfLastSevenDays = getStartOfLastSevenDays();
    const [today, history] = await Promise.all([
        MilkProduction.aggregate([
            { $match: { productionDate: { $gte: startOfDay } } },
            { $group: { _id: null, total: { $sum: '$totalQuantity' }, morning: { $sum: '$morningQuantity' }, evening: { $sum: '$eveningQuantity' } } }
        ]),
        MilkProduction.aggregate([
            { $match: { productionDate: { $gte: startOfLastSevenDays } } },
            { $group: { _id: { $dateToString: { format: '%d %b', date: '$productionDate' } }, total: { $sum: '$totalQuantity' } } },
            { $sort: { _id: 1 } }
        ])
    ]);
    return {
        today: today[0]?.total || 0,
        morning: today[0]?.morning || 0,
        evening: today[0]?.evening || 0,
        history: history.map((item) => ({ label: item._id, total: item.total }))
    };
};

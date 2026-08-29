const MilkProduction = require('../models/MilkProduction'); 
const Verification = require('../models/Verification');

// @desc    Get all milk production logs
exports.getMilkLogs = async (req, res,next) => {
    try {
        const logs = await MilkProduction.find()
            .populate('animal', 'animalCode species name')
            .populate('enteredBy', 'name')
            .sort({ productionDate: -1, createdAt: -1 });

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        // 🔥 Bulletproof: Sending the error directly back instead of using 'next'
        next(error);
    }
};

// @desc    Record daily milk production
exports.createMilkLog = async (req, res,next) => {
    try {
        // 1. Create the milk log
        const milkLog = await MilkProduction.create({
            ...req.body,
            enteredBy: req.user.id
        });

        // 2. Generate Verification Ticket
        await Verification.create({
            recordType: 'MILK_PRODUCTION',
            recordId: milkLog._id,
            submittedBy: req.user.id,
            status: 'PENDING'
        });

        res.status(201).json({ success: true, data: milkLog });
    } catch (error) {
        console.error("🚨 DATABASE ERROR:", error.message);
        // 🔥 Bulletproof error response
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

// @desc    Get milk logs for a specific animal
exports.getAnimalMilkLogs = async (req, res) => {
    try {
        const logs = await MilkProduction.find({ animal: req.params.animalId })
            .sort({ productionDate: -1, createdAt: -1 });

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

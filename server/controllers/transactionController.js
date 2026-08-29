const InventoryTransaction = require('../models/InventoryTransaction');
const Inventory = require('../models/Inventory');
const Verification = require('../models/Verification');

// @desc    Create a stock transaction (Purchase, Usage, Adjustment)
// @route   POST /api/inventory-transactions
// @access  Private (Admin, Farm Manager)
exports.createTransaction = async (req, res, next) => {
    try {
        const { item: itemId, transactionType, quantity, description, date } = req.body;
        const numericQuantity = Number(quantity);
        if (!['PURCHASE', 'USAGE', 'ADJUSTMENT'].includes(transactionType) || !Number.isFinite(numericQuantity) || numericQuantity === 0) {
            return res.status(400).json({ success: false, message: 'Provide a valid transaction type and non-zero quantity' });
        }

        // 1. Validate Item exists
        const inventoryItem = await Inventory.findById(itemId);
        if (!inventoryItem) {
            return res.status(404).json({ success: false, message: 'Inventory item not found' });
        }

        // 2. Validate Usage Logic (Prevent negative stock prematurely)
        // Note: quantity should be submitted as a positive number. The type determines addition/subtraction.
        const mathQuantity = transactionType === 'PURCHASE'
            ? Math.abs(numericQuantity)
            : transactionType === 'USAGE'
                ? -Math.abs(numericQuantity)
                : numericQuantity;

        if (transactionType === 'USAGE' && (inventoryItem.currentQuantity + mathQuantity < 0)) {
            // Admins can bypass this rule if needed, but managers cannot.
            if (req.user.role !== 'ADMIN') {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock. Current quantity is ${inventoryItem.currentQuantity}` 
                });
            }
        }

        // 3. Create the Transaction Ledger Entry
        const transaction = await InventoryTransaction.create({
            item: itemId,
            transactionType,
            quantity: mathQuantity, // Store the signed quantity for easier aggregation later
            description,
            date: date || Date.now(),
            enteredBy: req.user.id
        });

        // 4. Auto-create Verification Ticket
        await Verification.create({
            recordType: 'INVENTORY',
            recordId: transaction._id,
            submittedBy: req.user.id,
            status: 'PENDING'
        });

        res.status(201).json({ success: true, data: transaction });
    } catch (error) {
        next(error);
    }
};

// @desc    Get inventory transactions
// @route   GET /api/inventory-transactions
// @access  Private (Admin, Farm Manager)
exports.getTransactions = async (req, res, next) => {
    try {
        const { item } = req.query;
        let query = {};
        
        if (item) query.item = item;

        const transactions = await InventoryTransaction.find(query)
            .populate('item', 'itemName category unit')
            .populate('enteredBy', 'name')
            .sort({ date: -1 });

        res.status(200).json({ success: true, count: transactions.length, data: transactions });
    } catch (error) {
        next(error);
    }
};

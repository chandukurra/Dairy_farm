const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc    Create a new inventory item type (Catalog entry)
// @route   POST /api/inventory
// @access  Private (Admin, Farm Manager)
exports.createItem = async (req, res, next) => {
    try {
        const item = await Inventory.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Item name already exists' });
        }
        next(error);
    }
};

// @desc    Get all inventory items (with low stock filtering)
// @route   GET /api/inventory
// @access  Private (Admin, Farm Manager)
exports.getInventory = async (req, res, next) => {
    try {
        const { category, lowStock } = req.query;
        let query = {};

        if (category) query.category = category;

        let items = await Inventory.find(query).sort({ itemName: 1 });

        // Format Decimal128 and apply lowStock filter if requested
        let formattedItems = items.map(item => {
            const formatted = {
                ...item._doc,
                // Check if price exists before formatting to prevent crashes
                price: item.price ? parseFloat(item.price.toString()) : 0,
                // Safely grab the virtual field
                isLowStock: item.isLowStock 
            };
            return formatted;
        });

        if (lowStock === 'true') {
            formattedItems = formattedItems.filter(item => item.isLowStock);
        }

        res.status(200).json({ success: true, count: formattedItems.length, data: formattedItems });
    } catch (error) {
        next(error);
    }
};

// @desc    Add stock to an existing inventory item
// @route   PUT /api/inventory/:id/add-stock
// @access  Private (Admin, Farm Manager)
exports.addStock = async (req, res, next) => {
    try {
        // Find the number passed from the frontend
        const addedPieces = Number(req.body.quantity || req.body.pieces || req.body.currentQuantity);

        if (!addedPieces || addedPieces <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid number of items to add' 
            });
        }

        // PERFECT MATCH: Using your exact schema name 'currentQuantity'
        const item = await Inventory.findByIdAndUpdate(
            req.params.id,
            { $inc: { currentQuantity: addedPieces } }, 
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({ success: false, message: 'Inventory item not found' });
        }

        // Create transaction record for audit traceability
        await InventoryTransaction.create({
            item: item._id,
            transactionType: 'PURCHASE',
            quantity: addedPieces,
            description: req.body.description || 'Stock addition via inventory catalog',
            date: Date.now(),
            enteredBy: req.user.id,
            verificationStatus: 'VERIFIED'
        });

        res.status(200).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};
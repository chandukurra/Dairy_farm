const Animal = require('../models/Animal');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper to upload stream to Cloudinary
const streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            { folder: 'kurras_dairy/animals' },
            (error, result) => {
                if (result) { resolve(result); }
                else { reject(error); }
            }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

// @desc    Get all animals (with optional filtering & pagination)
// @route   GET /api/animals
// @access  Private (Admin, Farm Manager)
exports.getAnimals = async (req, res, next) => {
    try {
        const { species, status, gender } = req.query;
        let query = {};

        if (species) query.species = species;
        if (status) query.status = status;
        if (gender) query.gender = gender;

        const animals = await Animal.find(query).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: animals.length, data: animals });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single animal
// @route   GET /api/animals/:id
// @access  Private (Admin, Farm Manager)
exports.getAnimal = async (req, res, next) => {
    try {
        const animal = await Animal.findById(req.params.id);
        if (!animal) return res.status(404).json({ success: false, message: 'Animal not found' });
        
        res.status(200).json({ success: true, data: animal });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new animal
// @route   POST /api/animals
// @access  Private (Admin, Farm Manager)
exports.createAnimal = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.createdBy = req.user.id;

        // Handle Image Upload if file exists
        if (req.file) {
            const result = await streamUpload(req);
            req.body.image = { url: result.secure_url, publicId: result.public_id };
        }

        const animal = await Animal.create(req.body);
        res.status(201).json({ success: true, data: animal });
    } catch (error) {
        // Catch duplicate animal code error
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Animal Code already exists' });
        }
        next(error);
    }
};

// @desc    Update animal
// @route   PUT /api/animals/:id
// @access  Private (Admin, Farm Manager)
exports.updateAnimal = async (req, res, next) => {
    try {
        let animal = await Animal.findById(req.params.id);
        if (!animal) return res.status(404).json({ success: false, message: 'Animal not found' });

        // Handle Image Update
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (animal.image && animal.image.publicId) {
                await cloudinary.uploader.destroy(animal.image.publicId);
            }
            // Upload new image
            const result = await streamUpload(req);
            req.body.image = { url: result.secure_url, publicId: result.public_id };
        } else if (typeof req.body.image === 'string' || !req.body.image) {
            delete req.body.image;
        }

        animal = await Animal.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: animal });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete animal (We generally soft-delete by setting status, but providing full delete here)
// @route   DELETE /api/animals/:id
// @access  Private (Admin only)
exports.deleteAnimal = async (req, res, next) => {
    try {
        const animal = await Animal.findById(req.params.id);
        if (!animal) return res.status(404).json({ success: false, message: 'Animal not found' });

        // Delete image from Cloudinary
        if (animal.image && animal.image.publicId) {
            await cloudinary.uploader.destroy(animal.image.publicId);
        }

        await animal.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
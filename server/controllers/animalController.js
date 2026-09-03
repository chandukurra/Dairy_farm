const crypto = require('crypto');
const Animal = require('../models/Animal');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper to upload stream to Cloudinary (fallback for server-side uploads)
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

// @desc    Get Cloudinary signature for direct client-side upload
// @route   GET /api/animals/upload-signature
// @access  Private (Admin, Farm Manager)
exports.getUploadSignature = async (req, res, next) => {
    try {
        const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim().replace(/^["']|["']$/g, '');
        const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim().replace(/^["']|["']$/g, '');
        const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim().replace(/^["']|["']$/g, '');

        if (!cloudName || !apiKey || !apiSecret) {
            return res.status(500).json({
                success: false,
                message: 'Cloudinary credentials are not properly configured on server'
            });
        }

        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = 'kurras_dairy/animals';

        // String to sign must be exactly: folder=kurras_dairy/animals&timestamp=${timestamp}${CLOUDINARY_API_SECRET}
        // Do not include api_key, file, cloud_name, or undefined values
        const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

        res.status(200).json({
            success: true,
            data: {
                signature,
                timestamp,
                folder,
                apiKey,
                cloudName
            }
        });
    } catch (error) {
        next(error);
    }
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

        // Parse image if sent as stringified JSON
        if (typeof req.body.image === 'string') {
            try {
                req.body.image = JSON.parse(req.body.image);
            } catch (e) {
                if (req.body.image.startsWith('http')) {
                    req.body.image = { url: req.body.image };
                }
            }
        }

        // Handle Image Upload if file exists (server-side stream upload fallback)
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

        // Parse image if sent as stringified JSON
        if (typeof req.body.image === 'string') {
            try {
                req.body.image = JSON.parse(req.body.image);
            } catch (e) {
                if (req.body.image.startsWith('http')) {
                    req.body.image = { url: req.body.image };
                }
            }
        }

        // Handle Image Update
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (animal.image && animal.image.publicId) {
                try {
                    await cloudinary.uploader.destroy(animal.image.publicId);
                } catch (delErr) {
                    console.error('Failed to remove old Cloudinary image:', delErr.message);
                }
            }
            // Upload new image
            const result = await streamUpload(req);
            req.body.image = { url: result.secure_url, publicId: result.public_id };
        } else if (req.body.image && req.body.image.publicId && animal.image?.publicId && animal.image.publicId !== req.body.image.publicId) {
            // If image was replaced via client upload, remove old image
            try {
                await cloudinary.uploader.destroy(animal.image.publicId);
            } catch (delErr) {
                console.error('Failed to remove replaced Cloudinary image:', delErr.message);
            }
        } else if (req.body.image === undefined || req.body.image === null || req.body.image === '') {
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
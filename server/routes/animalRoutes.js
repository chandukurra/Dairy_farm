const express = require('express');
const {
    getAnimals,
    getAnimal,
    createAnimal,
    updateAnimal,
    deleteAnimal
} = require('../controllers/animalController');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Apply protection to all animal routes
router.use(protect);

router
    .route('/')
    .get(authorize('ADMIN', 'FARM_MANAGER'), getAnimals)
    .post(authorize('ADMIN', 'FARM_MANAGER'), upload.single('image'), createAnimal);

router
    .route('/:id')
    .get(authorize('ADMIN', 'FARM_MANAGER'), getAnimal)
    .put(authorize('ADMIN', 'FARM_MANAGER'), upload.single('image'), updateAnimal)
    .delete(authorize('ADMIN'), deleteAnimal); // Only Admin can hard delete

module.exports = router;
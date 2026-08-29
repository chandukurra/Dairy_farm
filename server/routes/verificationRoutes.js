const express = require('express');
const { 
    getPendingVerifications, 
    updateVerificationStatus 
} = require('../controllers/verificationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All verification routes require the user to be logged in and be an ADMIN
router.use(protect);
router.use(authorize('ADMIN'));

// Get all pending verifications
router
    .route('/')
    .get(getPendingVerifications);

// Update verification status (Notice the /verify added here!)
router
    .route('/:id/verify')
    .put(updateVerificationStatus);

module.exports = router;
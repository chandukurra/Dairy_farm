const express = require('express');
const { getUsers, createUser, updateUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.route('/')
    .get(getUsers)
    .post(createUser);

router.put('/:id/status', updateUserStatus);

module.exports = router;

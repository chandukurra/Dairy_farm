const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getDailyAttendance, markDailyAttendance, getMonthlyAttendance } = require('../controllers/attendanceController');
const router = express.Router();
router.use(protect, authorize('ADMIN'));
router.get('/', getDailyAttendance);
router.post('/', markDailyAttendance);
router.get('/monthly', getMonthlyAttendance);
module.exports = router;

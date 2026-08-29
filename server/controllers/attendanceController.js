const Attendance = require('../models/Attendance');
const User = require('../models/User');

const dayStart = (value) => {
    const date = value ? new Date(value) : new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

exports.getDailyAttendance = async (req, res, next) => {
    try {
        const date = dayStart(req.query.date);
        const [managers, records] = await Promise.all([
            User.find({ role: 'FARM_MANAGER', status: 'ACTIVE' }).select('name email phone'),
            Attendance.find({ date }).select('manager status')
        ]);
        const statuses = new Map(records.map((record) => [record.manager.toString(), record.status]));
        res.json({ success: true, data: managers.map((manager) => ({ ...manager.toObject(), status: statuses.get(manager._id.toString()) || 'ABSENT' })) });
    } catch (error) { next(error); }
};

exports.markDailyAttendance = async (req, res, next) => {
    try {
        const date = dayStart(req.body.date);
        const attendance = Array.isArray(req.body.attendance) ? req.body.attendance : [];
        const activeManagers = await User.find({ role: 'FARM_MANAGER', status: 'ACTIVE' }).select('_id');
        const allowed = new Set(activeManagers.map((manager) => manager._id.toString()));
        await Promise.all(attendance.filter((item) => allowed.has(item.manager) && ['PRESENT', 'ABSENT'].includes(item.status)).map((item) =>
            Attendance.findOneAndUpdate({ manager: item.manager, date }, { status: item.status, markedBy: req.user.id }, { upsert: true, new: true, runValidators: true })
        ));
        res.json({ success: true, message: 'Attendance saved successfully' });
    } catch (error) { next(error); }
};

exports.getMonthlyAttendance = async (req, res, next) => {
    try {
        const month = req.query.month || new Date().toISOString().slice(0, 7);
        const start = new Date(`${month}-01T00:00:00`);
        const end = new Date(start); end.setMonth(end.getMonth() + 1);
        const summary = await Attendance.aggregate([
            { $match: { date: { $gte: start, $lt: end } } },
            { $group: { _id: '$manager', presentDays: { $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] } }, absentDays: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'manager' } },
            { $unwind: '$manager' },
            { $project: { _id: 0, manager: '$manager.name', presentDays: 1, absentDays: 1 } },
            { $sort: { manager: 1 } }
        ]);
        res.json({ success: true, data: summary });
    } catch (error) { next(error); }
};

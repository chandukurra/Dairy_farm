const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
    try {
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
        const notifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 }).limit(limit);
        const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
        res.json({ success: true, data: notifications, unreadCount });
    } catch (error) { next(error); }
};

exports.markNotificationRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id }, { isRead: true }, { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.json({ success: true, data: notification });
    } catch (error) { next(error); }
};

exports.markAllNotificationsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (error) { next(error); }
};

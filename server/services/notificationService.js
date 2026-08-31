const Notification = require('../models/Notification');
const User = require('../models/User');

let io;

exports.setNotificationSocket = (socketServer) => { io = socketServer; };

const emit = (notification) => {
    if (io) io.to(`user:${notification.recipient.toString()}`).emit('notification:new', notification);
};

exports.notifyUser = async (recipient, details) => {
    const notification = await Notification.create({ recipient, ...details });
    emit(notification);
    return notification;
};

exports.notifyRoles = async (roles, details) => {
    const users = await User.find({ role: { $in: roles }, status: 'ACTIVE' }).select('_id');
    const notifications = await Promise.all(users.map((user) => Notification.create({ recipient: user._id, ...details })));
    notifications.forEach(emit);
    return notifications;
};

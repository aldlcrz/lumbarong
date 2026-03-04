const Notification = require('../models/Notification');

let ioInstance = null;

const setIO = (io) => {
    ioInstance = io;
};

const sendNotification = async (userId, message, type = 'system') => {
    try {
        const notification = await Notification.create({ userId, message, type });

        if (ioInstance) {
            ioInstance.emit(`new_notification:${userId}`, notification);
            // Also update navbar if needed (count)
            ioInstance.emit(`notification_count_update:${userId}`);
        }

        console.log(`Notification sent to ${userId}: ${message}`);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

module.exports = { sendNotification, setIO };

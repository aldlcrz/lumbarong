const Notification = require('../models/Notification');

const sendNotification = async (userId, message, type = 'system') => {
    try {
        await Notification.create({ userId, message, type });
        console.log(`Notification sent to ${userId}: ${message}`);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

module.exports = { sendNotification };

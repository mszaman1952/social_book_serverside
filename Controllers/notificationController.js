const Notification = require("../Models/notificationModel");
const markAllNotificationsAsRead = async (req, res) => {
    try {
        const {
            userId
        } = req.params;

        // Check if there are notifications for the given user
        const notifications = await Notification.find({
            userId: userId
        });

        if (notifications.length === 0) {
            return res.json({
                success: false,
                message: 'No notifications found for the given user'
            });
        }

        // Check if all notifications are already marked as read
        const allRead = notifications.every(notification => notification.read === true);

        if (allRead) {
            return res.json({
                success: false,
                message: 'All notifications are already marked as read'
            });
        }

        // Update all notifications for the user to mark them as read
        await Notification.updateMany({
            userId: userId
        }, {
            $set: {
                read: true
            }
        });

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

module.exports = {
    markAllNotificationsAsRead
};
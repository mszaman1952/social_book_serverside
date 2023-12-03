const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userProfile',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    link: String,
    type: {
        type: String,
        enum: ['FriendRequest', 'Message', "Comment", "CommentReply", "ReplyInReply"],
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userProfile',
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
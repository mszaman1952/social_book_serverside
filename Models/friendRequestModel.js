const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userProfile',
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userProfile',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
}, {
    timestamps: true,
    versionKey: false
});

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;
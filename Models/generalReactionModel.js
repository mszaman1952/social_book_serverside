const mongoose = require('mongoose');

const generalReactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userProfile',
        required: true,
    },
    targetType: {
        type: String,
        enum: ['Post', 'Comment', 'CommentReply', "ReplyInReply"],
        required: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    type: {
        type: String,
        enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false
});

const GeneralReaction = mongoose.model('GeneralReaction', generalReactionSchema);

module.exports = GeneralReaction;
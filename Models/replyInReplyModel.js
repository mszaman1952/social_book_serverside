const mongoose = require('mongoose');

const replyInReplySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "userProfile"
    },
    commentReplyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "commentReply"
    },
    replyInReplyContent: {
        type: String,
        min: [3, 'Reply In Reply Content Minimum 3 Charecter is required'],
        trim: true
    },
    img_video: {
        type: String
    },
    reactionCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    versionKey: false
});

const ReplyInReply = mongoose.model('replyInReply', replyInReplySchema);
module.exports = ReplyInReply;

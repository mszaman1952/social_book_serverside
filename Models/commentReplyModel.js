const mongoose = require('mongoose');
const commentReplySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "userProfile"
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "comment"
    },
    commentReplyContent: {
        type: String,
        min: [3, 'Comment Reply Content minimum 3 characters required'],
        trim: true
    },
    img_video: {
        type: String
    },
    reactionCount: {
        type: Number,
        default: 0,
    },
    nestedReplies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'replyInReply',
    }],

}, {
    timestamps: true,
    versionKey: false
});

const CommentReply = mongoose.model('commentReply', commentReplySchema);
module.exports = CommentReply;
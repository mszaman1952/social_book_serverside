const {
    Schema,
    model
} = require('mongoose');

const commentReplySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "userProfile"
    },
    commentId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Comment"
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
}, {
    timestamps: true,
    versionKey: false
});

const CommentReply = model('commentReply', commentReplySchema);
module.exports = CommentReply;
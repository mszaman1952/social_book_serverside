const {
    Schema,
    model,
    default: mongoose
} = require('mongoose');

const commentSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "userProfile"
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Post"
    },
    commentContent: {
        type: String,
        min: [3, 'comment Content Minimum 3 charecter is required']
    },
    img_video: {
        type: String
    },
    reactionCount: {
        type: Number,
        default: 0,
    },
    commentReplies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'commentReply',
      }],
}, {
    timestamps: true,
    versionKey: false
});

const Comment = model('comment', commentSchema);
module.exports = Comment;
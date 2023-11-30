const {
    Schema,
    model,
    default: mongoose
} = require('mongoose');

const replyInReplySchema = new Schema({
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
    image: {
        type: String
    },
    video: {
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

const ReplyInReply = model('replyInReply', replyInReplySchema);
module.exports = ReplyInReply;
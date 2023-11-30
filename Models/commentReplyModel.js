const {
    Schema,
    model,
    default: mongoose
} = require('mongoose');

const commentReplySchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "userProfile"
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Comment"
    },
    commentReplyContent: {
        type: String,
        min: [3, 'Comment Reply Content minimum 3 charectar required'],
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

const CommentReply = model('commentReply', commentReplySchema);
module.exports = CommentReply;
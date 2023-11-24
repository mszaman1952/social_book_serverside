const {
    Schema,
    model,
    default: mongoose
} = require('mongoose');

const commentSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "post"
    },
    commentContent: {
        type: String,
        min: [3, 'comment Content Minimum 3 charecter is required']
    },
    image: {
        type: String
    },
    video: {
        tryp: String
    },
    reactionCount: {
        type: Number,
        default: 0,
      },    
}, {
    timestamps: true,
    versionKey: false
});

const Comment = model('comment', commentSchema);
module.exports = Comment;
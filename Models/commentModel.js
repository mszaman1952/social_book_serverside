const { Schema, model, default: mongoose } = require('mongoose');

const commentSchema = new Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "User"
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "post"
    },
    commentContent: {
        type: String,
        required: [true, 'comment Content is required']
    },
}, {timestamps : true, versionKey : false});

const Comment = model('comment', commentSchema);
module.exports = Comment;
const { Schema, model, default: mongoose } = require('mongoose');

const commentReplySchema = new Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "User"
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "comment"
    }, 
    commentReplyContent: {
        type: String,
        required: [true, 'Comment Reply Content is required'],
        trim : true
    },
    image : {
        type : String
    },
    video : {
        type : String
    }
}, {timestamps : true, versionKey : false});

const CommentReply = model('commentReply', commentReplySchema);
module.exports = CommentReply;
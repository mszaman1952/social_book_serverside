const { Schema, model, default: mongoose } = require('mongoose');

const replyInReplySchema = new Schema({
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
    commentReplyId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "commentReply"
    },
    replyInReplyContent: {
        type: String,
        required: [true, 'Reply In Reply Content is required'],
        trim : true
    },
    image : {
        type : String
    },
    video : {
        type : String
    }
}, {timestamps : true, versionKey : false});

const ReplyInReply = model('replyInReply', replyInReplySchema);
module.exports = ReplyInReply;
const { Schema, model, default: mongoose } = require('mongoose');

const postsSchema = new Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "User"
    },
    content: {
        type: String,
        required: [true, 'post content is required'],
        minlength: [3, 'post content must be atleast 3 characters']
    },
    image: {
        type: String,
        // required: [true, 'post image is required']
    },
    video : {
        type : String
    }
}, {timestamps : true, versionKey : false});

const Post = model('Posts', postsSchema);
module.exports = Post;
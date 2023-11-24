const {
    Schema,
    model,
    default: mongoose
} = require('mongoose');

const postsSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    content: {
        type: String,
        minlength: [5, 'post content must be atleast 5 characters'],
        trim: true
    },
    image: {
        type: String,
    },
    video: {
        type: String,
    },
    reactionCount: {
        type: Number,
        default: 0,
      },  
    shares: [{ user: { type: Schema.Types.ObjectId, ref: 'User' } }],
    shareCount: { type: Number, default: 0 },
    shares: [{ type: Schema.Types.ObjectId, ref: 'Share' }],
}, {
    timestamps: true,
    versionKey: false
});

const Post = model('Posts', postsSchema);
module.exports = Post;
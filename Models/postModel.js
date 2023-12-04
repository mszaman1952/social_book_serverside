const {
    Schema,
    model,
    default: mongoose
} = require('mongoose');

// Destructure the ObjectId from mongoose.Schema.Types
const {
    ObjectId
} = mongoose.Schema.Types;

// Define the schema for posts
const postsSchema = new Schema({
    profileId: {
        type: ObjectId,
        required: true,
        ref: "userProfile"
    },
    content: {
        type: String,
        minlength: [5, 'Post content must be at least 5 characters'],
        trim: true,
        maxlength: [1000, "Post content maximum 1000 characters"]
    },
    // Define image_video array with public_id and imgUrl properties
    image_video: [{
        public_id: {
            type: String,
            trim: true
        },
        imgUrl: {
            type: String,
            trim: true
        }
    }],
    // Define tag_friends array with ID property
    tag_friends: [{
        ID: {
            type: ObjectId,
            trim: true
        }
    }],
    publics: {
        type: Boolean,
        trim: true,
        default: false
    },
    friends: {
        type: Boolean,
        trim: true,
        default: true
    },
    // Define hide_profileId array with ID property
    hide_profileId: [{
        ID: {
            type: ObjectId,
            trim: true
        }
    }],
    onlyMe: {
        type: Boolean,
        trim: true,
        default: false
    },
    // Define specificShow_profileId array with ID property
    specificShow_profileId: [{
        ID: {
            type: ObjectId,
            trim: true
        }
    }],
    reactionCount: {
        type: Number,
        default: 0,
    },
    // Define shares array with user property
    shares: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'userProfile'
        }
    }],
    shareCount: {
        type: Number,
        default: 0
    },
    // Define shares array with Share model reference
    shares: [{
        type: Schema.Types.ObjectId,
        ref: 'Share'
    }],
    comments: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'comment' 
    }],
}, {
    timestamps: true,
    versionKey: false
});

// Create the Post model with the defined schema
const Post = model('Post', postsSchema);

// Export the Post model
module.exports = Post;
const mongoose = require('mongoose');
const {
    Schema,
    model
} = mongoose;
const fs = require('fs');
const {
    join
} = require('path');

const imagePath = join(__dirname, ('../img/7074311_3554557.svg'));

const bufferDatta = fs.readFileSync(imagePath);

const buffer = new Buffer.from(bufferDatta);
const result = buffer.toString('base64');
const imgf = `data:${'image/svg+xml'};base64,${result}`;

const profileSchema = new Schema({
    userName: {
        type: String,
        trim: true,
        required: true,
        minlength: 3,
        maxlength: 35
    },
    userImage: {
        type: String,
        trim: true,
        default: imgf
    },
    userBannerImg: {
        type: String,
        trim: true
    },
    birthYear: {
        type: String,
        trim: true,
        minlength: 4,
        maxlength: 4
    },
    job: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 500
    },
    workplace: {
        type: String,
        trim: true
    },
    high_School: {
        type: String,
        trim: true
    },
    college: {
        type: String,
        trim: true
    },
    current_city: {
        type: String,
        trim: true
    },
    home_town: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        trim: true
    },
    relationship: {
        type: String,
        trim: true,
        enum: ['Single', 'In A Relationship', 'Married', 'Divorced']
    },
    instagram: {
        type: String,
        trim: true
    },
    twitter: {
        type: String,
        trim: true
    },
    telegram: {
        type: String,
        trim: true
    },
    discord: {
        type: String,
        trim: true
    },
    profile_lock: {
        type: Boolean,
        default: false
    },
    block_user: [{
        type: Schema.Types.ObjectId,
        ref: 'userProfile'
    }],
    save_post: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    pin_post: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'userProfile',
        required: true
    },
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FriendRequest',
    }, ],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userProfile',
    }, ],
    sentFriendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FriendRequest',
    }, ],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userProfile'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userProfile'
    }],
}, {
    timestamps: true,
    versionKey: false
});

const userProfileModel = model('userProfile', profileSchema);

module.exports = userProfileModel;
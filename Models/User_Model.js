const mongoose = require('mongoose');
const {
    Schema,
    model
} = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        required: true,
        minlength: 3,
        maxlength: 15
    },
    lastName: {
        type: String,
        trim: true,
        required: true,
        minlength: 3,
        maxlength: 15
    },
    userName: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    activated: {
        type: Boolean,
        default: false
    },
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FriendRequest',
    }, ],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }, ],
    sentFriendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FriendRequest',
    }, ],

}, {
    timestamps: true,
    versionKey: false
});

const userModel = model('User', userSchema);

module.exports = userModel;
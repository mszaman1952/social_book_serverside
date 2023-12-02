const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shareSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userProfile',
        required: true
    },
}, {
    timestamps: true,
    versionKey: false
});

const Share = mongoose.model('Share', shareSchema);

module.exports = Share;
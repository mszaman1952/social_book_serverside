const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'userProfile', required: true 
},
  following: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userProfile', required: true 
},
},{timestamps : true, versionKey : false});

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;

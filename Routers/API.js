const express = require('express');
const {
    registration,
    login,
    activate,
    forget_password,
    set_password,
    create_profile,
    reset_profile,
    profile_block_pin_save,
    block_usre_get,
    pin_post_get,
    save_post_get,
    viewSingleProfile
} = require('../Controllers/AUTH');
const uploads = require('../Helpers/Upload');
const {
    tokenVerify
} = require('../Middlewares/TokenVerify');
const router = express.Router();

// user auth.....
router.post('/registration', registration);
router.post('/activate/:id', activate);
router.post('/login', login);
router.post('/forget-password', forget_password);
router.post('/set-password/:id', set_password);


// user profile.....
router.post('/create-profile', tokenVerify, uploads, create_profile);
router.post('/rest-profile', tokenVerify, reset_profile);
router.post('/block-pin-save-remove', tokenVerify, profile_block_pin_save);
router.get('/block-user', tokenVerify, block_usre_get);
router.get('/save-post', tokenVerify, save_post_get);
router.get('/pin-post', tokenVerify, pin_post_get);
router.get('/view-single-profile/:id', tokenVerify, viewSingleProfile);
router.post('/registration', registration);
router.post('/activate/:id', activate);
router.post('/login', login);

// post controller import ==========================
const {
    getPosts,
    addPost,
    getPost,
    deletePost,
    updatePost
} = require('../Controllers/postController');

// file upload middleware import============================
const { 
    postUpload, 
    commentUpload, 
    replyUpload, 
    nestedReplyUpload
} = require('../middleware/uploadFile');

// comment controller import==================================
const {
    createComment,
    readComment,
    updateComment,
    deleteComment
} = require('../Controllers/commentController');

// comment reply controller import=============================
const {
    commentReplyCreate,
    getCommentReply,
    updateCommentReply,
    deleteCommentReply
} = require('../Controllers/commentReplyController');

// replyInReply Controller import ===========================
const {
    createReplyInReply,
    getReplyInReply,
    updateReplyInReply,
    deleteReplyInReply
} = require('../Controllers/replyInReplyController');

// friend request controller import ============================
const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend,
    getAllFriends,
    getAllFriendRequestsReceived,
    cancelSentFriendRequest,
    findFriends,
    getMutualFriends,
    peopleYouKnowMe
} = require('../Controllers/firendRequestController');

// general reaction controller import ==========================
const { 
    toggleReaction, 
    getSpecificReactions, 
    getTotalReactionsCount
} = require('../Controllers/generalReactionController');

// share post controller import ===================================
const { 
    sharePost 
} = require('../Controllers/sharePostController');

// notification controller import ===============================
const { 
    markAllNotificationsAsRead 
} = require('../Controllers/notificationController');

// import message controller ============================
// const { 
    // getAllMessages, 
    // addMessage 
// } = require('../Controllers/messageController');

// post Rout section=========================================
router.get('/getPosts', getPosts);
router.get('/getPost/:id', getPost);
router.post('/addPost', postUpload.any(), addPost);
router.put('/updatePost/:id', postUpload.any(), updatePost);
router.delete('/deletePost/:id', deletePost);
router.post('/sharePost',tokenVerify, sharePost);

// comment  section==============================================
router.post('/createComment',commentUpload.any(), createComment);
router.get('/readComment/:id', readComment);
router.put('/updateComment/:id', commentUpload.any(),updateComment);
router.delete('/deleteComment/:id', deleteComment);

// reply section==============================================
router.post('/createCommentReply',replyUpload.any(), commentReplyCreate);
router.get('/getCommentReply/:id', getCommentReply);
router.put('/updateCommentReply/:id', updateCommentReply);
router.delete('/deleteCommentReply/:id', deleteCommentReply);

// reply in reply section===============================
router.post('/createReplyInReply',nestedReplyUpload.any(), createReplyInReply);
router.get('/getReplyInReply/:id', getReplyInReply);
router.put('/updateReplyInReply/:id', updateReplyInReply);
router.delete('/deleteReplyInReply/:id', deleteReplyInReply);

// friend request section ================================
router.post('/sendFriendRequest', sendFriendRequest);
router.post('/acceptFriendRequest', acceptFriendRequest);
router.post('/rejectFriendRequest', rejectFriendRequest);
router.post('/unfriend', unfriend);
router.get('/allFriends', getAllFriends);
router.get('/getAllFriendRequest', getAllFriendRequestsReceived);
router.post('/cancelSentFriendRequest', cancelSentFriendRequest);
router.get('/findFriend', findFriends);
router.get('/getMutualFriends/:userId1/:userId2', getMutualFriends);
router.get('/peopleYouKnowMe/:userId', peopleYouKnowMe);

// message route endpoint section ============================
// router.get("/getMessage", getAllMessages);
// router.post('/addMessage', addMessage); 

// general reaction router section ==============================
router.post('/addReaction', toggleReaction);
router.get('/getSpecificReactions',getSpecificReactions);
router.get('/getAllReactions', getTotalReactionsCount);

// notification router import section ========================
router.get('/getAllNotificationAsRead/:userId', markAllNotificationsAsRead)

module.exports = router;
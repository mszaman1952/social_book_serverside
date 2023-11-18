// api.js
const express = require('express');
const { registration, login, activate, forget_password, set_password, create_profile, reset_profile, profile_block_pin_save, block_usre_get, pin_post_get, save_post_get, viewSingleProfile } = require('../Controllers/AUTH');
const uploads = require('../Helpers/Upload');
const { tokenVerify } = require('../Middlewares/TokenVerify');
const router = express.Router();

// user auth.....
router.post('/registration',registration);
router.post('/activate/:id',activate);
router.post('/login',login);
router.post('/forget-password',forget_password);
router.post('/set-password/:id',set_password);


// user profile.....
router.post('/create-profile',tokenVerify,uploads,create_profile);
router.post('/rest-profile',tokenVerify,reset_profile);
router.post('/block-pin-save-remove',tokenVerify,profile_block_pin_save);
router.get('/block-user',tokenVerify,block_usre_get);
router.get('/save-post',tokenVerify,save_post_get);
router.get('/pin-post',tokenVerify,pin_post_get);
router.get('/view-single-profile/:id',tokenVerify,viewSingleProfile); 
router.post('/registration', registration);
router.post('/activate/:id', activate);
router.post('/login', login);

// post controller import ==========================
const { getPosts, addPost, getPost, deletePost, updatePost } = require('../Controllers/postController');

// file upload middleware import============================
const postUpload = require('../middleware/uploadFile');

// comment controller import==================================
const { createComment, readComment, updateComment, deleteComment } = require('../Controllers/commentController');

// comment reply controller import=============================
const { commentReplyCreate, getCommentReply, updateCommentReply, deleteCommentReply } = require('../Controllers/commentReplyController');

// replyInReply Controller import ===========================
const { createReplyInReply, getReplyInReply, updateReplyInReply, deleteReplyInReply } = require('../Controllers/replyInReplyController');

// post Rout section=========================================
router.get('/getPosts', getPosts);
router.get('/getPost/:id', getPost);
router.post('/addPost', postUpload.any(), addPost);
router.put('/updatePost/:id', postUpload.any(), updatePost); 
router.delete('/deletePost/:id', deletePost); 

// comment  section==============================================
router.post('/createComment', createComment);
router.get('/readComment/:id',readComment);
router.put('/updateComment/:id', updateComment);
router.delete('/deleteComment/:id', deleteComment);

// reply section==============================================
router.post('/createCommentReply', commentReplyCreate);
router.get('/getCommentReply/:id', getCommentReply);
router.put('/updateCommentReply/:id', updateCommentReply);
router.delete('/deleteCommentReply/:id', deleteCommentReply);

// reply in reply section===============================
router.post('/createReplyInReply', createReplyInReply);
router.get('/getReplyInReply/:id', getReplyInReply);
router.put('/updateReplyInReply/:id', updateReplyInReply);
router.delete('/deleteReplyInReply/:id', deleteReplyInReply);

module.exports = router;
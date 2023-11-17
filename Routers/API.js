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

const { getPosts, addPost, getPost, deletePost, updatePost } = require('../Controllers/postController');
const upload = require('../middleware/uploadFile');
const { createComment, readComment, updateComment, deleteComment } = require('../Controllers/commentController');
const { commentReplyCreate, getCommentReply, updateCommentReply, deleteCommentReply } = require('../Controllers/commentReplyController');

// post section
router.get('/getPosts', getPosts);
router.get('/getPost/:id', getPost);
// router.post('/addPost', upload.array(['image',"video"], 2), addPost);
router.post('/addPost', upload.any(), addPost);

router.put('/updatePost/:id', upload.single('image'), updatePost); // Remove trailing slash
router.delete('/deletePost/:id', deletePost); 

// comment router
router.post('/createComment', createComment)
router.get('/readComment/:id',readComment)
router.put('/updateComment/:id', updateComment)
router.delete('/deleteComment/:id', deleteComment)

// reply section
router.post('/createCommentReply', commentReplyCreate)
router.get('/getCommentReply/:id', getCommentReply)
router.put('/updateCommentReply/:id', updateCommentReply)
router.delete('/deleteCommentReply/:id', deleteCommentReply)

module.exports = router;
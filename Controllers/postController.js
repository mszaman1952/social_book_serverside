const Post = require('../Models/postModel');
const { clientError, serverError } = require('./error');
const Comment = require('../Models/commentModel');
const CommentReply = require('../Models/commentReplyModel');
const ReplyInReply = require('../Models/replyInReplyModel');

// get all posts ===============
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    if (posts) {
      res.status(200).send({
        success: true,
        message: 'find all posts',
        data: posts
      });
    } else {
      await clientError(res, 404, 'post not found');
    }
  } catch (error) {
    await serverError(res, 500, error.message);
  }
};

// get single post ===============
const getPost = async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Post.findOne({ _id: id });
    if (post) {
      res.status(200).send({
        success: true,
        message: 'find single posts',
        data: post
      });
    } else {
      await clientError(res, 404, 'post with this id was not found');
    }
  } catch (error) {
    await serverError(res, 500, error.message);
  }
};

// post add ===========================
const addPost = async (req, res) => {
  try {
    // Destructure userId and content from req.body
    const { userId, content } = req.body;

    // Find the image file 
    const imageFile = req.files.find(file => file.fieldname === 'image'); 

    // Find the video file
    const videoFile = req.files.find(file => file.fieldname === 'video'); 

    // Check if at least one of content, image, or video is provided
    if (!content && !imageFile && !videoFile) {
      return await clientError(res, 400, 'At least one of content, image, or video is required');
    }

    const postFields = {
      userId,
      content,
      // Assign image filename if found, else null
      image: imageFile ? imageFile.filename : null,
      // Assign video filename if found, else null
      video: videoFile ? videoFile.filename : null,
    };

    const newPost = new Post(postFields);
    const post = await newPost.save();

    if (post) {
      res.status(201).send({
        success: true,
        message: 'Post was added',
        data: post
      });
    }
  } catch (error) {
    await serverError(res, 500, error.message);
  }
};


// update post =============
const updatePost = async (req, res) => {
  try {
    const id = req.params.id;
    const imageFile = req.files.find(file => file.fieldname === 'image');
    const videoFile = req.files.find(file => file.fieldname === 'video');

    const post = await Post.findOne({ _id: id });
    if (!post) {
      return await clientError(res, 404, 'Post with this id was not found');
    }

    const updateFields = {
      content: req.body.content ? req.body.content : null,
      image: imageFile ? imageFile.filename : null,
      video: videoFile ? videoFile.filename : null,
    };

    await Post.updateOne({ _id: id }, { $set: updateFields });

    res.status(200).send({
      success: true,
      message: 'Post was updated',
    });
  } catch (error) {
    await serverError(res, 500, error.message);
  }
};


// delete post ==========================

const deletePost = async (req, res) => {
  try {
    const id = req.params.id;

    // Delete the post
    await Post.deleteOne({ _id: id });

    // Delete all comments associated with the post
    await Comment.deleteMany({ postId: id });

    // Delete all replies associated with the post
    await CommentReply.deleteMany({ postId: Comment._id });

    // Delete all nseted reply
    await ReplyInReply.deleteMany({postId : ReplyInReply._id})

    res.status(200).send({
      success: true,
      message: 'Post was deleted'
    });
  } catch (error) {
    await serverError(res, 500, error.message);
  }
};


module.exports = { getPosts, getPost, addPost, deletePost, updatePost };
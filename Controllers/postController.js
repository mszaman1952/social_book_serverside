const postModel = require('../Models/postModel');
const {
    clientError,
    serverError
} = require('./error');
const Comment = require('../Models/commentModel');
const CommentReply = require('../Models/commentReplyModel');
const ReplyInReply = require('../Models/replyInReplyModel');
const userProfileModel = require('../Models/user_profile_Model');
const cloudinary = require('../Helpers/Cloudinary');
const {
    validationLength
} = require("../Helpers/Validation");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// get all posts ===============

const getPosts = async (req, res) => {
    try {
      // Find all posts, populate comments with specific fields, and select fields from the populated comments
      const posts = await postModel.find()
        .populate({
          path: 'comments',
          select: '_id commentContent img_video',
        })
        .select("_id content image_video"); 

      if (posts) {
        // Extract comments from the populated posts
        const postsWithComments = posts.map(post => {
          return {
            _id: post._id,
            content: post.content, 
            image_video: post.image_video,
            comments: post.comments,
          };
        });
  
        res.status(200).json({
          success: true,
          message: 'Find all posts',
          data: postsWithComments,
        });
      } else {
        res.status(404).json({ success: false, message: 'No posts found' });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  

// get single post ===============

const getPost = async (req, res) => {
    try {
      const id = req.params.id;
  
      // Find the post by ID, populate comments with specific fields, and select fields from the populated comments
      const post = await postModel.findById(id)
        .populate({
          path: 'comments',
          select: '_id commentContent img_video',
        })
        .select("_id content image_video"); 
  
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
    
      // Respond with post details and comments
      res.json({
        success: true,
        message: 'Find single post',
          post,
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  
  
// post add ===========================
const addPost = async (req, res) => {
    try {
        const {
            content,
            tag_friends,
            hide_profileId,
            specificShow_profileId,
            publics,
            friends,
            onlyMe
        } = req.body;
        const data = await userProfileModel.findOne({
            userId: req.userId
        }).select({
            "_id": 1,
            "profile_lock": 1
        });

        const {
            img_video
        } = req.files;

        const validateField = (value, fields) => {
            if (value && value !== 'true' && value !== 'false') {
                return {
                    status: 'Fail',
                    message: `Invalid ${fields} value.They must be booleans.`
                };
            }
            return null;
        };

        const validationResults = [
            validateField(publics, "publics"),
            validateField(friends, "friends"),
            validateField(onlyMe, "onlyMe"),
        ];
        const failedValidation = validationResults.find(result => result !== null);

        if (failedValidation) {
            return failedValidation;
        };

        if (data.profile_lock && publics == "true") {
            return {
                status: "Fail",
                message: "Your profile is lock.unlock your profile first."
            };
        };


        if (content) {
            if (!validationLength(content, 1, 1000)) {
                return {
                    status: "Fail",
                    message: "Content must be 1 and 1000 characters."
                };
            };
        };

        const processIds = (data) => {
            if (data) {
                const dataArray = Array.isArray(data) ? data : [data];
                return dataArray.flatMap(ids => ids.split(',').map(ID => ({
                    ID
                })));
            }
            return [];
        };

        let dataTF = processIds(tag_friends);
        let dataHF = processIds(hide_profileId);
        let dataSF = processIds(specificShow_profileId);

        if (friends == "true" && onlyMe == "true") {
            return {
                status: "Fail",
                message: "something went wrong."
            };
        };

        if (friends == "false" && onlyMe == "false" && publics == "false") {
            return {
                status: "Fail",
                message: "something went wrong."
            };
        };

        if (publics == "true") {
            req.body.friends = true;
            req.body.onlyMe = false;
            dataSF = [];
            dataHF = [];
        };

        if (friends == "true" && publics == "false" && onlyMe == "false") {
            req.body.publics = false;
            req.body.onlyMe = false;
            if (dataHF.length > 0) {
                dataSF = []
            } else if (dataSF.length > 0) {
                dataHF = []
            }
        };

        if (onlyMe == "true" && publics == "false" && friends == "false") {
            req.body.publics = false;
            req.body.friends = false;
            dataSF = [];
            dataHF = [];
        };

        const uploadC = async (path) => await cloudinary.uploader.upload(path, {
            resource_type: 'auto'
        });

        let imgURL = [];

        if (img_video) {
            const fifty = img_video.slice(0, 50);
            for (const file of fifty) {
                const {
                    path
                } = file;
                const newPath = await uploadC(path);
                const faw = {
                    public_id: newPath.public_id,
                    imgUrl: newPath.secure_url
                };
                imgURL.push(faw);
            };
        };

        const post = await new postModel({
            profileId: data._id,
            content: content ? req.body.content : null,
            publics: req.body.publics,
            friends: req.body.friends,
            onlyMe: req.body.onlyMe,
            image_video: imgURL,
            tag_friends: dataTF,
            hide_profileId: dataHF,
            specificShow_profileId: dataSF
        }).save();

        res.status(201).json({
            status: "Success",
            data: post
        })
    } catch (error) {
        await serverError(res, 500, error.message);
    }
};


// update post =============
const updatePost = async (req, res) => {
    try {

        const {
            content,
            tag_friends,
            hide_profileId,
            specificShow_profileId,
            publics,
            friends,
            onlyMe
        } = req.body;
        const data = await userProfileModel.findOne({
            userId: req.userId
        }).select({
            "_id": 1,
            "profile_lock": 1
        });

        const validateField = (value, fields) => {
            if (value && value !== 'true' && value !== 'false') {
                return {
                    status: 'Fail',
                    message: `Invalid ${fields} value.They must be booleans.`
                };
            }
            return null;
        };

        const validationResults = [
            validateField(publics, "publics"),
            validateField(friends, "friends"),
            validateField(onlyMe, "onlyMe"),
        ];
        const failedValidation = validationResults.find(result => result !== null);

        if (failedValidation) {
            return failedValidation;
        };

        if (data.profile_lock && publics == "true") {
            return {
                status: "Fail",
                message: "Your profile is lock.unlock your profile first."
            };
        };


        if (content) {
            if (!validationLength(content, 1, 1000)) {
                return {
                    status: "Fail",
                    message: "Content must be 1 and 1000 characters."
                };
            };
        };

        const processIds = (data) => {
            if (data) {
                const dataArray = Array.isArray(data) ? data : [data];
                return dataArray.flatMap(ids => ids.split(',').map(ID => ({
                    ID
                })));
            }
            return [];
        };

        let dataTF = processIds(tag_friends);
        let dataHF = processIds(hide_profileId);
        let dataSF = processIds(specificShow_profileId);

        if (friends == "true" && onlyMe == "true") {
            return {
                status: "Fail",
                message: "something went wrong."
            };
        };

        if (friends == "false" && onlyMe == "false" && publics == "false") {
            return {
                status: "Fail",
                message: "something went wrong."
            };
        };

        if (publics == "true") {
            req.body.friends = true;
            req.body.onlyMe = false;
            dataSF = [];
            dataHF = [];
        };

        if (friends == "true" && publics == "false" && onlyMe == "false") {
            req.body.publics = false;
            req.body.onlyMe = false;
            if (dataHF.length > 0) {
                dataSF = []
            } else if (dataSF.length > 0) {
                dataHF = []
            }
        };

        if (onlyMe == "true" && publics == "false" && friends == "false") {
            req.body.publics = false;
            req.body.friends = false;
            dataSF = [];
            dataHF = [];
        };


        await postModel.findByIdAndUpdate({
            profileId: data._id,
            _id: req.params.id
        }, {
            $set: {
                content: req.body.content ? req.body.content : null,
                publics: req.body.publics,
                friends: req.body.friends,
                onlyMe: req.body.onlyMe,
                tag_friends: dataTF,
                hide_profileId: dataHF,
                specificShow_profileId: dataSF
            }
        });

        res.status(200).json({
            status: "success",
            message: "post update successfully."
        });

    } catch (err) {
        await serverError(res, 500, err.message);
    }
};


// delete post ==========================

const deletePost = async (req, res) => {
    try {
        const id = req.params.id;

        // Delete the post
        await postModel.deleteOne({
            _id: id
        });

        // Delete all comments associated with the post
        await Comment.deleteMany({
            postId: id
        });

        // Delete all replies associated with the post
        await CommentReply.deleteMany({
            postId: Comment._id
        });

        // Delete all reply in reply
        await ReplyInReply.deleteMany({
            postId: ReplyInReply._id
        })


        res.status(200).send({
            success: true,
            message: 'Post was deleted'
        });
    } catch (error) {
        await serverError(res, 500, error.message);
    }
};


module.exports = {
    getPosts,
    getPost,
    addPost,
    deletePost,
    updatePost
};
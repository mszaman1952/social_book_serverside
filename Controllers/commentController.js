const userModel = require("../Models/User_Model");
const Comment = require("../Models/commentModel");
const CommentReply = require("../Models/commentReplyModel");
const Post = require("../Models/postModel");
const ReplyInReply = require("../Models/replyInReplyModel");
const Notification = require("../Models/notificationModel");
const { clientError } = require("./error");

// create comment =====================
const createComment = async (req, res) => {
    try {
        const {
            userId,
            postId,
            commentContent,
            postOwnerId
        } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            res.status(404).json({
                status: 'failed',
                message: 'User not found',
            });
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({
                status: 'failed',
                message: 'Post not found',
            });
            return;
        }
         // Find the image file 
         const imageFile = req.files.find(file => file.fieldname === 'image');

         // Find the video file
         const videoFile = req.files.find(file => file.fieldname === 'video');
 
         // Check if at least one of content, image, or video is provided
         if (!commentContent && !imageFile && !videoFile) {
             return await clientError(res, 400, 'At least one of content, image, or video is required');
         }
 
        const newComment = await Comment({
            userId,
            postId,
            commentContent : commentContent ? commentContent : null,
            // Assign image filename if found, else null
            image: imageFile ? imageFile.filename : null,
            // Assign video filename if found, else null
            video: videoFile ? videoFile.filename : null,
        }).save();

            // Create a notification for the post owner (assuming the post owner is the recipient)
    const newNotification = new Notification({
        userId: postOwnerId, 
        message: 'You have a new comment on your post.',
        type: 'Comment',
        senderId: userId, 
      });
  
      await newNotification.save();
  

        res.status(201).json({
            status: 'Success',
            data: newComment,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// read Comment ===========================

const readComment = async (req, res) => {
    try {
        const id = req.params.id;

        const commentRead = await Comment.findById(id)
        if (!commentRead) {
            res.status(404).json({
                status: 'failed',
                message: 'Coment not found',
            });
            return;
        }

        res.status(200).json({
            status: "Success",
            commentRead
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

// update Comment=====================

const updateComment = async (req, res) => {
    try {
        const id = req.params.id;
        const { userId } = req.body;
        
        const comment = await Comment.findOne({
            _id: id, 
            userId: userId, // Add a check for the user ID
        });
        if (!comment) {
            return await clientError(res, 404, 'Comment or user with this id was not found');
        }
        const imageFile = req.files.find(file => file.fieldname === 'image');
        const videoFile = req.files.find(file => file.fieldname === 'video');

        const updateFields = {
            content: req.body.content ? req.body.content : null,
            image: imageFile ? imageFile.filename : null,
            video: videoFile ? videoFile.filename : null,
        };

        const updatedCommentData = await Comment.updateOne({
            _id: id
        }, {
            $set: updateFields
        });
        res.status(200).json({
            status: "Success",
            updatedCommentData,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
}

// comment delete =========================
const deleteComment = async (req, res) => {
    try {
        const id = req.params.id;
        await Comment.deleteOne({
            _id: id
        });

        // comment Reply deleted
        await CommentReply.deleteMany({
            commentId: id
        })

        // ReplyInReply/Nested Reply Deleted
        await ReplyInReply.deleteMany({
            commentId: id
        });

        res.status(200).json({
            status: "Success",
            message: "Comment Delete is Successfully"
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        })
    }
}

module.exports = {
    createComment,
    readComment,
    updateComment,
    deleteComment
}
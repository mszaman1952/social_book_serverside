const mongoose = require('mongoose');
const cloudinary = require("../Helpers/Cloudinary");
const Comment = require("../Models/commentModel");
const CommentReply = require("../Models/commentReplyModel");
const Notification = require("../Models/notificationModel");
const ReplyInReply = require("../Models/replyInReplyModel");
const userProfileModel = require("../Models/user_profile_Model");
const {
    clientError
} = require("./error");

// Function to upload a file to Cloudinary
const uploadToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            resource_type: 'auto',
        });
        return {
            public_id: result.public_id,
            secure_url: result.secure_url,
        };
    } catch (error) {
        throw new Error(`Error uploading file to Cloudinary: ${error.message}`);
    }
};

// create comment reply=======================
const commentReplyCreate = async (req, res) => {
    try {
        const {
            userId,
            commentId,
            commentReplyContent,
            commentOwnerId
        } = req.body;

        const user = await userProfileModel.findById(userId);

        // Validate profile existence
        if (!user) {
            return res.status(404).json({
                status: 'failed',
                message: 'User Profile not found',
            });
        }

        // Find the img_video file in the request
        const imgVideoFile = req.files['img_video'] ? req.files['img_video'][0] : null;

        // Check if at least one of content, image, or video is provided
        if (!commentReplyContent && !imgVideoFile) {
            return res.status(400).json({
                status: 'Fail',
                message: 'At least one of content, image, or video is required',
            });
        }

        // Upload img_video to Cloudinary if it exists
        let imgVideoUploadResult = null;
        if (imgVideoFile) {
            try {
                imgVideoUploadResult = await uploadToCloudinary(imgVideoFile);
            } catch (uploadError) {
                return res.status(500).json({
                    status: 'Fail',
                    message: 'Error uploading img_video to Cloudinary',
                    uploadError,
                });
            }
        }

        // Create the comment reply object
        const newCommentReply = await new CommentReply({
            userId,
            commentId,
            commentReplyContent: commentReplyContent ? commentReplyContent : null,
            img_video: imgVideoUploadResult ? imgVideoUploadResult.secure_url : null,
        }).save();

        // Find the comment and push the reply to the replies array
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                status: 'failed',
                message: 'Comment not found',
            });
        }

        comment.commentReplies.push(newCommentReply._id);
        await comment.save();

        // Create a new notification
        const newNotification = new Notification({
            userId: commentOwnerId,
            message: 'You have a new Reply on your Comment.',
            type: 'CommentReply',
            senderId: userId
        });

        await newNotification.save();

        return res.status(201).json({
            status: 'Success',
            data: newCommentReply,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Fail',
            message: 'Unexpected error',
        });
    }
};


// get comment reply ====================
const getCommentReply = async (req, res) => {
    try {
        const id = req.params.id;

        // Validate that the provided ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "Failed",
                message: "Invalid ID format",
            });
        }

        const commentReplyGet = await CommentReply.findById(id).select("commentReplyContent img_video");

        if (!commentReplyGet) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Comment Reply not found',
            });
        }

        return res.status(200).json({
            status: "Success",
            data: commentReplyGet,
        });
    } catch (error) {
        return res.status(500).json({
            status: "Failed",
            message: error.message,
        });
    }
};


// update comment reply======================
const updateCommentReply = async (req, res) => {
    try {
        const id = req.params.id;

        const commentReply = await CommentReply.findById(id);

        if (!commentReply) {
            res.status(404).json({
                status: 'failed',
                message: 'Coment Reply not found',
            });
            return;
        }

        const img_videoFile = req.files['img_video'] ? req.files['img_video'][0] : null;

        const updateFields = {
            commentReplyContent: req.body.commentReplyContent ? req.body.commentReplyContent : commentReply.commentReplyContent || null,
            img_video: img_videoFile ? (await uploadToCloudinary(img_videoFile)).secure_url : commentReply.img_video || null,
        };

        const commentReplyUpdate = await CommentReply.updateOne({
            _id: id,
        }, {
            $set: updateFields,
        }, {
            new: true,
        });

        res.json({
            status: 'success',
            data: commentReplyUpdate,
        });
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: error.message,
        });
    }
};

// delete comment reply====================================
const deleteCommentReply = async (req, res) => {
    try {
        const id = req.params.id;

        // Validate that the provided ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "Failed",
                message: "Invalid ID format",
            });
        }

        // Retrieve the comment reply
        const commentReply = await CommentReply.findById(id);

        if (!commentReply) {
            return res.status(404).json({
                status: "Failed",
                message: "Comment Reply not found",
            });
        }

        // Obtain the ID of the associated comment
        const commentId = commentReply.commentId;

        // Delete CommentReply
        await CommentReply.deleteOne({
            _id: id
        });

        // Delete associated ReplyInReply documents
        await ReplyInReply.deleteMany({
            commentReplyId: id
        });

        // Update the associated comment by removing the comment reply ID
        await Comment.findByIdAndUpdate(
            commentId,
            { $pull: { commentReplies: id } },
            { new: true }
        );

        return res.status(200).json({
            status: "Success",
            message: "Comment Reply and associated Reply In Reply documents are deleted, and comment is updated",
        });
    } catch (error) {
        return res.status(500).json({
            status: "Failed",
            message: error.message,
        });
    }
};

module.exports = {
    commentReplyCreate,
    getCommentReply,
    updateCommentReply,
    deleteCommentReply
}
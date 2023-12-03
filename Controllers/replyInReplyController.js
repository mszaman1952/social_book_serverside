const mongoose = require('mongoose')
const cloudinary = require("../Helpers/Cloudinary");
const Comment = require("../Models/commentModel");
const CommentReply = require("../Models/commentReplyModel");
const Notification = require("../Models/notificationModel");
const ReplyInReply = require("../Models/replyInReplyModel");
const userProfileModel = require("../Models/user_profile_Model");

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

// createReplyInReply ===========================
const createReplyInReply = async (req, res) => {
    try {
        const {
            userId,
            commentId,
            commentReplyId,
            replyInReplyContent,
            commentReplyOwnerId
        } = req.body;

        // Validation check
        const user = await userProfileModel.findById(userId);
        const comment = await Comment.findById(commentId);
        const commentReply = await CommentReply.findById(commentReplyId);

        if (!user || !comment || !commentReply) {
            return res.status(404).json({
                status: 'failed',
                message: 'User, Comment, or CommentReply not found',
            });
        }

        // Find the img_video file in the request
        const imgVideoFile = req.files['img_video'] ? req.files['img_video'][0] : null;

        // Check if at least one of content, image, or video is provided
        if (!replyInReplyContent || !imgVideoFile) {
            return res.status(400).json({
                status: 'failed',
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
        // Assuming you have a model for ReplyInReply
        const replyInReplyCreate = await new ReplyInReply({
            userId,
            commentId,
            commentReplyId,
            replyInReplyContent: replyInReplyContent ? replyInReplyContent : null,
            img_video: imgVideoUploadResult ? imgVideoUploadResult.secure_url : null,
        }).save();

        // Create a new notification
        const newNotification = new Notification({
            userId: commentReplyOwnerId,
            message: 'You have a new Reply on your Reply.',
            type: 'ReplyInReply',
            senderId: userId
        });

        await newNotification.save();
        res.status(201).json({
            status: 'Success',
            data: replyInReplyCreate,
        });
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: error.message,
        });
    }
};

// get replyInReply =========================
const getReplyInReply = async (req, res) => {
    try {
        const id = req.params.id;

        // Validate that the provided ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "Failed",
                message: "Invalid ID format",
            });
        }

        const replyInReplyGet = await ReplyInReply.findById(id).select("replyInReplyContent img_video");

        if (!replyInReplyGet) {
            return res.status(404).json({
                status: "Failed",
                message: "Reply In Reply not found",
            });
        }

        return res.status(200).json({
            status: "Success",
            data: replyInReplyGet,
        });
    } catch (error) {
        return res.status(500).json({
            status: "Failed",
            message: error.message,
        });
    }
};


// update ReplyInReply======================
const updateReplyInReply = async (req, res) => {
    try {
        const id = req.params.id;

        const replyInReply = await ReplyInReply.findById(id);

        if (!replyInReply) {
            res.status(404).json({
                status: 'failed',
                message: 'Reply in reply is not found',
            });
            return;
        }

        const img_videoFile = req.files['img_video'] ? req.files['img_video'][0] : null;

        const updateFields = {
            replyInReplyContent: req.body.replyInReplyContent ? req.body.replyInReplyContent : ReplyInReply.replyInReplyContent || null,
            img_video: img_videoFile ? (await uploadToCloudinary(img_videoFile)).secure_url : ReplyInReply.img_video || null,
        };

        const replyInReplyUpdate = await ReplyInReply.updateOne({
            _id: id,
        }, {
            $set: updateFields,
        }, {
            new: true,
        });

        res.json({
            status: 'success',
            data: replyInReplyUpdate,
        });
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: error.message,
        });
    }
};

// delete replayInReply===================
const deleteReplyInReply = async (req, res) => {
    try {
        const id = req.params.id;

        // Validate that the provided ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "Failed",
                message: "Invalid ID format",
            });
        }

        const replyInReply = await ReplyInReply.findById(id);

        if (!replyInReply) {
            return res.status(404).json({
                status: "Failed",
                message: "Reply In Reply not found",
            });
        }

        await ReplyInReply.deleteOne({
            _id: id
        });

        return res.status(200).json({
            status: "Success",
            message: "Reply In Reply is deleted",
        });
    } catch (error) {
        return res.status(500).json({
            status: "Failed",
            message: error.message,
        });
    }
};

module.exports = {
    createReplyInReply,
    getReplyInReply,
    updateReplyInReply,
    deleteReplyInReply
}
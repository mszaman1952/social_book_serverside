const mongoose = require('mongoose')
const cloudinary = require("../Helpers/Cloudinary");
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

// createReplyInReply =====================================
const createReplyInReply = async (req, res) => {
    try {
        const {
            userId,
            commentReplyId,
            replyInReplyContent,
            commentReplyOwnerId
        } = req.body;

        // Validation check
        const user = await userProfileModel.findById(userId);
        const commentReply = await CommentReply.findById(commentReplyId);

        if (!user || !commentReply) {
            return res.status(404).json({
                status: 'failed',
                message: 'User, Comment, or CommentReply not found',
            });
        }

        // Find the img_video file in the request
        const imgVideoFile = req.files['img_video'] ? req.files['img_video'][0] : null;

        // Check if at least one of content, image, or video is provided
        if (!replyInReplyContent && !imgVideoFile) {
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
                    status: 'failed',
                    message: 'Error uploading img_video to Cloudinary',
                    uploadError,
                });
            }
        }

        // Create a new ReplyInReply instance
        const replyInReplyCreate = await new ReplyInReply({
            userId,
            commentReplyId,
            replyInReplyContent: replyInReplyContent || null,
            img_video: imgVideoUploadResult ? imgVideoUploadResult.secure_url : null,
            nestedReplies: [], // Initialize with an empty array
        }).save();

        // Create a new notification
        const newNotification = new Notification({
            userId: commentReplyOwnerId,
            message: 'You have a new Reply on your Reply.',
            type: 'ReplyInReply',
            senderId: userId
        });

        await newNotification.save();

        // Update the CommentReply to include the new ReplyInReply
        commentReply.nestedReplies.push(replyInReplyCreate._id);
        await commentReply.save();
        // Include the nestedReplies field when responding
        replyInReplyCreate.nestedReplies = [];


        res.status(201).json({
            status: 'success',
            data: replyInReplyCreate,
        });
    } catch (error) {
        console.error('Unexpected error in createReplyInReply:', error);
        res.status(500).json({
            status: 'failed',
            message: 'Unexpected error',
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

        const replyInReplyGet = await ReplyInReply.findById(id)
            .select("replyInReplyContent img_video nestedReplies")
            .populate({
                path: "nestedReplies",
                select: "replyInReplyContent img_video",
            })
            .exec();

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

        const replyInReplyId = replyInReply.commentReplyId; // Assuming you have a field named commentReplyId

        await ReplyInReply.deleteOne({
            _id: id
        });

        // Remove the deleted ReplyInReply ID from the CommentReply model
        await CommentReply.findByIdAndUpdate(
            replyInReplyId,
            { $pull: { nestedReplies :  id } },
            { new: true }
        );

        return res.status(200).json({
            status: "Success",
            message: "Reply In Reply is deleted",
        });
    } catch (error) {
        console.error('Unexpected error in deleteReplyInReply:', error);
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
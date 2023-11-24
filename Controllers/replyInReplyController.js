const userModel = require("../Models/User_Model");
const Comment = require("../Models/commentModel");
const CommentReply = require("../Models/commentReplyModel");
const ReplyInReply = require("../Models/replyInReplyModel");

// createReplyInReply ===========================
const createReplyInReply = async (req, res) => {
    try {
        const { userId, commentId, commentReplyId, replyInReplyContent } = req.body;

        // Validation check
        const user = await userModel.findById(userId);
        const comment = await Comment.findById(commentId);
        const commentReply = await CommentReply.findById(commentReplyId);

        if (!user || !comment || !commentReply) {
            return res.status(404).json({
                status: 'failed',
                message: 'User, Comment, or CommentReply not found',
            });
        }

        // Find the image file 
        const imageFile = req.files ? req.files.find(file => file.fieldname === 'image') : null;

        // Find the video file
        const videoFile = req.files ? req.files.find(file => file.fieldname === 'video') : null;

        // Check if at least one of content, image, or video is provided
        if (!replyInReplyContent && !imageFile && !videoFile) {
            return res.status(400).json({
                status: 'failed',
                message: 'At least one of content, image, or video is required',
            });
        }

        // Assuming you have a model for ReplyInReply
        const replyInReplyCreate = await new ReplyInReply({
            userId,
            commentId,
            commentReplyId,
            replyInReplyContent: replyInReplyContent ? replyInReplyContent : null,
            // Assign image filename if found, else null
            image: imageFile ? imageFile.filename : null,
            // Assign video filename if found, else null
            video: videoFile ? videoFile.filename : null,
        }).save();

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
        const replyInReplyGet = await ReplyInReply.findById(id);

        res.status(200).json({
            status: "Success",
            data: replyInReplyGet
        })
    } catch (error) {
        res.status(404).json({
            status: "failed",
            message: error.message
        })
    }
}

// update ReplyInReply======================
const updateReplyInReply = async (req, res) => {
    try {
        const id = req.params.id;
        const replyInReplyContent = req.body;

        const replyInReply = await ReplyInReply.findById(id);

        if (!replyInReply) {
            res.status(404).json({
                status: 'failed',
                message: 'Reply in reply is not found',
            });
            return;
        }

        const replyInReplyUpdate = await ReplyInReply.updateOne({
            _id: id,
        }, {
            $set: replyInReplyContent,
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
        await ReplyInReply.deleteOne({
            _id: id
        })

        res.status(200).json({
            status: "Success",
            message: "Reply In Reply is Deleted"
        })
    } catch (error) {
        res.status(404).json({
            status: "Failed",
            message: error.message
        })
    }
}

module.exports = {
    createReplyInReply,
    getReplyInReply,
    updateReplyInReply,
    deleteReplyInReply
}
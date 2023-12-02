const cloudinary = require("../Helpers/Cloudinary");
const Comment = require("../Models/commentModel");
const CommentReply = require("../Models/commentReplyModel");
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
        console.log('Cloudinary upload result:', result);
        return {
            public_id: result.public_id,
            secure_url: result.secure_url,
        };
    } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        throw new Error(`Error uploading file to Cloudinary: ${error.message}`);
    }
};

// create comment reply=======================
const commentReplyCreate = async (req, res) => {
    try {
        const {
            commentReplyContent,
            postOwnerId
        } = req.body;
        const {
            commentId
        } = req.params;

        // Assuming userId is available in req.userId
        const userId = await userProfileModel.findOne({
            userId: req.userId
        });

        // Validate user existence
        if (!userId) {
            return res.status(404).json({
                status: 'failed',
                message: 'User not found',
            });
        }

        // Validate comment existence
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                status: 'failed',
                message: 'Comment not found',
            });
        }

        // Find the img_video file in the request
        const img_video = req.files ? req.files['img_video'] : null;

        // Check if at least one of content, image, or video is provided
        if (!commentReplyContent && !img_video) {
            return res.status(400).json({
                status: 'Fail',
                message: 'At least one of content, image, or video is required',
            });
        }

        // Upload img_video to Cloudinary if it exists
        let imgVideoUploadResult = null;
        if (img_video) {
            try {
                imgVideoUploadResult = await uploadToCloudinary(img_video);
            } catch (uploadError) {
                return res.status(500).json({
                    status: 'Fail',
                    message: 'Error uploading img_video to Cloudinary',
                    uploadError,
                });
            }
        }


        // Create the comment reply object
        const newCommentReply = await CommentReply.create({
            userId: userId._id, // Assuming userId is an object with _id field
            commentId,
            commentReplyContent: commentReplyContent || null,
            img_video: imgVideoUploadResult ? imgVideoUploadResult.secure_url : null,
        });

        // Create a new notification
        const newNotification = new Notification({
            userId: postOwnerId,
            message: 'You have a new Reply on your Comment.',
            type: 'CommentReply',
            senderId: userId._id, // Assuming userId is an object with _id field
        });

        await newNotification.save();

        return res.status(201).json({
            status: 'Success',
            data: newCommentReply,
        });
    } catch (error) {
        console.error('Unexpected error in commentReplyCreate:', error);
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
        const commentReplyGet = await CommentReply.findById(id);
        if (!commentReplyGet) {
            res.status(404).json({
                status: 'failed',
                message: 'Coment Reply not found',
            });
            return;
        }

        res.status(200).json({
            status: "Success",
            data: commentReplyGet
        })
    } catch (error) {
        res.status(404).json({
            status: "failed",
            message: error.message
        })
    }
}

// update comment reply======================
const updateCommentReply = async (req, res) => {
    try {
        const id = req.params.id;
        const commentReplyContent = req.body;

        const commentReply = await CommentReply.findById(id);

        if (!commentReply) {
            res.status(404).json({
                status: 'failed',
                message: 'Coment Reply not found',
            });
            return;
        }

        const commentReplyUpdate = await CommentReply.updateOne({
            _id: id,
        }, {
            $set: commentReplyContent,
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


// delete commentReply=====================
const deleteCommentReply = async (req, res) => {
    try {
        const id = req.params.id;
        await CommentReply.deleteOne({
            _id: id
        });

        // delete replyInReply================
        await ReplyInReply.deleteMany({
            commentReplyId: id
        });

        res.status(200).json({
            status: "Success",
            message: "Comment Reply is Deleted"
        })
    } catch (error) {
        res.status(404).json({
            status: "Failed",
            message: error.message
        })
    }
}

module.exports = {
    commentReplyCreate,
    getCommentReply,
    updateCommentReply,
    deleteCommentReply
}
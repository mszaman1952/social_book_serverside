const userModel = require("../Models/User_Model");
const Comment = require("../Models/commentModel");
const CommentReply = require("../Models/commentReplyModel");
const ReplyInReply = require("../Models/replyInReplyModel");
const { clientError } = require("./error");

// create comment reply=======================
const commentReplyCreate = async (req, res) => {
    try {
        const {
            userId,
            commentId,
            commentReplyContent
        } = req.body;

        // validation check ===============================
        const user = await userModel.findById(userId);
        const comment = await Comment.findById(commentId);

        if (!user || !comment) {
            res.status(404).json({
                status: 'failed',
                message: 'User or comment not found',
            });
            return;
        }
                
         // Find the image file 
         const imageFile = req.files.find(file => file.fieldname === 'image');

         // Find the video file
         const videoFile = req.files.find(file => file.fieldname === 'video');
 
         // Check if at least one of content, image, or video is provided
         if (!commentReplyContent && !imageFile && !videoFile) {
             return await clientError(res, 400, 'At least one of content, image, or video is required');
         }
 
        const createCommentReply = await CommentReply({
            userId,
            commentId,
            commentReplyContent : commentReplyContent?commentReplyContent: null,
            // Assign image filename if found, else null
            image: imageFile ? imageFile.filename : null,
            // Assign video filename if found, else null
            video: videoFile ? videoFile.filename : null,
        }).save();

        res.status(201).json({
            status: "Success",
            data: createCommentReply
        })
    } catch (error) {

        res.status(404).json({
            status: "failed",
            message: error.message
        })
    }
}

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
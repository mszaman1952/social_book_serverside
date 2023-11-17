const Comment = require("../Models/commentModel");
const mongoose = require('mongoose')

const createComment = async (req, res) => {
    try {
        const {userId, postId, commentContent} = req.body;
        const newComment = await Comment({
            userId,
            postId,
            commentContent
        }).save()

        res.status(201).json({
            status : 'Success',
            data : newComment
        })
    } catch (error) {
        res.status(500).json({
            status : false,
            message : error.message
        })
    }
}

const readComment = async (req, res) => {
    try {
        const commentId =new mongoose.Types.ObjectId(req.params.id); // create a new ObjectId

        const commentRead = await Comment.findById(commentId)

        res.status(200).json({
            status : "Success",
            commentRead
        })

    } catch (error) {
        res.status(500).json({
            status : false,
            message : error.message
        })
    }
}

const updateComment = async(req, res) => {
    try {
        const commentId = req.params.id;
        const commentContent = req.body;
    
        const updatedCommentData = await Comment.findByIdAndUpdate(
          commentId,
          commentContent,
          { new: true }
        );
    
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

const deleteComment = async(req, res) => {
    try {
        const commentId = req.params.id;
        await Comment.deleteOne({_id :commentId});

        res.status(200).json({
            status : "Success",
            message : "Comment Delete is Successfully"
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
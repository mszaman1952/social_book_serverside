const { default: mongoose } = require("mongoose");
const CommentReply = require("../Models/commentReplyModel");

const commentReplyCreate = async(req, res) => {
    try {
        const {userId, commentId, commentReplyContent} = req.body;
        const createCommentReply = await CommentReply({
            userId,
            commentId,
            commentReplyContent
        }).save();

        res.status(201).json({
            status : "Success",
            data : createCommentReply
        })
    } catch (error) {
        res.status(404).json({
            status : "failed",
            message : error.message
        })
    }
}

// get comment 
const getCommentReply = async (req, res) => {
    try {
        const commentReplyId = req.params.id;
        const commentReplyGet = await CommentReply.findById(commentReplyId);

        res.status(200).json({
            status : "Success",
            data : commentReplyGet
        })
    } catch (error) {
        res.status(404).json({
            status : "failed",
            message : error.message
        })
    }
}

const updateCommentReply = async (req, res) => {
    try {
      const commentReplyId = req.params.id;
      const commentReplyUpdates = req.body;
  
      const commentReplyUpdate = await CommentReply.updateOne({
        _id: commentReplyId,
      }, {
        $set: commentReplyUpdates,
      }, {
        new: true,
      });
  
      if (commentReplyUpdate.nModified === 0) {
        res.status(404).json({
          status: 'failed',
          message: 'Comment reply not found',
        });
        return;
      }
  
      res.json({
        status: 'success',
        data : commentReplyUpdate
      });
    } catch (error) {
      res.status(500).json({
        status: 'failed',
        message: error.message,
      });
    }
  };  

// delete commentReply
const deleteCommentReply = async(req,res) => {
    try {
        const commentReplyId = req.params.id;
        await CommentReply.deleteOne({_id : commentReplyId})

        res.status(200).json({
            status : "Success",
            message : "Comment Reply is Deleted"
        })
    } catch (error) {
        res.status(404).json({
            status : "Failed",
            message : error.message
        })
    }
}


module.exports = {
    commentReplyCreate,
    getCommentReply,
    updateCommentReply,
    deleteCommentReply
}
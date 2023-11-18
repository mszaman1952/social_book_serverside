const ReplyInReply = require("../Models/replyInReplyModel");

// createReplyInReply ===========================
const createReplyInReply = async(req, res) => {
    try {
        const {userId, commentId, commentReplyId, replyInReplyContent} = req.body;
        const replyInReplyCreate = await ReplyInReply({
            userId,
            commentId,
            commentReplyId,
            replyInReplyContent
        }).save();

        res.status(201).json({
            status : "Success",
            data : replyInReplyCreate
        })
    } catch (error) {
        res.status(404).json({
            status : "failed",
            message : error.message
        })
    }
}

// get replyInReply =========================
const getReplyInReply = async (req, res) => {
    try {
        const id = req.params.id;
        const replyInReplyGet = await ReplyInReply.findById(id);

        res.status(200).json({
            status : "Success",
            data : replyInReplyGet
        })
    } catch (error) {
        res.status(404).json({
            status : "failed",
            message : error.message
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
const deleteReplyInReply = async(req,res) => {
    try {
        const id = req.params.id;
        await ReplyInReply.deleteOne({_id : id})

        res.status(200).json({
            status : "Success",
            message : "Reply In Reply is Deleted"
        })
    } catch (error) {
        res.status(404).json({
            status : "Failed",
            message : error.message
        })
    }
}


module.exports = {
    createReplyInReply,
    getReplyInReply,
    updateReplyInReply,
    deleteReplyInReply
}
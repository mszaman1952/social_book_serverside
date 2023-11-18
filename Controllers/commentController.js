const Comment = require("../Models/commentModel");
const CommentReply = require("../Models/commentReplyModel");
const ReplyInReply = require("../Models/replyInReplyModel");

// create comment =====================
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

// read Comment ===========================

const readComment = async (req, res) => {
    try {
        const id = req.params.id; 

        const commentRead = await Comment.findById(id)
        if(!commentRead){
            res.status(404).json({
                status: 'failed',
                message: 'Coment not found',
              });
              return;
        }

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

// update Comment=====================

const updateComment = async(req, res) => {
    try {
        const id = req.params.id;
        const commentContent = req.body;

        const comment = await Comment.findById(id);
        if(!comment){
            res.status(404).json({
                status: 'failed',
                message: 'Comment is Not Found',
              });
              return;
        }
    
        const updatedCommentData = await Comment.findByIdAndUpdate(
          id,
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

// comment delete =========================
const deleteComment = async(req, res) => {
    try {
        const id = req.params.id;
        await Comment.deleteOne({_id : id});

        // comment Reply deleted
        await CommentReply.deleteMany({commentId : id})
        
        // ReplyInReply/Nested Reply Deleted
        await ReplyInReply.deleteMany({commentId : id});
        console.log(await ReplyInReply.deleteMany({commentReplyId : id}))

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
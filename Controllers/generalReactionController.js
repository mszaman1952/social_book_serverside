// const userModel = require("../Models/User_Model");
const Comment = require("../Models/commentModel");
const CommentReply = require("../Models/commentReplyModel");
const GeneralReaction = require("../Models/generalReactionModel");
const Post = require("../Models/postModel");
const ReplyInReply = require("../Models/replyInReplyModel");
const userProfileModel = require("../Models/user_profile_Model");

// Add or remove reaction based on user's click
const toggleReaction = async (req, res) => {
    try {
        const {
            userId,
            targetType,
            targetId,
            type
        } = req.body;

        // Check if the user has already reacted
        const existingReaction = await GeneralReaction.findOne({
            userId,
            targetType,
            targetId
        });

        // Check if the user exists in the database
        const user = await userProfileModel.findOne({
            _id: userId
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }


        if (existingReaction) {
            // If the user has already reacted, check if it's the same reaction type
            if (existingReaction.type === type) {
                // If it's the same reaction type, remove the reaction
                await existingReaction.deleteOne();
                res.status(200).json({
                    success: true,
                    message: 'Reaction removed successfully'
                });
            } else {
                // If it's a different reaction type, update the existing reaction
                existingReaction.type = type;
                await existingReaction.save();
                res.status(200).json({
                    success: true,
                    message: 'Reaction updated successfully'
                });
            }
        } else {
            // If the user hasn't reacted yet, add a new reaction
            await GeneralReaction.create({
                userId,
                targetType,
                targetId,
                type
            });
            res.status(200).json({
                success: true,
                message: 'Reaction added successfully'
            });
        }

        // Update reaction count based on targetType
        if (targetType === 'Post') {
            await updatePostReactionCount(targetId);
        } else if (targetType === 'Comment') {
            await updateCommentReactionCount(targetId);
        } else if (targetType === 'CommentReply') {
            await updateCommentReplyReactionCount(targetId);
        } else if (targetType === 'ReplyInReply') {
            await updateReplyInReplyReactionCount(targetId);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to update reaction'
        });
    }
};

// Helper function to update post reaction count
const updatePostReactionCount = async (postId) => {
    const reactionCount = await GeneralReaction.countDocuments({
        targetType: 'Post',
        targetId: postId
    });
    await Post.findByIdAndUpdate(postId, {
        $set: {
            reactionCount
        }
    });
};

// Helper function to update comment reaction count
const updateCommentReactionCount = async (commentId) => {
    const reactionCount = await GeneralReaction.countDocuments({
        targetType: 'Comment',
        targetId: commentId
    });
    await Comment.findByIdAndUpdate(commentId, {
        $set: {
            reactionCount
        }
    });
};

// Helper function to update reply reaction count
const updateCommentReplyReactionCount = async (commentReplyId) => {
    const reactionCount = await GeneralReaction.countDocuments({
        targetType: 'CommentReply',
        targetId: commentReplyId
    });
    await CommentReply.findByIdAndUpdate(commentReplyId, {
        $set: {
            reactionCount
        }
    });
};

// Helper function to update nested reply reaction count
const updateReplyInReplyReactionCount = async (nestedReplyId) => {
    const reactionCount = await GeneralReaction.countDocuments({
        targetType: 'ReplyInReply',
        targetId: nestedReplyId
    });
    await ReplyInReply.findByIdAndUpdate(nestedReplyId, {
        $set: {
            reactionCount
        }
    });
};

// Get specific reactions for a target==========================
// const getSpecificReactions = async (req, res) => {
//     try {
//         const {
//             targetType,
//             targetId
//         } = req.body;

//         const reactions = await GeneralReaction.find({
//             targetType,
//             targetId
//         });

//         // finding targeted id for validation check==========
//         const post = await Post.findOne({
//             _id: targetId
//         });
//         const comment = await Comment.findOne({
//             _id: targetId
//         });
//         const reply = await CommentReply.findOne({
//             _id: targetId
//         });
//         const nestedReply = await ReplyInReply.findOne({
//             _id: targetId
//         });

//         // validation check ================================
//         if (!post && !comment && !reply && !nestedReply) {
//             return res.status(404).json({
//                 status: "Failed",
//                 message: "Target ID Not Found..."
//             });
//         }

//         // Convert reactions to an array of objects
//         const reactionArray = reactions.reduce((acc, reaction) => {
//             if (!acc.some((obj) => obj.type === reaction.type)) {
//                 acc.push({
//                     type: reaction.type,
//                     count: 1,
//                 });
//             } else {
//                 const existingReaction = acc.find((obj) => obj.type === reaction.type);
//                 existingReaction.count += 1;
//             }
//             return acc;
//         }, []);

//         res.status(200).json({
//             success: true,
//             data: reactionArray
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch specific reactions'
//         });
//     }
// };

// const getSpecificReactions = async (req, res) => {
//     try {
//         const { targetType, targetId } = req.body;

//         // Fetch reactions based on targetType and targetId
//         const reactions = await GeneralReaction.find({
//             targetType,
//             targetId
//         });

//         // Finding targeted id for validation check
//         const post = await Post.findOne({ _id: targetId });
//         const comment = await Comment.findOne({ _id: targetId });
//         const reply = await CommentReply.findOne({ _id: targetId });
//         const nestedReply = await ReplyInReply.findOne({ _id: targetId });

//         // Validation check
//         if (!post && !comment && !reply && !nestedReply) {
//             return res.status(404).json({
//                 status: "Failed",
//                 message: "Target ID Not Found..."
//             });
//         }

//         // Create an object to store user-specific reaction counts for each type
//         const reactionTypeCounts = {};

//         // Iterate through reactions to track user-specific counts for each type
//         reactions.forEach((reaction) => {
//             const { userId, type } = reaction;

//             if (!reactionTypeCounts[type]) {
//                 reactionTypeCounts[type] = {};
//             }

//             if (!reactionTypeCounts[type][userId]) {
//                 reactionTypeCounts[type][userId] = 1;
//             } else {
//                 reactionTypeCounts[type][userId] += 1;
//             }
//         });

//         // Create a sorted list of users for each reaction type and count
//         const sortedUserLists = {};
//         for (const type in reactionTypeCounts) {
//             sortedUserLists[type] = await Promise.all(
//                 Object.keys(reactionTypeCounts[type])
//                     .sort((a, b) => reactionTypeCounts[type][b] - reactionTypeCounts[type][a])
//                     .slice(0, 10) // Limit to the top ten users for each type
//                     .map(async (userId) => {
//                         const user = await userProfileModel.findOne({ _id: userId });
//                         return { userId, userName: user ? user.userName : 'Unknown' };
//                     })
//             );
//         }

//         res.status(200).json({
//             success: true,
//             data: sortedUserLists
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch specific reactions'
//         });
//     }
// };
const getSpecificReactions = async (req, res) => {
    try {
        const { targetType, targetId } = req.body;

        // Fetch reactions based on targetType and targetId
        const reactions = await GeneralReaction.find({
            targetType,
            targetId
        });

        // Finding targeted id for validation check
        const post = await Post.findOne({ _id: targetId });
        const comment = await Comment.findOne({ _id: targetId });
        const reply = await CommentReply.findOne({ _id: targetId });
        const nestedReply = await ReplyInReply.findOne({ _id: targetId });

        // Validation check
        if (!post && !comment && !reply && !nestedReply) {
            return res.status(404).json({
                success: false,
                message: "Target ID Not Found"
            });
        }

        // Create an object to store user-specific reaction counts for each type
        const reactionTypeCounts = {};

        // Iterate through reactions to track user-specific counts for each type
        reactions.forEach((reaction) => {
            const { userId, type } = reaction;

            if (!reactionTypeCounts[type]) {
                reactionTypeCounts[type] = {};
            }

            if (!reactionTypeCounts[type][userId]) {
                reactionTypeCounts[type][userId] = 1;
            } else {
                reactionTypeCounts[type][userId] += 1;
            }
        });

        // Calculate the total count for each reaction type
        const totalCounts = {};
        for (const type in reactionTypeCounts) {
            totalCounts[type] = Object.values(reactionTypeCounts[type]).reduce((sum, count) => sum + count, 0);
        }

        // Create a sorted list of users for each reaction type with counts and usernames
        const sortedUserLists = {};
        const reactionTypesOrder = Object.keys(reactionTypeCounts);
        for (const type of reactionTypesOrder) {
            const users = await Promise.all(
                Object.keys(reactionTypeCounts[type])
                    .sort((a, b) => reactionTypeCounts[type][b] - reactionTypeCounts[type][a])
                    .map(async (userId) => {
                        const user = await userProfileModel.findOne({ _id: userId });
                        return user ? user.userName : 'Unknown';
                    })
            );
            sortedUserLists[type] = {
                totalCount: totalCounts[type],
                users
            };
        }

        res.status(200).json({
            success: true,
            data: sortedUserLists
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch specific reactions',
            error: error.message
        });
    }
};



// get all reactions....====================================

const getTotalReactionsCount = async (req, res) => {
    try {
        const {
            targetType,
            targetId
        } = req.body;
        const totalReactionsCount = await GeneralReaction.countDocuments({
            targetType,
            targetId
        });

        // finding targeted id for validation check==========
        const post = await Post.findOne({
            _id: targetId
        });
        const comment = await Comment.findOne({
            _id: targetId
        });
        const reply = await CommentReply.findOne({
            _id: targetId
        });
        const nestedReply = await ReplyInReply.findOne({
            _id: targetId
        });

        // validation check ================================
        if (!post && !comment && !reply && !nestedReply) {
            return res.status(404).json({
                status: "Failed",
                message: "Target ID Not Found..."
            });
        }

        res.status(200).json({
            success: true,
            data: {
                totalReactionsCount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch total reactions count'
        });
    }
};

module.exports = {
    toggleReaction,
    getSpecificReactions,
    getTotalReactionsCount
}
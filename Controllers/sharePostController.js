const postModel = require('../Models/postModel');
const Share = require('../Models/shareModel');
const userProfileModel = require('../Models/user_profile_Model');

const sharePost = async (req, res) => {
    try {
        const { postId, targetUserId, currentUserId } = req.body;

        // Check if the post exists
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the target user exists (for user-specific timelines)
        const targetUserExists = await userProfileModel.exists({ _id: targetUserId });
        if (!targetUserExists && targetUserId) {
            return res.status(404).json({ error: 'Target user not found' });
        }

        // Check if the user has already shared the post
        const hasShared = Array.isArray(post.shares) && post.shares.some((share) => share.user && share.user.equals(currentUserId));

        if (hasShared) {
            return res.status(400).json({ error: 'You have already shared this post' });
        }

        // Create a new PostShare instance
        const newPostShare = new Share({
            post: post._id,
            user: currentUserId,
        });

        // Save the new PostShare instance
        await newPostShare.save();

        // Update the post with the new share information
        if (!Array.isArray(post.shares)) {
            post.shares = [];
        }

        post.shares.push(newPostShare._id);
        post.shareCount++;

        // Save the updated post
        await post.save();

        // Send the response
        res.status(200).json({ message: 'Post shared successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error sharing post' });
    }
};

module.exports = {
    sharePost,
};

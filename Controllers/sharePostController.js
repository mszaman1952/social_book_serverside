const Post = require('../Models/postModel');
const Share = require('../Models/shareModel'); // Only if you created a separate Share model

const sharePost = async (req, res) => {
    try {
        const {
            postId
        } = req.body;
        const currentUserId = req.user.id;

        // Check if the post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        // Check if the user has already shared the post
        const hasShared = post.shares.some((share) => share.user.equals(currentUserId));
        if (hasShared) {
            return res.status(400).json({
                error: 'You have already shared this post'
            });
        }

        // Create a new share instance (Only if you created a separate Share model)
        const newShare = new Share({
            post: post._id,
            user: currentUserId
        });
        await newShare.save();

        // Add the new share to the post's shares array
        post.shares.push(newShare._id);

        // Increment the post's share count
        post.shareCount++;

        // Save the updated post
        await post.save();

        // Send the updated post
        res.status(200).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sharing post');
    }
};

module.exports = {
    sharePost
};
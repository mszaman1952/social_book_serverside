const Follow = require("../Models/followModel");
const userProfileModel = require("../Models/user_profile_Model");

const followUser = async (req, res) => {
    try {

        const {
            followerId,
            followingId
        } = req.body;

        // validation check================
        const followId = await userProfileModel.findById(followerId);
        const following = await userProfileModel.findById(followingId);

        if (!followId || !following) {
            res.status(404).json({
                status: "Failed",
                message: "Follower Id or Following doesn't exist...",
            });
        }


        // Check if the user is trying to follow themselves
        if (followerId === followingId) {
            return res.json({
                success: false,
                message: 'Cannot follow yourself'
            });
        }

        // Check if the follow relationship already exists
        const existingFollow = await Follow.findOne({
            follower: followerId,
            following: followingId
        });
        if (existingFollow) {
            return res.json({
                success: false,
                message: 'Already following this user'
            });
        }

        // Create a new follow relationship
        const follow = new Follow({
            follower: followerId,
            following: followingId
        });
        await follow.save();

        // Update the follower's and following user's arrays in the User model
        await userProfileModel.findByIdAndUpdate(followerId, {
            $push: {
                following: followingId
            }
        });
        await userProfileModel.findByIdAndUpdate(followingId, {
            $push: {
                followers: followerId
            }
        });

        res.json({
            success: true,
            message: 'Followed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const {
            followerId,
            followingId
        } = req.body;

        // Find and delete the follow relationship
        const result = await Follow.deleteOne({
            follower: followerId,
            following: followingId
        });

        if (result.deletedCount > 0) {
            // Update the follower's and following user's arrays in the User model
            await userProfileModel.findByIdAndUpdate(followerId, {
                $pull: {
                    following: followingId
                }
            });
            await userProfileModel.findByIdAndUpdate(followingId, {
                $pull: {
                    followers: followerId
                }
            });

            res.json({
                success: true,
                message: 'Unfollowed successfully'
            });
        } else {
            res.json({
                success: false,
                message: 'Not following this user'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};

// get all followers========================================
const getAllFollowers = async (req, res) => {
    try {
        const {
            userId
        } = req.params;

        // Validate the user ID
        const user = await userProfileModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Get the followers for the user
        const followers = await Follow.find({
            following: userId
        }).populate('follower', 'userName');

        res.json({
            success: true,
            // followers: followers.map((follow) => follow.follower),
            followers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

// get all following ========================================= 
const getAllFollowing = async (req, res) => {
    try {
        const {
            userId
        } = req.params;

        // Validate the user ID
        const user = await userProfileModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Get the users the specified user is following
        const following = await Follow.find({
            follower: userId
        }).populate('following', 'userName');

        res.json({
            success: true,
            // following: following.map((follow) => follow.following),
            following
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getAllFollowers,
    getAllFollowing
};
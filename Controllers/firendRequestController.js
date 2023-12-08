const userProfileModel = require('../Models/user_profile_Model');
const FriendRequest = require('../Models/friendRequestModel');
const Notification = require('../Models/notificationModel');

// send friend request ================================

const sendFriendRequest = async (req, res) => {
    try {
        const {
            senderId,
            receiverId
        } = req.body;

        // Check if the sender and receiver exist

        const sender = await userProfileModel.findById(senderId);
        const receiver = await userProfileModel.findById(receiverId)
        // Check if the sender and receiver are the same user
        if (senderId === receiverId) {
            return res.status(400).json({
                status: 'failed',
                message: 'Cannot send friend request to yourself',
            });
        }

        if (!sender || !receiver) {
            return res.status(404).json({
                status: 'failed',
                message: 'Sender or receiver not found',
            });
        }

        // Check if the users are already friends
        if (sender.friends.includes(receiverId) || receiver.friends.includes(senderId)) {
            return res.status(400).json({
                status: 'failed',
                message: 'Users are already friends',
            });
        }

        // Check if there is an existing friend request
        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            receiver: receiverId,
        });

        if (existingRequest) {
            return res.status(400).json({
                status: 'failed',
                message: 'Friend request already sent',
            });
        }

        // Create a new friend request
        const friendRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId,
        });

        await friendRequest.save();

        // Create a notification for the receiver
        const notification = new Notification({
            userId: receiverId,
            message: `${sender.userName} sent you a friend request.`,
            type: 'FriendRequest',
            senderId: senderId,
        });

        await notification.save();


        // Check if the sender has already received a friend request from the receiver
        const hasReceivedRequest = sender.friendRequests.some((requestId) =>
            receiver.sentFriendRequests.includes(requestId)
        );

        if (hasReceivedRequest) {
            return res.status(400).json({
                status: 'failed',
                message: 'Already received a friend request from the sender',
            });
        }

        // Update sender's and receiver's friendRequests arrays
        receiver.friendRequests.push(friendRequest._id);
        await receiver.save();

        // Update sender's sentFriendRequests array
        sender.sentFriendRequests.push(friendRequest._id);
        await sender.save();

        res.status(201).json({
            status: 'success',
            message: 'Friend request sent successfully',
            data: friendRequest,
        });
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: error.message,
        });
    }
};

// accept friend request ==========================
const acceptFriendRequest = async (req, res) => {
    try {
        const {
            userId,
            friendRequestId
        } = req.body;

        // Find the user who is accepting the friend request
        const acceptingUser = await userProfileModel.findById(userId);

        // Check if the user exists
        if (!acceptingUser) {
            return res.status(404).json({
                status: 'failed',
                message: 'User not found',
            });
        }

        // Find the friend request in the database
        const friendRequest = await FriendRequest.findById(friendRequestId);

        // Check if the friend request exists
        if (!friendRequest) {
            return res.status(404).json({
                status: 'failed',
                message: 'Friend request not found',
            });
        }

        // Check if the friend request is already accepted
        if (friendRequest.status === 'accepted') {
            return res.status(400).json({
                status: 'failed',
                message: 'Friend request already accepted',
            });
        }

        // Check if the accepting user is already a friend of the sender
        if (acceptingUser.friends.includes(friendRequest.sender)) {
            return res.status(400).json({
                status: 'failed',
                message: 'You are already friends with this user',
            });
        }

        // Update accepting user's friend list
        acceptingUser.friends.push(friendRequest.sender);

        // Remove friendRequestId from the accepting user's friendRequests array
        acceptingUser.friendRequests = acceptingUser.friendRequests.filter(
            (requestId) => requestId.toString() !== friendRequestId
        );

        // Save the changes
        await acceptingUser.save();

        // Update sender's friend list
        const senderUser = await userProfileModel.findById(friendRequest.sender);
        senderUser.friends.push(acceptingUser.id);

        // Remove friendRequestId from the sender's friendRequests array
        senderUser.sentFriendRequests = senderUser.sentFriendRequests.filter(
            (requestId) => requestId.toString() !== friendRequestId
        );

        // Save the changes
        await senderUser.save();

        // Set the friend request status to 'accepted'
        friendRequest.status = 'accepted';
        await friendRequest.save();

        // Remove friend request from the database
        await FriendRequest.findByIdAndRemove(friendRequestId);

        res.status(200).json({
            status: 'success',
            message: 'Friend request accepted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'failed',
            message: error.message,
        });
    }
};


// reject friend request ================================
const rejectFriendRequest = async (req, res) => {
    try {
        const {
            userId,
            friendRequestId
        } = req.body;

        // Find the user who is rejecting the friend request
        const rejectingUser = await userProfileModel.findById(userId);

        // Check if the user exists
        if (!rejectingUser) {
            return res.status(404).json({
                status: 'failed',
                message: 'User not found',
            });
        }

        // Find the friend request in the database
        const friendRequest = await FriendRequest.findById(friendRequestId);

        // Check if the friend request exists
        if (!friendRequest) {
            return res.status(404).json({
                status: 'failed',
                message: 'Friend request not found',
            });
        }

        // Check if the friend request is already accepted or rejected
        if (friendRequest.status === 'accepted' || friendRequest.status === 'rejected') {
            return res.status(400).json({
                status: 'failed',
                message: 'Friend request already processed',
            });
        }

        // Remove friendRequestId from the rejecting user's friendRequests array
        rejectingUser.friendRequests = rejectingUser.friendRequests.filter(
            (requestId) => requestId.toString() !== friendRequestId
        );

        // Save the changes
        await rejectingUser.save();

        // Remove friendRequestId from the sender's friendRequests array
        const senderUser = await userProfileModel.findById(friendRequest.sender);
        senderUser.sentFriendRequests = senderUser.sentFriendRequests.filter(
            (requestId) => requestId.toString() !== friendRequestId
        );

        // Save the changes
        await senderUser.save();

        // Set the friend request status to 'rejected'
        friendRequest.status = 'rejected';
        await friendRequest.save();

        // Remove friend request from the database
        await FriendRequest.findByIdAndRemove(friendRequestId);

        res.status(200).json({
            status: 'success',
            message: 'Friend request rejected successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'failed',
            message: error.message,
        });
    }
};

// unfriend controller ============================
const unfriend = async (req, res) => {
    try {
        const {
            userId,
            friendId
        } = req.body;

        // Find the user and friend by their IDs
        const user = await userProfileModel.findById(userId);
        const friend = await userProfileModel.findById(friendId);

        // Check if both users exist
        if (!user || !friend) {
            return res.status(404).json({
                status: 'failed',
                message: 'User or friend not found',
            });
        }
        if (!user.friends.includes(friendId)) {
            return res.status(400).json({
                status: 'failed',
                message: 'Users are not friends',
            });
        }

        // Remove friendId from the user's friends array
        user.friends = user.friends.filter((friendInList) => friendInList.toString() !== friendId);

        // Remove userId from the friend's friends array
        friend.friends = friend.friends.filter((userInList) => userInList.toString() !== userId);

        // Save the changes
        await user.save();
        await friend.save();

        res.status(200).json({
            status: 'success',
            message: 'Unfriended successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'failed',
            message: error.message,
        });
    }
};

// get all friends =================================
const getAllFriends = async (req, res) => {
    try {
        const {
            userId
        } = req.body;
        // Find the user by ID and join with friends
        const user = await userProfileModel.findById(userId)
            .populate('friends')
            .exec();
        // Check if the user exists
        if (!user) {
            return res.status(404).json({
                status: 'failed',
                message: 'User not found',
            });
        }

        const friends = (user?.friends).map((friend) => ({
            _id: friend._id,
            userName: friend.userName,
        }));
        // Check if the user has friends
        if (!user.friends) {
            return res.status(200).json({
                status: 'success',
                message: 'User has no friends',
                data: friends,
            });
        }

        res.status(200).json({
            status: 'success',
            data: friends,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'failed',
            message: error.message,
        });
    }
};

// get all friend request ========================

const getAllFriendRequestsReceived = async (req, res) => {
    try {
        const {
            userId
        } = req.body;

        // Find the user by ID and populate the 'friendRequests' field
        const user = await userProfileModel.findById(userId).populate('friendRequests');

        // Check if the user exists
        if (!user) {
            return res.status(404).json({
                status: 'failed',
                message: 'User not found',
            });
        }

        // Extract and send the friend requests data with detailed information
        const friendRequests = user.friendRequests || [];

                // Check if friendRequests is empty or null
                if (friendRequests.length===0) {
                    return res.status(400).json({
                        status: 'failed',
                        message: 'No friend requests found for the user',
                    });
                }
        
            // Map friendRequests to include only id and userName
            const friendRequestsData = friendRequests.map(friend => ({
                id: friend.id,
                userName: friend.userName,
            }));

        res.status(200).json({
            status: 'success',
            data: friendRequestsData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'failed',
            message: error.message,
        });
    }
};

// get sent friend request ===================================

const getSentFriendRequests = async (req, res) => {
    try {
        const {
            userId
        } = req.body;

        // Find the user by ID and populate the 'sentFriendRequests' field
        const user = await userProfileModel.findById(userId).populate('sentFriendRequests');

        // Check if the user exists
        if (!user) {
            return res.status(404).json({
                status: 'failed',
                message: 'User not found',
            });
        }

        // Extract and send the sent friend requests data with detailed information
        const sentFriendRequests = user.sentFriendRequests || [];

        // Check if friendRequests is empty or null
        if (sentFriendRequests.length===0) {
            return res.status(400).json({
                status: 'failed',
                message: 'No Sent friend requests found for the user',
            });
        }

    // Map friendRequests to include only id and userName
    const sentfriendRequestsData = sentFriendRequests.map(friend => ({
        id: friend.id,
        userName: friend.userName,
    }));

        res.status(200).json({
            status: 'success',
            data: sentfriendRequestsData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'failed',
            message: error.message,
        });
    }
};


// cancell sent friend request ============================= 

const cancelSentFriendRequest = async (req, res) => {
    try {
        const {
            senderId,
            friendRequestId
        } = req.body;

        // Get information about the sender from the model
        const sender = await userProfileModel.findById(senderId);

        if (!sender) {
            return res.status(404).json({
                status: 'failed',
                message: 'Sender not found',
            });
        }

        // Find and remove the friend request sent by the sender
        const friendRequest = await FriendRequest.findByIdAndRemove(friendRequestId);

        if (!friendRequest) {
            return res.status(400).json({
                status: 'failed',
                message: 'No friend request found to cancel',
            });
        }

        // Remove the friend request ID from the sender's sentFriendRequests array
        sender.sentFriendRequests = sender.sentFriendRequests.filter(id => id.toString() !== friendRequest._id.toString());

        // Get information about the receiver from the model
        const receiver = await userProfileModel.findById(friendRequest.receiver);

        if (receiver) {
            // Remove the friend request ID from the receiver's friendRequests array
            receiver.friendRequests = receiver.friendRequests.filter(id => id.toString() !== friendRequest._id.toString());
            await receiver.save();
        }

        await sender.save();

        res.status(200).json({
            status: 'success',
            message: 'Sent friend request canceled successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'failed',
            message: error.message,
        });
    }
};


// find friends controller ==========================

const findFriends = async (req, res) => {
    try {
        const {
            searchQuery
        } = req.body;

        // Use a MongoDB query to find friends based on the search criteria
        const friends = await userProfileModel.find(
            {
                $or: [
                    {
                        userName: {
                            $regex: searchQuery,
                            $options: 'i'
                        }
                    },
                    {
                        email: {
                            $regex: searchQuery,
                            $options: 'i'
                        }
                    },
                ],
            },
            // Projection to include only userId and userName
            { userId: 1, userName: 1, _id: 0 }
        );

// Check if no friends are found
if (friends.length === 0) {
    return res.status(404).json({
        success: false,
        message: 'No friends found matching the search criteria'
    });
}

        res.status(200).json({
            success: true,
            data: friends
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to find friends'
        });
    }
};

// get mutual friends ========================================
const getMutualFriends = async (req, res) => {
    try {
        const {
            userId1,
            userId2
        } = req.params;

        // Fetch user data for both users
        const user1 = await userProfileModel.findById(userId1);
        const user2 = await userProfileModel.findById(userId2);

        if (!user1 || !user2) {
            return res.status(404).json({
                error: 'Users not found'
            });
        }

        // Find common friends by comparing friend lists
        const mutualFriendsIds = user1.friends.filter(friendId =>
            user2.friends.includes(friendId)
        );

        // Fetch mutual friends' information, including id and name
        const mutualFriendsInfo = await userProfileModel.find({
                _id: {
                    $in: mutualFriendsIds
                }
            })
            .select('_id')
            .select("userName");

        res.status(200).json(mutualFriendsInfo);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching mutual friends');
    }
};

// people you know me===================================
const peopleYouKnowMe = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user
        const currentUser = await userProfileModel.findOne({ _id: userId });

        if (!currentUser) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        // Get the current user's friends
        const currentFriends = currentUser.friends || [];

        // Get the current user's sent and received friend requests
        const sentFriendRequests = await FriendRequest.find({
            sender: userId,
        });
        const receivedFriendRequests = await FriendRequest.find({
            receiver: userId,
        });

        // Combine friend requests to get all pending requests
        const allFriendRequests = [...sentFriendRequests, ...receivedFriendRequests];

        // Extract user ids from friend requests
        const friendRequestUserIds = allFriendRequests.map((request) => request.sender.toString());

        // Find people who are not friends and not in friend requests
        const potentialFriends = await userProfileModel
            .find({
                _id: { $ne: userId },
                _id: { $nin: currentFriends },
                _id: { $nin: friendRequestUserIds },
            })
            .limit(10);

        // Simplify the response to only id and userName
        const simplifiedResponse = potentialFriends.map((user) => ({
            _id: user._id,
            userName: user.userName,
        }));

        res.json(simplifiedResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error',
        });
    }
};

// remove from people you may know me ==========================
const removeFromPeopleYouKnow = async (req, res) => {
    try {
        const { userId, removeUserId } = req.body;

        // Find the current user
        const currentUser = await userProfileModel.findOne({ _id: userId });

        if (!currentUser) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        // Ensure currentUser.peopleYouMayKnow is an array
        currentUser.peopleYouMayKnow = Array.isArray(currentUser.peopleYouMayKnow)
            ? currentUser.peopleYouMayKnow.filter((user) => user.toString() !== removeUserId)
            : [];

            // Check if the user was already removed
        if (currentUser.peopleYouMayKnow.length === 0) {
            return res.status(400).json({
                error: 'User already removed from People You May Know',
            });
        }

        await currentUser.save();

        res.json({
            success: true,
            message: 'User removed from People You May Know',
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
        });
    }
};


module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend,
    getAllFriends,
    getAllFriendRequestsReceived,
    getSentFriendRequests,
    cancelSentFriendRequest,
    findFriends,
    getMutualFriends,
    peopleYouKnowMe,
    removeFromPeopleYouKnow
};
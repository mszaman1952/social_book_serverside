
// const { default: mongoose } = require('mongoose');
const userModel = require('../Models/User_Model');
const FriendRequest = require('../Models/friendRequestModel');

// send friend request ================================

const sendFriendRequest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Check if the sender and receiver exist
    const sender = await userModel.findById(senderId);
    const receiver = await userModel.findById(receiverId);

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

    // Update sender's and receiver's friendRequests arrays
    sender.friendRequests.push(friendRequest._id);
    receiver.friendRequests.push(friendRequest._id);

    await sender.save();
    await receiver.save();

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

// accept friend request ===========================
const acceptFriendRequest = async (req, res) => {
  try {
    const { userId, friendRequestId } = req.body;

    // Find the user who is accepting the friend request
    const acceptingUser = await userModel.findById(userId);

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

    // Update accepting user's friend list
    acceptingUser.friends.push(friendRequest.sender);

    // Remove friendRequestId from the accepting user's friendRequests array
    acceptingUser.friendRequests = acceptingUser.friendRequests.filter(
      (requestId) => requestId.toString() !== friendRequestId
    );

    // Save the changes
    await acceptingUser.save();

    // Update sender's friend list
    const senderUser = await userModel.findById(friendRequest.sender);
    senderUser.friends.push(acceptingUser._id);

    // Remove friendRequestId from the sender's friendRequests array
    senderUser.friendRequests = senderUser.friendRequests.filter(
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
    const { userId, friendRequestId } = req.body;

    // Find the user who is rejecting the friend request
    const rejectingUser = await userModel.findById(userId);

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
    const senderUser = await userModel.findById(friendRequest.sender);
    senderUser.friendRequests = senderUser.friendRequests.filter(
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


module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
};

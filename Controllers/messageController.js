// const Message = require("../Models/messageModel");

// // Get all messages
// const getAllMessages = async (req, res) => {
//   try {
//     const messages = await Message.find().sort({ timestamp: 1 });
//     res.json(messages);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// // Add a new message
// const addMessage = async (data) => {
//   try {
//     const { sender, content } = data;
//     const newMessage = new Message({ sender, content });
//     await newMessage.validate(); // Validate the message before saving
//     await newMessage.save();

//     return newMessage;
//   } catch (error) { 
//     console.error('Error adding message:', error);
//     throw error;
//   }
// };

// module.exports = { getAllMessages, addMessage };

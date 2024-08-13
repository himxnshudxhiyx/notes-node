// controllers/chat.js

const admin = require('firebase-admin');
const db = require('../db/connect'); 

const createChatRoom = async (req, res) => {
    const { loggedInUserEmail, chatWithUserEmail, loggedInUserPhone, chatWithUserPhone } = req.body;

    try {
        // Create a unique chat room ID based on emails
        const chatRoomId = [loggedInUserPhone, chatWithUserPhone].sort().join('_');

        // Create chat room document
        const chatRoomRef = db.collection('chatRooms').doc(chatRoomId);
        await chatRoomRef.set({
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update both users' documents with the new chat room ID
        const usersRef = db.collection('users');
        await Promise.all([
            usersRef.doc(loggedInUserEmail).update({
                chatRooms: admin.firestore.FieldValue.arrayUnion(chatRoomId)
            }),
            usersRef.doc(chatWithUserEmail).update({
                chatRooms: admin.firestore.FieldValue.arrayUnion(chatRoomId)
            })
        ]);

        res.status(201).json({ chatRoomId, status: 201 });
    } catch (error) {
        res.status(500).send({ error: error.message, status: 500 });
    }
};

const chatRoomExists = async (req, res) => {

    const { chatRoomId } = req.body;

    if (!chatRoomId) {
      return res.status(400).json({ error: 'Chat room ID is required' , status: 400});
    }
  
    try {
      const chatRoomRef = db.collection('chatRooms').doc(chatRoomId);
      const doc = await chatRoomRef.get();
  
      if (doc.exists) {
        res.status(200).json({ exists: true , status: 200});
      } else {
        res.status(200).json({ exists: false , status: 200});
      }
    } catch (error) {
      console.error('Error checking chat room existence:', error);
      res.status(500).json({ error: 'Internal Server Error' , status: 500});
    }
}


module.exports = { createChatRoom, chatRoomExists };
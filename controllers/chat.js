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
            createdAt: new Date().toISOString()
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


const sendNotification = async (req, res) => {
    try {
        const { userEmail, message, from } = req.body;
    
        if (!userEmail || !message) {
          return res.status(400).json({ error: 'User email and message are required' , status: 400});
        }
    
        // Fetch device token associated with the userEmail
        const userSnapshot = await db.collection('users').doc(userEmail).get();
    
        if (!userSnapshot.exists) {
          return res.status(404).json({ error: 'User not found' , status: 404});
        }
    
        const userData = userSnapshot.data();
        const deviceToken = userData.fcmToken; // Assuming you have a deviceToken field
    
        if (!deviceToken) {
          return res.status(404).json({ error: 'Device token not found for this user' , status: 404});
        }
    
        // Send notification
        const messagePayload = {
          token: deviceToken,
          notification: {
            title: 'New Message from ' + from,
            body: message,
          },
        };
    
        await admin.messaging().send(messagePayload);
    
        res.status(200).json({ success: 'Notification sent successfully' , status: 200});
      } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ message: 'Failed to send notification', error:error , status: 500});
      }
}

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


module.exports = { createChatRoom, chatRoomExists, sendNotification };
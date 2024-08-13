// controllers/chat.js

// const WebSocket = require('ws');
// const server = new WebSocket.Server({ port: 8080 });

const admin = require('firebase-admin');
const db = require('../db/connect'); // Path to your Firebase initialization file

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

const sendMessage = async (req, res) => {

    const { chatRoomId, senderId, message } = req.body;

    try {
        const messageRef = db.collection('chatRooms').doc(chatRoomId).collection('messages').doc();
        await messageRef.set({
            senderId,
            message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).send('Message sent');
    } catch (error) {
        res.status(500).send(error.message);
    }
}


module.exports = { createChatRoom, sendMessage };

// Store client connections by chat room
// const chatRoomClients = {};

// server.on('connection', (ws, req) => {
//     console.log('New client connected');

//     // Extract chat room ID from query params
//     const chatRoomId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('chatRoomId');

//     if (!chatRoomClients[chatRoomId]) {
//         chatRoomClients[chatRoomId] = [];
//     }
//     chatRoomClients[chatRoomId].push(ws);

//     // Listen for changes in Firestore for the specific chat room
//     db.collection('chatRooms').doc(chatRoomId).collection('messages')
//         .onSnapshot((snapshot) => {
//             snapshot.docChanges().forEach((change) => {
//                 if (change.type === 'added') {
//                     chatRoomClients[chatRoomId].forEach(client => {
//                         client.send(JSON.stringify(change.doc.data()));
//                     });
//                 }
//             });
//         });

//     ws.on('close', () => {
//         console.log('Client disconnected');
//         // Remove the client from the list
//         chatRoomClients[chatRoomId] = chatRoomClients[chatRoomId].filter(client => client !== ws);
//     });
// });
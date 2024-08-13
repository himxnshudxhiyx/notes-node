const express = require('express');

const router = express.Router();

const { sendMessage, createChatRoom} = require("../controllers/chat");
const authMiddleware = require('../middleware/authMiddleware');

router.route('/sendMessage').post(authMiddleware,  sendMessage);   
// router.route('/getMessages').get(authMiddleware, getMessages);
router.route('/createChatRoom').get(authMiddleware, createChatRoom);

module.exports = router;
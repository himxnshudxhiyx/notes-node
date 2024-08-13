const express = require('express');

const router = express.Router();

const { createChatRoom, chatRoomExists} = require("../controllers/chat");
const authMiddleware = require('../middleware/authMiddleware');

router.route('/createChatRoom').post(authMiddleware, createChatRoom);
router.route('/chatRoomExists').post(authMiddleware, chatRoomExists);

module.exports = router;
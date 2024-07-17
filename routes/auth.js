const express = require('express');

const router = express.Router();

const {signup, login, checkUser, verifyEmail} = require("../controllers/auth");
const authMiddleware = require('../middleware/authMiddleware');

router.route('/signUp').post(signup);   
router.route('/login').post(login);
router.route('/checkUser').get(authMiddleware, checkUser);
router.route('/verify-email').get(verifyEmail);

module.exports = router;
// authMiddleware.js

const jwt = require('jsonwebtoken');
const { secretKey } = require('../config'); // Replace with your secret key from config
const Blacklist = require('../models/blacklist');

const authMiddleware = async (req, res, next) => {

    const authToken = req.headers.authorization;
    const blacklistedToken = await Blacklist.findOne({ authToken });
    if (blacklistedToken) {
        return res.status(401).json({ message: 'Token has been revoked', status: 401 });
    }
    if (!authToken) {
        return res.status(401).json({ message: "Authorization token not provided", status: 401 });
    }

    jwt.verify(authToken, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized: Invalid token", status: 401 });
        }
        req.user = decoded.user; // Store user information from token payload in request object
        next();
    });
};

module.exports = authMiddleware;
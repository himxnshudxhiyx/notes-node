// controllers/auth.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../config'); // Replace with your secret key from config
const User = require('../models/user');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Make sure to install nodemailer



const checkUser = async (req, res) => {
    try {
        // Retrieve user information from the request object (populated by authMiddleware)
        const userId = req.user.id; // Adjust based on how the user ID is stored in the token payload

        // Find the user in the database
        const user = await User.findById(userId).select('-password -__v -verified'); // Exclude the password field

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Error checking user details:", err);
        res.status(500).json({ message: "Error checking user details", error: err.message });
    }
};

const signup = async (req, res) => {
    const { username, password, firstName, lastName, phoneNumber } = req.body; // Assuming email is also required

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists", status : 400 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create new user
        const newUser = new User({ username, password: hashedPassword, verificationToken, firstName, lastName, phoneNumber });

        await newUser.validate();
        // Send verification email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'himanshud.dahiya@gmail.com',
                pass: 'vuku rros lpdy qyuj',
            },
        });

        const verificationLink = process.env.DEBUG_MODE === 'true' 
        ? `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`
        : `https://notes-node-rho.vercel.app/api/auth/verify-email?token=${verificationToken}`;


        const mailOptions = {
            from: 'himanshud.dahiya@gmail.com',
            to: newUser.username,
            subject: 'Email Verification',
            text: `Please verify your account by clicking the following link: ${verificationLink}`,
        };

        await transporter.sendMail(mailOptions);
        await newUser.save();

        res.status(201).json({ message: "User registered successfully. Please check your email to verify your account.", status: 201 });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: "Error registering user", error: err.message , status: 500});
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ message: "Invalid verification token" });
        }

        user.verified = true;
        user.verificationToken = undefined; // Clear the token
        await user.save();

        res.status(200).json({ message: "Email verified successfully" });
    } catch (err) {
        console.error("Error verifying email:", err);
        res.status(500).json({ message: "Error verifying email", error: err.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const userWithPassword = await User.findOne({ username });
        if (!userWithPassword) {
            return res.status(404).json({ message: "User not found" , status: 400});
        }

        // Check if user is verified
        if (!userWithPassword.verified) {
            return res.status(403).json({ message: "Please verify your account to login" , status : 403});
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, userWithPassword.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" , status: 401});
        }

        // Fetch user details without password and __v
        const user = await User.findOne({ username }).select('-password -__v');

        // Generate authToken
        const authToken = jwt.sign({ user: { id: user._id, username: user.username } }, secretKey, { expiresIn: '24h' });

        // Return authToken and user details (excluding password and __v fields)
        res.status(200).json({ authToken, user , 'message': 'Login Successfully', status: 200});
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ message: "Error logging in", error: err.message, status: 500});
    }
};

module.exports = { signup, login, checkUser, verifyEmail };
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const {getAllNotes, updateNote, addNote} = require("../controllers/notes");

router.route('/').get(authMiddleware, getAllNotes);
router.route('/update').post(authMiddleware, updateNote); // New route for updating a product using POST
router.route('/add').post(authMiddleware, addNote); // New route for adding a product using POST

module.exports = router;
const Notes = require("../models/notes");

const getAllNotes = async (req, res) => {
    const userId = req.user.id; // Extract user ID from authenticated request
    try {
        const notes = await Notes.find({ userId });
        const count = await Notes.countDocuments(notes);
        res.status(200).json({ data: notes,'count': count, message: "Notes found successfully" });
    } catch (err) {
        console.error("Error fetching notes:", err);
        res.status(500).json({ message: "Error fetching notes", error: err.message });
    }
};

const updateNote = async (req, res) => {
    const { id, title, description } = req.body;

    try {
        const updatedNote = await Notes.findByIdAndUpdate(id, { title, description }, { new: true });

        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.status(200).json({ data: updatedNote, message: "Note updated successfully" });
    } catch (err) {
        console.error("Error updating note:", err);
        res.status(500).json({ message: "Error updating note", error: err.message });
    }
};

const addNote = async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.id; // Extract user ID from authenticated request

    try {
        // Check if a note with the same title already exists for the user
        const existingNote = await Notes.findOne({ userId, title });

        if (existingNote) {
            return res.status(400).json({ message: "Title already exists", status: 400 });
        }

        // Create and save the new note if the title does not exist
        const newNote = new Notes({ userId, title, description });
        await newNote.save();

        res.status(201).json({ message: "Note added successfully" , status: 201});
    } catch (err) {
        console.error("Error adding note:", err);
        res.status(500).json({ message: "Error adding note", error: err.message, status: 500 });
    }
};

const deleteNote = async (req, res) => {
    const { id } = req.body; // Extract note ID from the request body
    const userId = req.user.id; // Extract user ID from the authenticated request

    try {
        // Find and delete the note that matches the userId and note ID
        const result = await Notes.deleteOne({ _id: id, userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Note not found or you don't have permission to delete it", status: 404 });
        }

        res.status(200).json({ message: "Note deleted successfully", status: 200 });
    } catch (err) {
        console.error("Error deleting note:", err);
        res.status(500).json({ message: "Error deleting note", error: err.message, status: 500 });
    }
};

module.exports = { getAllNotes, updateNote, addNote, deleteNote};
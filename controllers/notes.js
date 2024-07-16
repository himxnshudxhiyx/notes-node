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
        const newNote = new Notes({ userId, title, description });
        await newNote.save();

        res.status(201).json({ data: newNote, message: "Note added successfully" });
    } catch (err) {
        console.error("Error adding note:", err);
        res.status(500).json({ message: "Error adding note", error: err.message });
    }
};

module.exports = { getAllNotes, updateNote, addNote};
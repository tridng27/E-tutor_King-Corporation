const timetableService = require('../services/timetableService');
const Class = require('../models/class');

// Get timetables within a date range
const getTimetables = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }
        
        const timetables = await timetableService.getTimetables(startDate, endDate);
        res.status(200).json(timetables);
    } catch (error) {
        console.error("Error fetching timetables:", error);
        res.status(500).json({ message: "Error fetching timetables", error: error.message });
    }
};

// Get a specific timetable by ID
const getTimetableById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const timetable = await timetableService.getTimetableById(id);
        
        if (!timetable) {
            return res.status(404).json({ message: "Timetable not found" });
        }
        
        res.status(200).json(timetable);
    } catch (error) {
        console.error(`Error fetching timetable ${req.params.id}:`, error);
        res.status(500).json({ message: "Error fetching timetable", error: error.message });
    }
};

// Create a new timetable entry
const createTimetable = async (req, res) => {
    try {
        const { ClassID, TimetableDate, TimetableLocation, TimetableSchedule } = req.body;
        
        // Validate required fields
        if (!ClassID || !TimetableDate || !TimetableSchedule) {
            return res.status(400).json({ message: "ClassID, TimetableDate, and TimetableSchedule are required" });
        }
        
        // Verify the class exists
        const classExists = await Class.findByPk(ClassID);
        if (!classExists) {
            return res.status(404).json({ message: "Class not found" });
        }
        
        const newTimetable = await timetableService.createTimetable({
            ClassID,
            TimetableDate,
            TimetableLocation,
            TimetableSchedule
        });
        
        res.status(201).json({
            message: "Timetable created successfully",
            timetable: newTimetable
        });
    } catch (error) {
        console.error("Error creating timetable:", error);
        res.status(500).json({ message: "Error creating timetable", error: error.message });
    }
};

// Update an existing timetable entry
const updateTimetable = async (req, res) => {
    try {
        const { id } = req.params;
        const { ClassID, TimetableDate, TimetableLocation, TimetableSchedule } = req.body;
        
        // Validate required fields
        if (!ClassID || !TimetableDate || !TimetableSchedule) {
            return res.status(400).json({ message: "ClassID, TimetableDate, and TimetableSchedule are required" });
        }
        
        // Verify the class exists
        const classExists = await Class.findByPk(ClassID);
        if (!classExists) {
            return res.status(404).json({ message: "Class not found" });
        }
        
        // Check if timetable exists
        const timetableExists = await timetableService.getTimetableById(id);
        if (!timetableExists) {
            return res.status(404).json({ message: "Timetable not found" });
        }
        
        const updatedTimetable = await timetableService.updateTimetable(id, {
            ClassID,
            TimetableDate,
            TimetableLocation,
            TimetableSchedule
        });
        
        res.status(200).json({
            message: "Timetable updated successfully",
            timetable: updatedTimetable
        });
    } catch (error) {
        console.error(`Error updating timetable ${req.params.id}:`, error);
        res.status(500).json({ message: "Error updating timetable", error: error.message });
    }
};

// Delete a timetable entry
const deleteTimetable = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if timetable exists
        const timetableExists = await timetableService.getTimetableById(id);
        if (!timetableExists) {
            return res.status(404).json({ message: "Timetable not found" });
        }
        
        await timetableService.deleteTimetable(id);
        
        res.status(200).json({
            message: "Timetable deleted successfully"
        });
    } catch (error) {
        console.error(`Error deleting timetable ${req.params.id}:`, error);
        res.status(500).json({ message: "Error deleting timetable", error: error.message });
    }
};

// Get timetables for a specific class
const getTimetablesByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }
        
        // Verify the class exists
        const classExists = await Class.findByPk(classId);
        if (!classExists) {
            return res.status(404).json({ message: "Class not found" });
        }
        
        const timetables = await timetableService.getTimetablesByClass(classId, startDate, endDate);
        res.status(200).json(timetables);
    } catch (error) {
        console.error(`Error fetching timetables for class ${req.params.classId}:`, error);
        res.status(500).json({ message: "Error fetching timetables", error: error.message });
    }
};

// Get timetables for a specific tutor
const getTimetablesByTutor = async (req, res) => {
    try {
        const { tutorId } = req.params;
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }
        
        const timetables = await timetableService.getTimetablesByTutor(tutorId, startDate, endDate);
        res.status(200).json(timetables);
    } catch (error) {
        console.error(`Error fetching timetables for tutor ${req.params.tutorId}:`, error);
        res.status(500).json({ message: "Error fetching timetables", error: error.message });
    }
};

module.exports = {
    getTimetables,
    getTimetableById,
    createTimetable,
    updateTimetable,
    deleteTimetable,
    getTimetablesByClass,
    getTimetablesByTutor
};

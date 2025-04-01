const { Subject } = require("../models");

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll();
    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ 
      message: "Error fetching subjects", 
      error: error.message 
    });
  }
};

// Get subject by ID
exports.getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByPk(id);
    
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    res.status(200).json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    res.status(500).json({ 
      message: "Error fetching subject", 
      error: error.message 
    });
  }
};

// Create a new subject
exports.createSubject = async (req, res) => {
  try {
    const { SubjectName } = req.body;
    
    if (!SubjectName) {
      return res.status(400).json({ message: "Subject name is required" });
    }
    
    // Check if subject with same name already exists
    const existingSubject = await Subject.findOne({
      where: { SubjectName }
    });
    
    if (existingSubject) {
      return res.status(400).json({ message: "A subject with this name already exists" });
    }
    
    const newSubject = await Subject.create({
      SubjectName
    });
    
    res.status(201).json({
      message: "Subject created successfully",
      subject: newSubject
    });
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({ 
      message: "Error creating subject", 
      error: error.message 
    });
  }
};

// Update a subject
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { SubjectName } = req.body;
    
    const subject = await Subject.findByPk(id);
    
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    // Check if new name conflicts with existing subject
    if (SubjectName && SubjectName !== subject.SubjectName) {
      const existingSubject = await Subject.findOne({
        where: { SubjectName }
      });
      
      if (existingSubject) {
        return res.status(400).json({ message: "A subject with this name already exists" });
      }
    }
    
    await subject.update({
      SubjectName: SubjectName || subject.SubjectName
    });
    
    res.status(200).json({
      message: "Subject updated successfully",
      subject
    });
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({ 
      message: "Error updating subject", 
      error: error.message 
    });
  }
};

// Delete a subject
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subject = await Subject.findByPk(id);
    
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    await subject.destroy();
    
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({ 
      message: "Error deleting subject", 
      error: error.message 
    });
  }
};

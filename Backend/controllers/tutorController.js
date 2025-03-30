const { Tutor, User, Student, Resource } = require("../models");
const { Op } = require("sequelize");

// Lấy danh sách gia sư (Chỉ admin)
exports.getAllTutors = async (req, res) => {
    try {
        const tutors = await Tutor.findAll();
        res.status(200).json(tutors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tutors", error: error.message });
    }
};

// Thêm gia sư (Chỉ admin)
exports.createTutor = async (req, res) => {
    try {
        const { userId, fix } = req.body;

        // Kiểm tra nếu tutor đã tồn tại
        const existingTutor = await Tutor.findOne({ where: { userId } });
        if (existingTutor) {
            return res.status(400).json({ message: "Tutor already exists" });
        }

        const newTutor = await Tutor.create({ userId, fix });
        res.status(201).json({ message: "Tutor created successfully", tutor: newTutor });
    } catch (error) {
        res.status(500).json({ message: "Creation failed", error: error.message });
    }
};

// Xóa gia sư (Chỉ admin)
exports.deleteTutor = async (req, res) => {
    try {
        const { id } = req.params;

        // Chỉ admin có quyền xóa
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized access!" });
        }

        const tutor = await Tutor.findByPk(id);
        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        await tutor.destroy();
        res.status(200).json({ message: "Tutor deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};

// Get tutor profile
exports.getTutorProfile = async (req, res) => {
    try {
        const tutorId = req.user.TutorID;
        
        const tutor = await Tutor.findByPk(tutorId, {
            include: [
                {
                    model: User,
                    attributes: ['Name', 'Email', 'Role']
                }
            ]
        });
        
        if (!tutor) {
            return res.status(404).json({ message: "Tutor profile not found" });
        }
        
        res.status(200).json(tutor);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tutor profile", error: error.message });
    }
};

// Update tutor profile
exports.updateTutorProfile = async (req, res) => {
    try {
        const tutorId = req.user.TutorID;
        const { fix } = req.body;
        
        const tutor = await Tutor.findByPk(tutorId);
        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }
        
        await tutor.update({ fix });
        
        res.status(200).json({ message: "Profile updated successfully", tutor });
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};

// Get students assigned to tutor
exports.getMyStudents = async (req, res) => {
    try {
        const tutorId = req.user.TutorID;
        
        // This is a placeholder - you'll need to adjust based on your actual database schema
        // Assuming there's a Class model that links tutors to students
        const students = await Student.findAll({
            include: [
                {
                    model: User,
                    attributes: ['Name', 'Email']
                },
                {
                    model: Class,
                    where: { TutorID: tutorId }
                }
            ]
        });
        
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: "Error fetching students", error: error.message });
    }
};

// Get resources created by tutor
exports.getTutorResources = async (req, res) => {
    try {
        const tutorId = req.user.TutorID;
        
        const resources = await Resource.findAll({
            where: { TutorID: tutorId },
            order: [['UploadDate', 'DESC']]
        });
        
        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ message: "Error fetching resources", error: error.message });
    }
};

// Create a new resource
exports.createResource = async (req, res) => {
    try {
        const tutorId = req.user.TutorID;
        const { name, description } = req.body;
        
        // Handle file upload if present
        let filePath = null;
        if (req.file) {
            filePath = req.file.path;
        }
        
        const newResource = await Resource.create({
            TutorID: tutorId,
            Name: name,
            Description: description,
            FilePath: filePath,
            UploadDate: new Date()
        });
        
        res.status(201).json({ 
            message: "Resource created successfully", 
            resource: newResource 
        });
    } catch (error) {
        res.status(500).json({ message: "Resource creation failed", error: error.message });
    }
};

// Update an existing resource
exports.updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        const resource = await Resource.findByPk(id);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }
        
        // Update resource data
        const updateData = {
            Name: name,
            Description: description
        };
        
        // Handle file upload if present
        if (req.file) {
            updateData.FilePath = req.file.path;
        }
        
        await resource.update(updateData);
        
        res.status(200).json({ 
            message: "Resource updated successfully", 
            resource 
        });
    } catch (error) {
        res.status(500).json({ message: "Resource update failed", error: error.message });
    }
};

// Delete a resource
exports.deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        
        const resource = await Resource.findByPk(id);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }
        
        await resource.destroy();
        
        res.status(200).json({ message: "Resource deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Resource deletion failed", error: error.message });
    }
};

// Get a specific resource by ID
exports.getResourceById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const resource = await Resource.findByPk(id, {
            include: [
                {
                    model: Tutor,
                    include: [
                        {
                            model: User,
                            attributes: ['Name']
                        }
                    ]
                }
            ]
        });
        
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }
        
        // Add tutor name to the response for easier display
        const resourceWithTutorName = {
            ...resource.toJSON(),
            TutorName: resource.Tutor?.User?.Name || 'Unknown'
        };
        
        res.status(200).json(resourceWithTutorName);
    } catch (error) {
        res.status(500).json({ message: "Error fetching resource", error: error.message });
    }
};

// Download a resource
exports.downloadResource = async (req, res) => {
    try {
        const { id } = req.params;
        
        const resource = await Resource.findByPk(id);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }
        
        if (!resource.FilePath) {
            return res.status(404).json({ message: "No file available for this resource" });
        }
        
        // Send the file for download
        res.download(resource.FilePath, `${resource.Name}.pdf`, (err) => {
            if (err) {
                res.status(500).json({ message: "Error downloading file", error: err.message });
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Download failed", error: error.message });
    }
};

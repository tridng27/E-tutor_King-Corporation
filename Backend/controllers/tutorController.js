const { Tutor, User, Student, Resource, Class, Subject } = require("../models");
const sequelize = require("../config/Database");
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
exports.updateTutor = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      // 1. Lấy UserID từ URL parameter và validate
      const userID = parseInt(req.params.UserID);
      if (isNaN(userID)) {
        await transaction.rollback();
        return res.status(400).json({ message: "UserID phải là số" });
      }
  
      // 2. Lấy dữ liệu cập nhật từ body
      const { Name, Email, Gender } = req.body;
  
      // 3. Tìm và cập nhật thông tin
      const user = await User.findOne({
        where: { 
          UserID: userID, 
          Role: "Tutor" 
        },
        include: [{
          model: Tutor,
          attributes: ['TutorID']
        }],
        transaction
      });
  
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({ message: "Không tìm thấy gia sư." });
      }
  
      // Cập nhật thông tin User
      await user.update({
        Name: Name || user.Name,
        Email: Email || user.Email,
        Gender: Gender || user.Gender
      }, { transaction });
  
      // Cập nhật thông tin Tutor (nếu có)
      if (user.Tutor) {
        await Tutor.update({
          Subjects: Subjects || user.Tutor.Subjects,
          Fix: Fix || user.Tutor.Fix
        }, {
          where: { TutorID: user.Tutor.TutorID },
          transaction
        });
      }
  
      await transaction.commit();
      
      // 4. Trả về response
      const updatedTutor = await User.findByPk(userID, {
        include: [{
          model: Tutor,
          attributes: ['TutorID', 'Fix']
        }],
        attributes: ['UserID', 'Name', 'Email', 'Gender', 'RegisterDate']
      });
  
      res.json({
        message: "Cập nhật thông tin gia sư thành công!",
        tutor: updatedTutor
      });
    } catch (error) {
      await transaction.rollback();
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: "Email đã tồn tại." });
      }
      
      console.error("Lỗi khi cập nhật thông tin gia sư:", error);
      res.status(500).json({ 
        error: "Lỗi server",
        details: error.message 
      });
    }
};

// Get classes assigned to the logged-in tutor
exports.getTutorClasses = async (req, res) => {
    try {
        // Get the tutor ID from the authenticated user
        const tutorUser = await Tutor.findOne({ 
            where: { UserID: req.user.UserID }
        });
        
        if (!tutorUser) {
            return res.status(404).json({ message: "Tutor profile not found" });
        }
        
        // Find all classes where this tutor is assigned
        const classes = await Class.findAll({
            where: { TutorID: tutorUser.TutorID }
        });
        
        res.status(200).json(classes);
    } catch (error) {
        console.error("Error fetching tutor classes:", error);
        res.status(500).json({ 
            message: "Error fetching classes", 
            error: error.message 
        });
    }
};

// Get students assigned to tutor
exports.getMyStudents = async (req, res) => {
    try {
        const tutorUser = await Tutor.findOne({ 
            where: { UserID: req.user.UserID }
        });
        
        if (!tutorUser) {
            return res.status(404).json({ message: "Tutor profile not found" });
        }
        
        // Get students from classes where this tutor is assigned
        const students = await Student.findAll({
            include: [
                {
                    model: User,
                    attributes: ['Name', 'Email', 'Gender']
                },
                {
                    model: Class,
                    where: { TutorID: tutorUser.TutorID },
                    required: true
                }
            ]
        });
        
        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Error fetching students", error: error.message });
    }
};

// Get students for a specific class
exports.getStudentsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const tutorUser = await Tutor.findOne({
            where: { UserID: req.user.UserID }
        });
       
        if (!tutorUser) {
            return res.status(404).json({ message: "Tutor profile not found" });
        }
       
        // Verify the tutor is assigned to this class
        const classRecord = await Class.findOne({
            where: {
                ClassID: classId,
                TutorID: tutorUser.TutorID
            }
        });
       
        if (!classRecord) {
            return res.status(403).json({ message: "You are not authorized to view this class" });
        }
       
        // Get the class with its students
        const classWithStudents = await Class.findByPk(classId, {
            include: [
                {
                    model: Student,
                    include: [
                        {
                            model: User,
                            attributes: ['Name', 'Email', 'Gender', 'Birthdate']
                        }
                    ]
                }
            ]
        });
       
        if (!classWithStudents) {
            return res.status(404).json({ message: "Class not found" });
        }
       
        // Return just the students array
        res.status(200).json(classWithStudents.Students || []);
    } catch (error) {
        console.error("Error fetching students by class:", error);
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

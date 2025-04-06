const User = require("../models/user");
const Student = require("../models/student");
const Tutor = require("../models/tutor");
const Class = require("../models/class");
const bcrypt = require("bcrypt");
const { sendClassAssignmentNotification } = require('../services/emailService');

// 🔥 Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ 
            attributes: { exclude: ["Password"] }
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// 🔥 Lấy danh sách người dùng chờ duyệt (Role = null or 'Pending')
exports.getPendingUsers = async (req, res) => {
    try {
        console.log("Attempting to fetch pending users...");
        
        // Check what values are allowed in your Role enum
        const pendingUsers = await User.findAll({
            where: { Role: null }, // Changed from 'Pending' to null
            attributes: ['UserID', 'Email', 'Name', 'RegisterDate', 'RequestedRole']
        });
        
        console.log("Pending users fetched successfully:", pendingUsers.length);
        res.status(200).json(pendingUsers);
    } catch (error) {
        console.error("Error in getPendingUsers:", error);
        res.status(500).json({
            message: "Error fetching pending users",
            error: error.message
        });
    }
};

// 🔥 Phê duyệt người dùng và gán vai trò
exports.assignUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        
        if (!userId || !role) {
            return res.status(400).json({ message: "User ID and role are required" });
        }
        
        // Validate role is one of the allowed values
        if (!["Admin", "Tutor", "Student"].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be Admin, Tutor, or Student" });
        }
        
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Handle role change
        await handleRoleChange(user, role);
        
        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.Password;
        
        res.status(200).json({
            message: `User role updated successfully to ${role}`,
            user: userResponse
        });
    } catch (error) {
        res.status(500).json({ message: "Error assigning user role", error: error.message });
    }
};

// 🔥 Xóa người dùng (Chỉ Admin)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If user is a Student or Tutor, delete those records first
        if (user.Role === "Student") {
            await Student.destroy({ where: { UserID: user.UserID } });
        } else if (user.Role === "Tutor") {
            await Tutor.destroy({ where: { UserID: user.UserID } });
        }

        await user.destroy();
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};

// Helper function to handle role changes
async function handleRoleChange(user, newRole) {
    const oldRole = user.Role;
    
    // If user already has a role, clean up old role data
    if (oldRole === "Student") {
        await Student.destroy({ where: { UserID: user.UserID } });
    } else if (oldRole === "Tutor") {
        await Tutor.destroy({ where: { UserID: user.UserID } });
    }
    
    // Set the new role
    user.Role = newRole;
    await user.save();
    
    // Create corresponding records based on new role
    if (newRole === "Student") {
        await Student.create({
            UserID: user.UserID,
            Role: "Regular" // Default role for students
        });
    } else if (newRole === "Tutor") {
        await Tutor.create({
            UserID: user.UserID,
            Fix: "General" // Default specialization
        });
    }
    
    return user;
}

// 🔥 Get all tutors
exports.getAllTutors = async (req, res) => {
    try {
        const tutors = await Tutor.findAll({
            include: [{
                model: User,
                attributes: ['UserID', 'Name', 'Email', 'Gender', 'Birthdate']
            }]
        });
        res.status(200).json(tutors);
    } catch (error) {
        console.error("Error in getAllTutors:", error);
        res.status(500).json({ 
            message: "Error fetching tutors", 
            error: error.message 
        });
    }
};

// 🔥 Get tutor by ID
exports.getTutorById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const tutor = await Tutor.findByPk(id, {
            include: [{
                model: User,
                attributes: ['UserID', 'Name', 'Email', 'Gender', 'Birthdate']
            }]
        });
        
        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }
        
        res.status(200).json(tutor);
    } catch (error) {
        console.error("Error in getTutorById:", error);
        res.status(500).json({ 
            message: "Error fetching tutor", 
            error: error.message 
        });
    }
};

// 🔥 Update tutor
exports.updateTutor = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            Name, Email, Gender, Birthdate, 
            Specialization, Description 
        } = req.body;
        
        // Find the tutor
        const tutor = await Tutor.findByPk(id, {
            include: [{ model: User }]
        });
        
        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }
        
        // Update User information
        if (tutor.User) {
            await tutor.User.update({
                Name: Name || tutor.User.Name,
                Email: Email || tutor.User.Email,
                Gender: Gender || tutor.User.Gender,
                Birthdate: Birthdate || tutor.User.Birthdate
            });
        }
        
        // Update Tutor-specific information
        await tutor.update({
            Fix: Specialization || tutor.Fix,
            Description: Description || tutor.Description
        });
        
        // Fetch the updated tutor with user info
        const updatedTutor = await Tutor.findByPk(id, {
            include: [{
                model: User,
                attributes: ['UserID', 'Name', 'Email', 'Gender', 'Birthdate']
            }]
        });
        
        res.status(200).json({
            message: "Tutor updated successfully",
            tutor: updatedTutor
        });
    } catch (error) {
        console.error("Error in updateTutor:", error);
        res.status(500).json({ 
            message: "Error updating tutor", 
            error: error.message 
        });
    }
};

// 🔥 Delete tutor
exports.deleteTutor = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the tutor
        const tutor = await Tutor.findByPk(id);
        
        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }
        
        // Get the UserID before deleting the tutor
        const userId = tutor.UserID;
        
        // Delete the tutor record
        await tutor.destroy();
        
        // Find the user
        const user = await User.findByPk(userId);
        
        if (user) {
            // Either delete the user or change their role
            // Option 1: Delete the user
            await user.destroy();
            
            // Option 2: Change role to null (pending)
            // await user.update({ Role: null });
        }
        
        res.status(200).json({ message: "Tutor deleted successfully" });
    } catch (error) {
        console.error("Error in deleteTutor:", error);
        res.status(500).json({ 
            message: "Error deleting tutor", 
            error: error.message 
        });
    }
};

// 🔥 Get classes without a tutor
exports.getClassesWithoutTutor = async (req, res) => {
    try {
        // Find classes where TutorID is null
        const classes = await Class.findAll({
            where: {
                TutorID: null
            }
        });
        
        res.status(200).json(classes);
    } catch (error) {
        console.error("Error in getClassesWithoutTutor:", error);
        res.status(500).json({ 
            message: "Error fetching classes without tutor", 
            error: error.message 
        });
    }
};

// 🔥 Assign tutor to class
exports.assignTutorToClass = async (req, res) => {
    try {
        const { classId, tutorId } = req.params;
       
        // Find the class
        const classRecord = await Class.findByPk(classId);
       
        if (!classRecord) {
            return res.status(404).json({ message: "Class not found" });
        }
       
        // Check if class already has a tutor
        if (classRecord.TutorID) {
            return res.status(400).json({
                message: "Class already has a tutor assigned. Only one tutor per class is allowed."
            });
        }
       
        // Find the tutor
        const tutor = await Tutor.findByPk(tutorId, {
            include: [{ model: User }]  // Include User model to get email
        });
       
        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }
               
        // Assign tutor to class
        await classRecord.update({ TutorID: tutorId });
        
        // Send email notification if tutor has a user with email
        if (tutor.User && tutor.User.Email) {
            try {
                await sendClassAssignmentNotification(
                    tutor.User, 
                    classRecord.Name.trim(), // Trim whitespace from class name
                    'Tutor'
                );
                console.log(`Email notification sent to tutor ${tutor.User.Email}`);
            } catch (emailError) {
                console.error("Error sending email notification:", emailError);
                // Continue with the response even if email fails
            }
        }
               
        res.status(200).json({
            message: "Tutor assigned to class successfully. Email notification sent.",
            class: classRecord
        });
    } catch (error) {
        console.error("Error in assignTutorToClass:", error);
        res.status(500).json({
            message: "Error assigning tutor to class",
            error: error.message
        });
    }
};

        
        // 🔥 Remove tutor from class
        exports.removeTutorFromClass = async (req, res) => {
            try {
                const { classId, tutorId } = req.params;
                
                // Find the class
                const classRecord = await Class.findByPk(classId);
                
                if (!classRecord) {
                    return res.status(404).json({ message: "Class not found" });
                }
                
                // Check if the class has the specified tutor
                if (classRecord.TutorID != tutorId) {
                    return res.status(400).json({ 
                        message: "This tutor is not assigned to this class" 
                    });
                }
                
                // Remove tutor from class
                await classRecord.update({ TutorID: null });
                
                res.status(200).json({
                    message: "Tutor removed from class successfully",
                    class: classRecord
                });
            } catch (error) {
                console.error("Error in removeTutorFromClass:", error);
                res.status(500).json({ 
                    message: "Error removing tutor from class", 
                    error: error.message 
                });
            }
        };
        
        // 🔥 Get classes by tutor
        exports.getClassesByTutor = async (req, res) => {
            try {
                const { tutorId } = req.params;
                
                // Find classes assigned to this tutor
                const classes = await Class.findAll({
                    where: {
                        TutorID: tutorId
                    }
                });
                
                res.status(200).json(classes);
            } catch (error) {
                console.error("Error in getClassesByTutor:", error);
                res.status(500).json({ 
                    message: "Error fetching classes by tutor", 
                    error: error.message 
                });
            }
        };
        

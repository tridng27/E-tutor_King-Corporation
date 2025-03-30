const User = require("../models/user");
const Student = require("../models/student");
const Tutor = require("../models/tutor");
const bcrypt = require("bcrypt");

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
            attributes: ['UserID', 'Email', 'Name', 'RegisterDate']
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

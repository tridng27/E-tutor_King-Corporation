const { User } = require("../models");
const { Op } = require("sequelize");

// Search users for direct messaging
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        
        console.log("Search query received:", query);
        console.log("Current user:", req.user); // Log the entire user object
        
        if (!query) {
            return res.status(400).json({ 
                success: false,
                message: "Search query is required",
                data: []
            });
        }
        
        // Build the where clause
        let whereClause = {
            [Op.or]: [
                { Name: { [Op.like]: `%${query}%` } },
                { Email: { [Op.like]: `%${query}%` } }
            ]
        };
        
        // Only add the user exclusion if we have a valid user ID
        if (req.user && req.user.UserID) {
            whereClause = {
                [Op.and]: [
                    whereClause,
                    { UserID: { [Op.ne]: req.user.UserID } }
                ]
            };
            console.log("Excluding current user ID:", req.user.UserID);
        } else {
            console.log("No user ID found in request, not excluding any users");
        }
        
        // Search users by name or email
        const users = await User.findAll({
            where: whereClause,
            attributes: ['UserID', 'Name', 'Email', 'Role'],
            limit: 10
        });
        
        console.log("Search results:", users.length, "users found");
        
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("Error in searchUsers:", error);
        res.status(500).json({
            success: false,
            message: "Error searching users",
            error: error.message,
            data: []
        });
    }
};

// In userController.js
exports.testUserSearch = async (req, res) => {
    try {
        const users = await User.findAll({
            limit: 5
        });
        
        res.status(200).json({
            success: true,
            message: "Test query executed",
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error in test query", 
            error: error.message
        });
    }
};

// Lấy danh sách người dùng (Chỉ admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// Lấy thông tin người dùng theo ID (Admin hoặc chính chủ)
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Chỉ cho phép admin hoặc chính user truy cập
        if (req.user.role !== "admin" && req.user.userId != id) {
            return res.status(403).json({ message: "Unauthorized access!" });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error: error.message });
    }
};

// Cập nhật thông tin người dùng (Chỉ admin hoặc chính chủ)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        // Chỉ admin hoặc chính chủ mới có quyền cập nhật
        if (req.user.role !== "admin" && req.user.userId != id) {
            return res.status(403).json({ message: "Unauthorized access!" });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Cập nhật dữ liệu
        user.name = name || user.name;
        user.email = email || user.email;
        await user.save();

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};

// Xóa người dùng (Chỉ admin)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Chỉ admin mới có quyền xóa
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized access!" });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.destroy();
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};

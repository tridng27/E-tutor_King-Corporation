const { User, Meeting, Notification, Document, Blog, Comment } = require("../models");
const bcrypt = require("bcrypt");

// Middleware kiểm tra quyền Admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized access! Only admins are allowed." });
    }
    next();
};

// 🔥 Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ["password"] } });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// 🔥 Thêm Admin mới
exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Kiểm tra nếu Admin đã tồn tại
        const existingAdmin = await User.findOne({ where: { email, role: "admin" } });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo Admin mới
        const newAdmin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin"
        });

        res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
    } catch (error) {
        res.status(500).json({ message: "Error creating admin", error: error.message });
    }
};

// 🔥 Chỉnh sửa thông tin người dùng (Chỉ Admin)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Cập nhật thông tin
        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        await user.save();

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
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

        await user.destroy();
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};

// 🔥 Lấy danh sách tất cả Meetings
exports.getAllMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.findAll();
        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching meetings", error: error.message });
    }
};

// 🔥 Lấy danh sách tất cả Notifications
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll();
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
};

// 🔥 Lấy danh sách tất cả Documents
exports.getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.findAll();
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: "Error fetching documents", error: error.message });
    }
};

// 🔥 Lấy danh sách tất cả Blogs
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.findAll();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blogs", error: error.message });
    }
};

// 🔥 Lấy danh sách tất cả Comments
exports.getAllComments = async (req, res) => {
    try {
        const comments = await Comment.findAll();
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments", error: error.message });
    }
};
